import { Schema, model } from 'mongoose';

const leaveRequestSchema = new Schema({
  // Reference to the user making the request
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Employee details (for easy access without population)
  employeeId: {
    type: String,
    required: true
  },
  
  employeeName: {
    type: String,
    required: true
  },
  
  employeeEmail: {
    type: String,
    required: true
  },
  
  // Leave details
  startDate: {
    type: Date,
    required: true
  },
  
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(endDate) {
        return endDate >= this.startDate;
      },
      message: 'End date must be after or equal to start date'
    }
  },
  
  // Calculate total days (excluding weekends - optional)
  totalDays: {
    type: Number,
    default: function() {
      const start = new Date(this.startDate);
      const end = new Date(this.endDate);
      const timeDiff = end.getTime() - start.getTime();
      return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
    }
  },
  
  reason: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Leave type (you can extend this)
  leaveType: {
    type: String,
    enum: ['annual', 'sick', 'personal', 'emergency', 'maternity', 'paternity', 'other'],
    default: 'annual'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  
  // Approval details
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: 300
  },
  
  // Comments/notes from approver
  approverComments: {
    type: String,
    trim: true,
    maxlength: 500
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  
  // File attachments (optional - for medical certificates, etc.)
  attachments: [{
    filename: String,
    originalName: String,
    mimeType: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Workflow tracking
  workflowStatus: {
    submittedAt: {
      type: Date,
      default: Date.now
    },
    reviewedAt: Date,
    processedAt: Date
  },
  
  // HR/Manager notifications
  notificationsSent: {
    toManager: {
      type: Boolean,
      default: false
    },
    toHR: {
      type: Boolean,
      default: false
    },
    toEmployee: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
leaveRequestSchema.index({ userId: 1, status: 1 });
leaveRequestSchema.index({ startDate: 1, endDate: 1 });
leaveRequestSchema.index({ createdAt: -1 });
leaveRequestSchema.index({ status: 1, createdAt: -1 });

// Virtual for formatted date range
leaveRequestSchema.virtual('dateRange').get(function() {
  const start = this.startDate.toLocaleDateString();
  const end = this.endDate.toLocaleDateString();
  return start === end ? start : `${start} - ${end}`;
});

// Virtual to check if leave is current/active
leaveRequestSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'approved' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual to check if leave is upcoming
leaveRequestSchema.virtual('isUpcoming').get(function() {
  const now = new Date();
  return this.status === 'approved' && this.startDate > now;
});

// Pre-save middleware to calculate total days more accurately
leaveRequestSchema.pre('save', function(next) {
  if (this.isModified('startDate') || this.isModified('endDate')) {
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    
    // Calculate business days (excluding weekends)
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    this.totalDays = count;
  }
  
  // Set approval timestamp
  if (this.isModified('status')) {
    if (this.status === 'approved' && !this.approvedAt) {
      this.approvedAt = new Date();
      this.workflowStatus.processedAt = new Date();
    }
    if (this.status === 'rejected' && !this.workflowStatus.processedAt) {
      this.workflowStatus.processedAt = new Date();
    }
  }
  
  next();
});

// Static method to get leave requests by user
leaveRequestSchema.statics.getByUser = function(userId, status = null) {
  const query = { userId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('approvedBy', 'name email');
};

// Static method to get pending requests for managers
leaveRequestSchema.statics.getPendingRequests = function() {
  return this.find({ status: 'pending' })
    .sort({ createdAt: 1 })
    .populate('userId', 'name email department');
};

// Instance method to approve leave
leaveRequestSchema.methods.approve = function(approverId, comments = '') {
  this.status = 'approved';
  this.approvedBy = approverId;
  this.approvedAt = new Date();
  this.approverComments = comments;
  this.workflowStatus.processedAt = new Date();
  return this.save();
};

// Instance method to reject leave
leaveRequestSchema.methods.reject = function(approverId, reason, comments = '') {
  this.status = 'rejected';
  this.approvedBy = approverId;
  this.rejectionReason = reason;
  this.approverComments = comments;
  this.workflowStatus.processedAt = new Date();
  return this.save();
};

// Instance method to cancel leave
leaveRequestSchema.methods.cancel = function() {
  if (this.status === 'pending' || this.status === 'approved') {
    this.status = 'cancelled';
    this.workflowStatus.processedAt = new Date();
    return this.save();
  }
  throw new Error('Cannot cancel this leave request');
};

const LeaveRequest = model('LeaveRequest', leaveRequestSchema);

export default LeaveRequest;