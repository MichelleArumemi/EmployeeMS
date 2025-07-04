import express from 'express';
import { getDB } from '../utils/db.js';
import { ObjectId } from 'mongodb';
import { verifyAdmin } from '../middleware/auth.js';

const router = express.Router();

// Employee submits leave request
router.post('/', async (req, res) => {
  try {
    const db = getDB();
    const { startDate, endDate, reason, leaveType } = req.body;
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

    // Calculate total days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    const newLeaveRequest = {
      employeeId: new ObjectId(userId),
      startDate: start,
      endDate: end,
      reason: reason || '',
      leaveType: leaveType || 'annual',
      status: 'pending',
      totalDays,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('leaveRequests').insertOne(newLeaveRequest);

    // Get employee details for notification
    const employee = await db.collection('employees').findOne({ 
      _id: new ObjectId(userId) 
    });

    // Emit notification to admin
    if (req.io) {
      req.io.to('admin_room').emit('new_leave_request', {
        message: 'New leave request submitted',
        requestId: result.insertedId,
        employeeName: employee?.name || 'Unknown',
        startDate: startDate,
        endDate: endDate,
        leaveType: leaveType || 'annual'
      });
    }

    res.status(201).json({ 
      success: true, 
      message: 'Leave request submitted successfully',
      data: {
        requestId: result.insertedId,
        ...newLeaveRequest
      }
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
router.get('/pending', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const requests = await db.collection('leaveRequests')
      .find({ status: 'pending' })
      .sort({ createdAt: 1 }) // Oldest first
      .toArray();
    
    // Get employee details for each request
    const requestsWithEmployees = await Promise.all(requests.map(async request => {
      const employee = await db.collection('employees').findOne({ 
        _id: request.employeeId 
      });
      return {
        ...request,
        employee: {
          name: employee?.name,
          email: employee?.email,
          department: employee?.department,
          position: employee?.position
        }
      };
    }));

    res.status(200).json({ 
      success: true, 
      data: requestsWithEmployees 
    });
  } catch (error) {
    console.error('Error fetching pending leave requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch pending leave requests' 
    });
  }
});

// Admin approves/rejects leave request
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const db = getDB();
    const { status, rejectionReason } = req.body;
    const requestId = req.params.id;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }

    // Find the request first to get employeeId and validate
    const request = await db.collection('leaveRequests').findOne({ 
      _id: new ObjectId(requestId) 
    });

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Leave request not found' 
      });
    }

    // Prepare update data
    const updateData = {
      status,
      updatedAt: new Date(),
      reviewedBy: new ObjectId(req.id)
    };

    // Add rejection reason if provided
    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    // Update the request
    const result = await db.collection('leaveRequests').updateOne(
      { _id: new ObjectId(requestId) },
      { $set: updateData }
    );

    if (result.modifiedCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'No changes made to leave request'
      });
    }

    // Create notification for employee
    const notification = {
      recipientId: request.employeeId,
      senderId: new ObjectId(req.id),
      type: 'leave_status',
      message: status === 'approved' 
        ? 'Your leave request has been approved' 
        : `Your leave request has been rejected${rejectionReason ? `: ${rejectionReason}` : ''}`,
      relatedEntity: 'leaveRequest',
      relatedEntityId: new ObjectId(requestId),
      isRead: false,
      createdAt: new Date()
    };

    await db.collection('notifications').insertOne(notification);

    // Send real-time updates
    if (req.io) {
      // To employee
      req.io.to(`user_${request.employeeId.toString()}`).emit('leave_status_update', {
        requestId,
        status,
        message: notification.message,
        updatedAt: updateData.updatedAt
      });
      
      // To admin room
      req.io.to('admin_room').emit('leave_request_updated', {
        requestId,
        status,
        employeeId: request.employeeId
      });
    }

    // Get updated request with employee details for response
    const updatedRequest = await db.collection('leaveRequests').findOne({ 
      _id: new ObjectId(requestId) 
    });
    const employee = await db.collection('employees').findOne({ 
      _id: request.employeeId 
    });

    res.status(200).json({ 
      success: true, 
      message: `Leave request ${status} successfully`,
      data: {
        ...updatedRequest,
        employee: {
          name: employee?.name,
          email: employee?.email
        }
      }
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