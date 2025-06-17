import express from "express";
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';

const router = express.Router();

// GET / - Get today's attendance summary
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

// GET /detailed - Get detailed attendance for today
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
          as: "employee_id"
        }
      },
      {
        $unwind: "$employee_id"
      },
      {
        $sort: { clock_in: 1 }
      }
    ]).toArray();

    // Get all active employees
    const allEmployees = await db.collection("employees").find({}).toArray();

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
      }
    });
  } catch (error) {
    console.error("Error fetching detailed attendance:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /summary/:period - Get attendance summary for a period
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