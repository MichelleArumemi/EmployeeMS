import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import File from "../models/File.js";
import { connectDB, getDB } from "../utils/db.js";

dotenv.config();
const router = express.Router();

// Security Middlewares
router.use(helmet());
router.use(mongoSanitize());

// Constants
const ROLES = {
  ADMIN: "admin",
  EMPLOYEE: "employee",
};

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { success: false, error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/images';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, gif, webp) are allowed!'));
    }
  }
});

// Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies?.jwt || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, error: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: "Invalid token" });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: "Token expired" });
    }
    
    return res.status(401).json({ success: false, error: "Authentication failed" });
  }
};

// Authorization Middleware
const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        error: "Insufficient permissions for this operation" 
      });
    }
    
    next();
  };
};

// Database Connection Check Middleware
const ensureDBConnection = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
    next();
  } catch (error) {
    console.error("Database connection error:", error);
    return res.status(503).json({ 
      success: false, 
      error: "Database service unavailable" 
    });
  }
};

// Apply DB connection check to all routes
router.use(ensureDBConnection);

// ==================== AUTH ROUTES ====================

// Admin Signup Route
router.post("/adminsignup", [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('role')
    .isIn(Object.values(ROLES))
    .withMessage('Invalid role specified')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array(),
      message: "Validation failed"
    });
  }

  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        error: "User with this email already exists" 
      });
    }

    // Create new user
    const newUser = await User.create({ 
      name: name.trim(), 
      email: email.toLowerCase(), 
      password: password.trim(),
      role 
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.role,
        email: newUser.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set HTTP-only cookie for auto-login after signup
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(201).json({ 
      success: true, 
      message: "User created successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error("Signup error:", err);
    
    if (err.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        error: "Email already registered" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "Failed to create user account" 
    });
  }
});

// Admin Login Route
router.post("/adminlogin", authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array(),
      message: "Invalid input data"
    });
  }

  try {
    const { email, password } = req.body;
    
    // Find admin user
    const admin = await User.findOne({ 
      email: email.toLowerCase(),
      role: ROLES.ADMIN 
    }).select('+password');

    if (!admin) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials - admin account not found" 
      });
    }

    // Verify password
    const isPasswordValid = await admin.comparePassword(password.trim());
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: "Invalid credentials - incorrect password" 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: admin._id, 
        role: admin.role,
        email: admin.email 
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Set HTTP-only cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.json({ 
      success: true, 
      message: "Login successful",
      data: {
        id: admin._id,
        email: admin.email,
        role: admin.role,
        name: admin.name || admin.email.split('@')[0]
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    
    if (err.name === 'MongooseError' || err.message.includes('timed out')) {
      return res.status(504).json({ 
        success: false, 
        error: "Database connection timeout - please try again" 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      error: "Authentication service temporarily unavailable"
    });
  }
});

// Logout Route
router.post("/logout", (req, res) => {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });
  
  res.json({ 
    success: true, 
    message: "Logged out successfully" 
  });
});

// ==================== PROTECTED ROUTES ====================
// Apply authentication to all routes below
router.use(authenticate);

// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get("/categories", authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const categories = await Category.find()
      .select('name createdAt updatedAt')
      .sort({ name: 1 })
      .lean();
      
    res.json({ 
      success: true, 
      data: categories,
      count: categories.length 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to retrieve categories" 
    });
  }
});

// Create new category
router.post("/categories", authorize([ROLES.ADMIN]), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { name } = req.body;
    
    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } 
    });
    
    if (existingCategory) {
      return res.status(409).json({ 
        success: false, 
        error: "Category with this name already exists" 
      });
    }

    const category = await Category.create({ name: name.trim() });
    
    res.status(201).json({ 
      success: true, 
      message: "Category created successfully",
      data: category 
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to create category" 
    });
  }
});

// ==================== EMPLOYEE ROUTES ====================

// Get all employees
router.get("/employees", authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const employees = await User.find({ role: ROLES.EMPLOYEE })
      .select('-password')
      .populate('category_id', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments({ role: ROLES.EMPLOYEE });

    res.json({ 
      success: true, 
      data: employees,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        limit
      }
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to retrieve employees" 
    });
  }
});

// Create new employee
router.post("/employees", authorize([ROLES.ADMIN]), upload.single("image"), [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('address')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Address must not exceed 200 characters'),
  body('salary')
    .isFloat({ gt: 0 })
    .withMessage('Salary must be a positive number'),
  body('category_id')
    .isMongoId()
    .withMessage('Invalid category ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Clean up uploaded file if validation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { name, email, password, address, salary, category_id } = req.body;
    
    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(409).json({ 
        success: false, 
        error: "Employee with this email already exists" 
      });
    }

    // Verify category exists
    const category = await Category.findById(category_id);
    if (!category) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ 
        success: false, 
        error: "Invalid category selected" 
      });
    }

    // Create employee
    const employee = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: password.trim(),
      address: address?.trim(),
      salary: parseFloat(salary),
      image: req.file?.filename,
      category_id,
      role: ROLES.EMPLOYEE
    });

    // Populate category for response
    await employee.populate('category_id', 'name');

    res.status(201).json({ 
      success: true, 
      message: "Employee created successfully",
      data: {
        id: employee._id,
        name: employee.name,
        email: employee.email,
        address: employee.address,
        salary: employee.salary,
        image: employee.image,
        category: employee.category_id,
        role: employee.role
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error("Error creating employee:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        error: "Employee with this email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to create employee" 
    });
  }
});

// Get all employees (for admin)
router.get('/employees', async (req, res) => {
  try {
    const employees = await Employee.find().select('-password');
    res.json({ success: true, employees });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch employees' });
  }
});

// Get single employee profile + files (for admin)
router.get('/employees/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id).select('-password');
    if (!employee) return res.status(404).json({ success: false, error: 'Employee not found' });
    const files = await File.find({ employeeId: req.params.id });
    res.json({ success: true, employee, files });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch employee profile' });
  }
});

// ==================== ADMIN MANAGEMENT ====================

// Get all admins
router.get("/admins", authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const admins = await User.find({ role: ROLES.ADMIN })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
      
    res.json({ 
      success: true, 
      data: admins,
      count: admins.length 
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to retrieve admin accounts" 
    });
  }
});

// Create new admin
router.post("/admins", authorize([ROLES.ADMIN]), [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }

  try {
    const { email, password, name } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: email.toLowerCase() });
    if (existingAdmin) {
      return res.status(409).json({ 
        success: false, 
        error: "Admin with this email already exists" 
      });
    }
    
    const admin = await User.create({
      email: email.toLowerCase(),
      password: password.trim(),
      name: name?.trim() || email.split('@')[0],
      role: ROLES.ADMIN
    });

    res.status(201).json({ 
      success: true,
      message: "Admin account created successfully", 
      data: { 
        id: admin._id, 
        email: admin.email,
        name: admin.name,
        role: admin.role
      } 
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    
    if (error.code === 11000) {
      return res.status(409).json({ 
        success: false, 
        error: "Admin with this email already exists" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      error: "Failed to create admin account" 
    });
  }
});

// ==================== DASHBOARD ROUTES ====================

// Get dashboard statistics
router.get("/dashboard/stats", authorize([ROLES.ADMIN]), async (req, res) => {
  try {
    const [adminCount, employeeCount, totalSalaryResult, categoryCount] = await Promise.all([
      User.countDocuments({ role: ROLES.ADMIN }),
      User.countDocuments({ role: ROLES.EMPLOYEE }),
      User.aggregate([
        { $match: { role: ROLES.EMPLOYEE, salary: { $exists: true } } },
        { $group: { _id: null, total: { $sum: "$salary" } } }
      ]),
      Category.countDocuments()
    ]);

    const recentEmployees = await User.find({ role: ROLES.EMPLOYEE })
      .select('name email createdAt')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({ 
      success: true, 
      data: {
        counts: {
          admins: adminCount,
          employees: employeeCount,
          categories: categoryCount
        },
        financials: {
          totalSalary: totalSalaryResult[0]?.total || 0,
          averageSalary: employeeCount > 0 ? 
            Math.round((totalSalaryResult[0]?.total || 0) / employeeCount) : 0
        },
        recent: {
          employees: recentEmployees
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to load dashboard statistics" 
    });
  }
});

// ==================== UTILITY ROUTES ====================

// Health check route
router.get("/health", (req, res) => {
  res.json({ 
    success: true, 
    message: "Admin service is running",
    timestamp: new Date().toISOString(),
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Debug route (only in development)
if (process.env.NODE_ENV === 'development') {
  router.get("/debug/check-user/:email", async (req, res) => {
    try {
      const { email } = req.params;
      
      const users = await User.find({ email: email.toLowerCase() });
      const adminUsers = await User.find({ 
        email: email.toLowerCase(), 
        role: ROLES.ADMIN 
      });
      
      res.json({
        email: email.toLowerCase(),
        totalUsers: users.length,
        users: users.map(u => ({
          id: u._id,
          email: u.email,
          role: u.role,
          name: u.name,
          hasPassword: !!u.password,
          createdAt: u.createdAt
        })),
        adminUsers: adminUsers.length,
        constants: {
          ADMIN_ROLE: ROLES.ADMIN,
          EMPLOYEE_ROLE: ROLES.EMPLOYEE
        }
      });
    } catch (error) {
      console.error('Debug route error:', error);
      res.status(500).json({ 
        success: false, 
        error: error.message 
      });
    }
  });
}

// ==================== ERROR HANDLING ====================

// Multer error handler
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false, 
        error: "File size too large. Maximum size is 5MB" 
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        success: false, 
        error: "Too many files. Only one file allowed" 
      });
    }
    return res.status(400).json({ 
      success: false, 
      error: "File upload error: " + err.message 
    });
  }
  
  if (err.message.includes('Only image files')) {
    return res.status(400).json({ 
      success: false, 
      error: err.message 
    });
  }
  
  console.error("Unhandled error in admin routes:", err);
  res.status(500).json({ 
    success: false, 
    error: "Internal server error" 
  });
});

export { router as adminRouter };