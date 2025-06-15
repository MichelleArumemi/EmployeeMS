import express from "express";
import { getDB } from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ObjectId } from 'mongodb';

const router = express.Router();

// Employee Signup (public)
router.post("/employeesignup", async (req, res) => {
  const { name, email, password, position } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ 
      signupStatus: false, 
      error: "Name, email, and password are required" 
    });
  }
  try {
    const db = getDB();
    const existingUser = await db.collection("employees").findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        signupStatus: false, 
        error: "Email already exists" 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newEmployee = {
      name,
      email,
      password: hashedPassword,
      role: 'employee',
      position: position || '',
      createdAt: new Date()
    };
    const result = await db.collection("employees").insertOne(newEmployee);
    const token = jwt.sign(
      { role: "employee", email, id: result.insertedId },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.cookie("jwt", token, { 
      httpOnly: true, 
      maxAge: 3600000, 
      secure: process.env.NODE_ENV === 'production' 
    });
    return res.status(201).json({ 
      signupStatus: true, 
      message: "Employee account created successfully", 
      employee: { 
        id: result.insertedId, 
        name, 
        email, 
        role: 'employee', 
        position: position || '' 
      } 
    });
  } catch (err) {
    console.error("Error during signup:", err);
    return res.status(500).json({ 
      signupStatus: false, 
      error: "Internal Server Error" 
    });
  }
});

// Employee Login (public)
router.post("/employeelogin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const db = getDB();
    const user = await db.collection("employees").findOne({ email });
    if (user) {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        const token = jwt.sign(
          { role: "employee", email: user.email, id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );
        res.cookie("jwt", token, { httpOnly: true, maxAge: 3600000, secure: process.env.NODE_ENV === 'production' });
        // Return a consistent response for frontend
        return res.status(200).json({
          success: true,
          loginStatus: true,
          message: "You are logged in",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            position: user.position || ''
          },
          role: user.role
        });
      } else {
        return res.status(401).json({
          success: false,
          loginStatus: false,
          message: "Incorrect Email or Password"
        });
      }
    } else {
      return res.status(404).json({
        success: false,
        loginStatus: false,
        message: "User not found"
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      loginStatus: false,
      message: "Internal Server Error"
    });
  }
});

// Employee Auth Verification (public)
router.get("/verify", async (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).json({ 
      Status: false, 
      message: "No token provided" 
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const db = getDB();
    const user = await db.collection("employees").findOne(
      { _id: new ObjectId(decoded.id) },
      { projection: { password: 0 } }
    );
    if (!user) {
      return res.status(404).json({ 
        Status: false, 
        message: "User not found" 
      });
    }
    return res.status(200).json({ 
      Status: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        position: user.position 
      },
      role: user.role 
    });
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(403).json({ 
      Status: false, 
      message: "Invalid token" 
    });
  }
});

// Employee Logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  return res.json({ Status: true });
});

// Get employee details by ID
router.get("/detail/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const db = getDB();
    const employee = await db.collection("employees").findOne({ _id: new ObjectId(id) });
    if (employee) {
      return res.json({ success: true, Result: [employee] });
    } else {
      return res.json({ success: false, message: "Employee not found" });
    }
  } catch (error) {
    console.error("Error fetching employee:", error);
    return res.json({ success: false, message: "Failed to fetch employee" });
  }
});

// Route to check if employee is currently clocked in
router.get("/employee_is_clocked_in/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDB(); // Get database instance
    
    // Check if there is a clock-in record without a corresponding clock-out time
    const clockRecord = await db.collection("clock_records").findOne({
      employee_id: new ObjectId(id),
      clock_out: null
    });

    // Send success response with clock-in status
    return res.status(200).json({ clockedIn: clockRecord !== null });
  } catch (error) {
    console.error("Error while checking clock-in status:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

// Route to handle employee clock-in
router.post("/employee_clockin/:id", async (req, res) => {
  const { id } = req.params;
  const { location, work_from_type } = req.body;

  try {
    const db = getDB(); // Get database instance
    
    // Insert clock-in record into the database
    const clockRecord = {
      employee_id: new ObjectId(id),
      clock_in: new Date(),
      location: location,
      work_from_type: work_from_type,
      clock_out: null
    };

    await db.collection("clock_records").insertOne(clockRecord);

    // Send success response
    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Error while clocking in:", error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal Server Error" });
  }
});

// Route to handle employee clock-out
router.post("/employee_clockout/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const db = getDB(); // Get database instance
    
    // Update the clock-out time for the employee
    await db.collection("clock_records").updateOne(
      { 
        employee_id: new ObjectId(id), 
        clock_out: null 
      },
      { 
        $set: { clock_out: new Date() } 
      }
    );

    // Send success response
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error while clocking out:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
});

// Route to fetch calendar data for a specific employee
router.get("/calendar/:employeeId", async (req, res) => {
  const { employeeId } = req.params;

  try {
    const db = getDB(); // Get database instance
    
    // Fetch clock records for the employee from the database
    const clockRecords = await db.collection("clock_records")
      .find({ employee_id: new ObjectId(employeeId) })
      .toArray();

    // Process the result and format the data as needed
    const calendarData = clockRecords.map((record) => {
      // Extract date from timestamp and format it as 'YYYY-MM-DD'
      const date = record.clock_in.toISOString().slice(0, 10);
      // Get day name from the date
      const dayName = new Date(record.clock_in).toLocaleDateString("en-US", {
        weekday: "long",
      });

      return {
        date: date,
        dayName: dayName,
        clockIn: record.clock_in,
        clockOut: record.clock_out,
        location: record.location,
        workFromType: record.work_from_type,
      };
    });

    // Send success response with formatted calendar data
    res.status(200).json({ success: true, calendarData });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Define a route to get category by ID
router.get("/category/:id", async (req, res) => {
  const categoryId = req.params.id;

  try {
    const db = getDB(); // Get database instance
    
    const category = await db.collection("categories").findOne({ 
      _id: new ObjectId(categoryId) 
    });

    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: "Category not found" });
    }
    res.status(200).json({ success: true, category: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route to get office location data
router.get("/office_location", async (req, res) => {
  try {
    const db = getDB(); // Get database instance
    
    const officeLocations = await db.collection("office_locations").find({}).toArray();
    res.status(200).json({ success: true, officeLocations: officeLocations });
  } catch (error) {
    console.error("Error fetching office locations:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route to add a new office location
router.post("/office_location", async (req, res) => {
  const { name, latitude, longitude, address } = req.body;

  try {
    const db = getDB(); // Get database instance
    
    const newLocation = {
      name: name,
      latitude: latitude,
      longitude: longitude,
      address: address,
      createdAt: new Date()
    };

    const result = await db.collection("office_locations").insertOne(newLocation);
    
    // Return the inserted document with its new _id
    const insertedLocation = { ...newLocation, _id: result.insertedId };

    res.status(201).json({ success: true, officeLocation: insertedLocation });
  } catch (error) {
    console.error("Error adding office location:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route to delete an office location by ID
router.delete("/office_location/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const db = getDB(); // Get database instance
    
    await db.collection("office_locations").deleteOne({ 
      _id: new ObjectId(id) 
    });
    res
      .status(200)
      .json({ success: true, message: "Office location deleted successfully" });
  } catch (error) {
    console.error("Error deleting office location:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Route to fetch all employees
router.get("/employee/list", async (req, res) => {
  try {
    const db = getDB(); // Get database instance
    
    // Fetch all employees from the database
    const employees = await db.collection("employees")
      .find({}, { projection: { _id: 1, name: 1, role: 1 } })
      .toArray();

    // Convert _id to id for compatibility
    const formattedEmployees = employees.map(emp => ({
      id: emp._id,
      name: emp.name,
      role: emp.role
    }));

    // Send the response with the list of employees
    res.status(200).json({ success: true, employees: formattedEmployees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export { router as employeeRouter };