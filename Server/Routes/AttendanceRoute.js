import express from "express";
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET / - Get today's attendance summary
router.get("/", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const db = getDB();
    
    // Count employees who clocked in today
    const presentCount = await db.collection("clock_records").countDocuments({
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Get total number of employees
    const totalEmployees = await db.collection("employees").countDocuments({});

    // Calculate absent count
    const absentCount = totalEmployees - presentCount;

    res.status(200).json({ 
      success: true, 
      attendance: {
        present: presentCount,
        absent: absentCount,
        total: totalEmployees
      }
    });
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /detailed - Get detailed attendance for today
router.get("/detailed", async (req, res) => {
  try {
    console.log('Detailed attendance route hit');
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const db = getDB();
    
    // Check if required collections exist
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    const hasClockRecords = collectionNames.includes('clock_records');
    const hasEmployees = collectionNames.includes('employees');
    
    console.log('Available collections:', collectionNames);
    console.log('Has clock_records:', hasClockRecords);
    console.log('Has employees:', hasEmployees);
    
    if (!hasEmployees) {
      return res.status(200).json({ 
        success: true, 
        attendance: {
          present: { count: 0, employees: [] },
          absent: { count: 0, employees: [] },
          total: 0
        },
        message: 'No employees collection found. Create test data first.',
        debug: { collections: collectionNames }
      });
    }
    
    if (!hasClockRecords) {
      // If no clock records collection, all employees are absent
      const allEmployees = await db.collection("employees").find({}).toArray();
      return res.status(200).json({ 
        success: true, 
        attendance: {
          present: { count: 0, employees: [] },
          absent: { count: allEmployees.length, employees: allEmployees },
          total: allEmployees.length
        },
        message: 'No clock_records collection found. All employees marked as absent.',
        debug: { collections: collectionNames }
      });
    }
    
    // Get all clock records for today with employee details
    const presentEmployees = await db.collection("clock_records").aggregate([
      {
        $match: {
          clock_in: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }
      },
      {
        $lookup: {
          from: "employees",
          localField: "employee_id",
          foreignField: "_id",
          as: "employee_id"
        }
      },
      {
        $unwind: {
          path: "$employee_id",
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $sort: { clock_in: 1 }
      }
    ]).toArray();

    console.log('Present employees found:', presentEmployees.length);

    // Get all employees
    const allEmployees = await db.collection("employees").find({}).toArray();
    console.log('Total employees:', allEmployees.length);

    // Find absent employees
    const presentEmployeeIds = presentEmployees.map(record => record.employee_id._id.toString());
    const absentEmployees = allEmployees.filter(emp => 
      !presentEmployeeIds.includes(emp._id.toString())
    );

    res.status(200).json({ 
      success: true, 
      attendance: {
        present: {
          count: presentEmployees.length,
          employees: presentEmployees
        },
        absent: {
          count: absentEmployees.length,
          employees: absentEmployees
        },
        total: allEmployees.length
      },
      debug: {
        collections: collectionNames,
        dateRange: { startOfDay, endOfDay },
        queryResults: {
          clockRecordsToday: presentEmployees.length,
          totalEmployees: allEmployees.length
        }
      }
    });
  } catch (error) {
    console.error("Error fetching detailed attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error", 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET /date/:date - Get attendance for a specific date
router.get("/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format. Use YYYY-MM-DD"
      });
    }

    // Create date range for the specified date
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const db = getDB();
    
    // Count employees who clocked in on the specified date
    const presentCount = await db.collection("clock_records").countDocuments({
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Get total number of employees
    const totalEmployees = await db.collection("employees").countDocuments({});

    const absentCount = totalEmployees - presentCount;

    res.status(200).json({ 
      success: true, 
      attendance: {
        date: date,
        present: presentCount,
        absent: absentCount,
        total: totalEmployees
      }
    });
  } catch (error) {
    console.error("Error fetching attendance data for date:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /clock-in - Employee clock in
router.post("/clock-in", async (req, res) => {
  try {
    const { location, work_from_type } = req.body;
    const employeeId = req.id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const db = getDB();
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Check if user already clocked in today
    const existingRecord = await db.collection("clock_records").findOne({
      employee_id: new ObjectId(employeeId),
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        message: "Already clocked in today"
      });
    }

    // Create new clock record
    const clockRecord = {
      employee_id: new ObjectId(employeeId),
      clock_in: new Date(),
      location: location || 'Office',
      work_from_type: work_from_type || 'office',
      clock_out: null
    };

    await db.collection("clock_records").insertOne(clockRecord);

    res.status(200).json({ 
      success: true,
      message: "Clocked in successfully"
    });
  } catch (error) {
    console.error("Error clocking in:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to clock in" 
    });
  }
});

// POST /clock-out - Employee clock out
router.post("/clock-out", async (req, res) => {
  try {
    const employeeId = req.id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const db = getDB();

    // Update the clock-out time for the employee's current session
    const result = await db.collection("clock_records").updateOne(
      { 
        employee_id: new ObjectId(employeeId), 
        clock_out: null 
      },
      { 
        $set: { clock_out: new Date() } 
      }
    );

    if (result.matchedCount === 0) {
      return res.status(400).json({
        success: false,
        message: "No active clock-in session found"
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Clocked out successfully"
    });
  } catch (error) {
    console.error("Error clocking out:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to clock out" 
    });
  }
});

// GET /status - Check if employee is currently clocked in
router.get("/status", async (req, res) => {
  try {
    const employeeId = req.id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const db = getDB();

    // Check if there is an active clock-in record without clock-out
    const activeRecord = await db.collection("clock_records").findOne({
      employee_id: new ObjectId(employeeId),
      clock_out: null
    });

    res.status(200).json({ 
      success: true,
      clockedIn: activeRecord !== null,
      clockInTime: activeRecord ? activeRecord.clock_in : null
    });
  } catch (error) {
    console.error("Error checking clock status:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to check status" 
    });
  }
});

export { router as attendanceRouter };