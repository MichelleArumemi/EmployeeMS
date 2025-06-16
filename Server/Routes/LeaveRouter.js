import express from 'express';
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Employee submits leave request
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate, reason } = req.body;
    const userId = req.id;

    if (!userId) {
      console.error('Leave request error: req.id (userId) is missing.');
      return res.status(401).json({
        success: false,
        message: 'User not authenticated. Please log in again.'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Start date and end date are required' 
      });
    }

    const newLeaveRequest = {
      employeeId: new ObjectId(userId),
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason: reason || '',
      status: 'pending', // ✅ Default status
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('leaveRequests').insertOne(newLeaveRequest);

    // Emit notification to admin
    if (req.io) {
      req.io.to('admin_room').emit('new_leave_request', {
        message: 'New leave request submitted',
        requestId: result.insertedId
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Leave request submitted successfully',
      requestId: result.insertedId 
    });

  } catch (error) {
    console.error('Error submitting leave request:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to submit leave request' 
    });
  }
});

// Employee views their leave requests
router.get('/my-requests', async (req, res) => {
  try {
    const db = getDB();
    const userId = req.id;

    const requests = await db.collection('leaveRequests')
      .find({ employeeId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    res.status(200).json({ 
      success: true, 
      data: requests 
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch leave requests' 
    });
  }
});

// Admin gets all pending leave requests
router.get('/pending', async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const db = getDB();
    const requests = await db.collection('leaveRequests')
      .aggregate([
        { $match: { status: 'pending' } },
        { $lookup: {
            from: 'employees',
            localField: 'employeeId',
            foreignField: '_id',
            as: 'employee'
          }
        },
        { $unwind: '$employee' },
        { $project: {
            'employee.password': 0,
            'employee.token': 0
          }
        }
      ])
      .toArray();

    res.status(200).json({ 
      success: true, 
      data: requests 
    });
  } catch (error) {
    console.error('Error fetching pending leave requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending leave requests' 
    });
  }
});

router.get('/pending', verifyAdmin, async (req, res) => {

});

// Admin approves/rejects leave request
router.patch('/:id/status', async (req, res) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized access' 
      });
    }

    const db = getDB();
    const { status } = req.body;
    const requestId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    const request = await db.collection('leaveRequests').findOne({ 
      _id: new ObjectId(requestId) 
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Leave request not found' 
      });
    }

    await db.collection('leaveRequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: { 
          status, 
          updatedAt: new Date(),
          reviewedBy: new ObjectId(req.id)
        } 
      }
    );

    // Create notification for employee
    await db.collection('notifications').insertOne({
      recipientId: request.employeeId,
      senderId: new ObjectId(req.id),
      type: 'leave_status',
      message: `Your leave request has been ${status}`,
      relatedEntity: 'leaveRequest',
      relatedEntityId: new ObjectId(requestId),
      isRead: false,
      createdAt: new Date()
    });

    // Send real-time update to employee
    req.io.to(`user_${request.employeeId.toString()}`).emit('leave_status_update', {
      requestId,
      status,
      message: `Your leave request has been ${status}`
    });

    res.status(200).json({ 
      success: true, 
      message: `Leave request ${status} successfully` 
    });
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update leave request status' 
    });
  }
});

export { router as leaveRouter };