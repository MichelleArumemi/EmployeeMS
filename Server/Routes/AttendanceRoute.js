import express from "express";
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET /today/:userId - Get today's attendance for a specific user
router.get("/today/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const db = getDB();
    
    // Find today's attendance record for this user
    const attendanceRecord = await db.collection("ClockRecord").findOne({
      employee_id: new ObjectId(userId),
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: "No attendance record found for today",
        data: null
      });
    }

    res.status(200).json({
      success: true,
      data: attendanceRecord
    });
  } catch (error) {
    console.error("Error fetching today's attendance:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
});

// POST /employee_clockin/:userId - Clock in an employee
router.post("/employee_clockin/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { location = 'office', work_from_type = 'office' } = req.body;
    
    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const db = getDB();
    
    // Check if user already clocked in today
    const existingRecord = await db.collection("ClockRecord").findOne({
      employee_id: new ObjectId(userId),
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (existingRecord) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "Already clocked in today"
      });
    }

    // Verify employee exists
    const employee = await db.collection("employees").findOne({
      _id: new ObjectId(userId)
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        status: "error",
        message: "Employee not found"
      });
    }

    // Create new clock record
    const clockRecord = {
      employee_id: new ObjectId(userId),
      clock_in: new Date(),
      clock_out: null,
      location: location,
      work_from_type: work_from_type,
      total_hours: null,
      date: today.toISOString().split('T')[0], // YYYY-MM-DD format
      created_at: new Date(),
      updated_at: new Date()
    };

    const result = await db.collection("ClockRecord").insertOne(clockRecord);

    if (result.insertedId) {
      res.status(200).json({
        success: true,
        status: "success",
        message: "Clocked in successfully",
        data: {
          id: result.insertedId,
          clock_in: clockRecord.clock_in,
          location: clockRecord.location,
          work_from_type: clockRecord.work_from_type
        }
      });
    } else {
      throw new Error("Failed to insert clock record");
    }
  } catch (error) {
    console.error("Error clocking in:", error);
    res.status(500).json({ 
      success: false,
      status: "error", 
      message: "Server Error",
      error: error.message 
    });
  }
});

// POST /employee_clockout/:userId - Clock out an employee
router.post("/employee_clockout/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    // Get today's date range
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const db = getDB();
    
    // Find today's clock record for this user
    const existingRecord = await db.collection("ClockRecord").findOne({
      employee_id: new ObjectId(userId),
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    if (!existingRecord) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "No clock-in record found for today"
      });
    }

    if (existingRecord.clock_out) {
      return res.status(400).json({
        success: false,
        status: "error",
        message: "Already clocked out today"
      });
    }

    const clockOutTime = new Date();
    
    // Calculate total hours
    const clockInTime = new Date(existingRecord.clock_in);
    const totalHours = (clockOutTime - clockInTime) / (1000 * 60 * 60); // Convert to hours

    // Update the record with clock out time
    const updateResult = await db.collection("ClockRecord").updateOne(
      { _id: existingRecord._id },
      {
        $set: {
          clock_out: clockOutTime,
          total_hours: parseFloat(totalHours.toFixed(2)),
          updated_at: new Date()
        }
      }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({
        success: true,
        status: "success",
        message: "Clocked out successfully",
        data: {
          clock_out: clockOutTime,
          total_hours: parseFloat(totalHours.toFixed(2))
        }
      });
    } else {
      throw new Error("Failed to update clock record");
    }
  } catch (error) {
    console.error("Error clocking out:", error);
    res.status(500).json({ 
      success: false,
      status: "error",
      message: "Server Error",
      error: error.message 
    });
  }
});

// GET /employee/:userId/history - Get attendance history for an employee
router.get("/employee/:userId/history", async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 30, page = 1 } = req.query;
    
    // Validate userId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const db = getDB();
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get attendance history for this employee
    const attendanceHistory = await db.collection("ClockRecord")
      .find({ employee_id: new ObjectId(userId) })
      .sort({ clock_in: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .toArray();

    // Get total count for pagination
    const totalCount = await db.collection("ClockRecord").countDocuments({
      employee_id: new ObjectId(userId)
    });

    res.status(200).json({
      success: true,
      data: attendanceHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching attendance history:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server Error",
      error: error.message 
    });
  }
});

// GET / - Get today's attendance summary (keeping your existing route)
router.get("/", async (req, res) => {
  try {
    // Get today's date range (start and end of day)
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    const db = getDB();
    
    // Count employees who clocked in today
    const presentCount = await db.collection("ClockRecord").countDocuments({
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Get total number of active employees
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

// GET /date/:date - Get attendance for a specific date (keeping your existing route)
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
    const presentCount = await db.collection("ClockRecord").countDocuments({
      clock_in: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    // Get total number of active employees
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

// GET /detailed - Get detailed attendance for today (keeping your existing route)
router.get("/detailed", async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const db = getDB();
    
    // Get all clock records for today with employee details
    const presentEmployees = await db.collection("ClockRecord").aggregate([
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
          as: "employee_details"
        }
      },
      {
        $unwind: "$employee_details"
      },
      {
        $sort: { clock_in: 1 }
      }
    ]).toArray();

    // Get all active employees
    const allEmployees = await db.collection("employees").find({}).toArray();

    // Find absent employees
    const presentEmployeeIds = presentEmployees.map(record => record.employee_details._id.toString());
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
      }
    });
  } catch (error) {
    console.error("Error fetching detailed attendance:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /summary/:period - Get attendance summary for a period (keeping your existing route)
router.get("/summary/:period", async (req, res) => {
  try {
    const { period } = req.params; // 'week', 'month', 'year'
    
    let startDate;
    const endDate = new Date();

    // Calculate start date based on period
    switch (period) {
      case 'week':
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: "Invalid period. Use 'week', 'month', or 'year'"
        });
    }

    const db = getDB();
    
    // Aggregate attendance data for the period
    const attendanceData = await db.collection("ClockRecord").aggregate([
      {
        $match: {
          clock_in: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$clock_in" } }
          },
          present_count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.date": 1 }
      }
    ]).toArray();

    // Get total employees for calculating absent count
    const totalEmployees = await db.collection("employees").countDocuments({});

    // Add absent count to each day
    const summaryData = attendanceData.map(item => ({
      date: item._id.date,
      present: item.present_count,
      absent: totalEmployees - item.present_count,
      total: totalEmployees
    }));

    res.status(200).json({ 
      success: true, 
      period,
      summary: summaryData
    });
  } catch (error) {
    console.error("Error fetching attendance summary:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

export { router as attendanceRouter };