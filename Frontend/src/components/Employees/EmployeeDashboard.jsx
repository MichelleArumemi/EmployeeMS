import React, { useState, useEffect } from 'react';
import {
  User,
  Bell,
  DollarSign,
  Calendar,
  FileText,
  UploadCloud,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit3,
  Eye,
  Plus,
  Download,
  History
} from 'lucide-react';

// Employee Profile Component - View/Edit Own Profile
const EmployeeProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1990-01-15',
    employeeId: 'EMP001',
    department: 'Engineering',
    position: 'Software Developer',
    joinDate: '2023-01-15'
  });

  const handleSave = () => {
    // API call to update profile would go here
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <User size={18} /> My Profile
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit3 size={16} />
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
          <input
            type="text"
            value={profile.firstName}
            onChange={(e) => setProfile({...profile, firstName: e.target.value})}
            disabled={!isEditing}
            className={`w-full p-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
          <input
            type="text"
            value={profile.lastName}
            onChange={(e) => setProfile({...profile, lastName: e.target.value})}
            disabled={!isEditing}
            className={`w-full p-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={profile.email}
            disabled={true}
            className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">Contact HR to change email</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={profile.phone}
            onChange={(e) => setProfile({...profile, phone: e.target.value})}
            disabled={!isEditing}
            className={`w-full p-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={profile.address}
            onChange={(e) => setProfile({...profile, address: e.target.value})}
            disabled={!isEditing}
            className={`w-full p-2 border rounded-lg ${isEditing ? 'border-gray-300' : 'border-gray-200 bg-gray-50'}`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
          <input
            type="text"
            value={profile.employeeId}
            disabled={true}
            className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
          <input
            type="text"
            value={profile.department}
            disabled={true}
            className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <input
            type="text"
            value={profile.position}
            disabled={true}
            className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
          <input
            type="text"
            value={profile.joinDate}
            disabled={true}
            className="w-full p-2 border border-gray-200 bg-gray-50 rounded-lg"
          />
        </div>
      </div>

      {isEditing && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Save Changes
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

// Employee Documents - Upload personal documents
const EmployeeDocuments = () => {
  const [documents, setDocuments] = useState([
    { id: 1, name: 'Resume.pdf', type: 'Resume', uploadDate: '2024-01-15', status: 'Approved' },
    { id: 2, name: 'ID_Copy.pdf', type: 'ID Document', uploadDate: '2024-01-15', status: 'Approved' },
    { id: 3, name: 'Certificate.pdf', type: 'Certificate', uploadDate: '2024-02-01', status: 'Pending' }
  ]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <UploadCloud size={18} /> My Documents
      </h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Document</label>
        <input
          type="file"
          className="w-full p-2 border border-gray-300 rounded-lg"
          accept=".pdf,.doc,.docx,.jpg,.png"
        />
        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Upload Document
        </button>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Uploaded Documents</h4>
        {documents.map(doc => (
          <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{doc.name}</p>
              <p className="text-sm text-gray-600">{doc.type} • {doc.uploadDate}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                doc.status === 'Approved' ? 'bg-green-100 text-green-800' :
                doc.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {doc.status}
              </span>
              <button className="p-1 text-gray-600 hover:text-gray-800">
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// My Attendance History
const MyAttendance = () => {
  const [attendanceData] = useState([
    { date: '2024-06-14', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'Present', hours: '8.5' },
    { date: '2024-06-13', checkIn: '09:15 AM', checkOut: '05:45 PM', status: 'Present', hours: '8.5' },
    { date: '2024-06-12', checkIn: '09:00 AM', checkOut: '05:30 PM', status: 'Present', hours: '8.5' },
    { date: '2024-06-11', checkIn: '-', checkOut: '-', status: 'Absent', hours: '0' },
    { date: '2024-06-10', checkIn: '09:30 AM', checkOut: '05:30 PM', status: 'Late', hours: '8' }
  ]);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={18} /> My Attendance History
      </h3>

      <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <span className="font-medium text-green-800">Present Days</span>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">22</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <XCircle size={20} className="text-red-600" />
            <span className="font-medium text-red-800">Absent Days</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">2</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-yellow-600" />
            <span className="font-medium text-yellow-800">Late Days</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600 mt-1">3</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-3 font-medium text-gray-700">Date</th>
              <th className="text-left py-2 px-3 font-medium text-gray-700">Check In</th>
              <th className="text-left py-2 px-3 font-medium text-gray-700">Check Out</th>
              <th className="text-left py-2 px-3 font-medium text-gray-700">Hours</th>
              <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record, index) => (
              <tr key={index} className="border-b border-gray-100">
                <td className="py-2 px-3">{record.date}</td>
                <td className="py-2 px-3">{record.checkIn}</td>
                <td className="py-2 px-3">{record.checkOut}</td>
                <td className="py-2 px-3">{record.hours}h</td>
                <td className="py-2 px-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    record.status === 'Present' ? 'bg-green-100 text-green-800' :
                    record.status === 'Absent' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Leave Management - Apply, View Balance, History
const MyLeaveManagement = () => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [leaveApplication, setLeaveApplication] = useState({
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const [leaveBalance] = useState({
    annual: 12,
    sick: 8,
    personal: 3
  });

  const [leaveHistory] = useState([
    { id: 1, type: 'Annual Leave', startDate: '2024-05-01', endDate: '2024-05-05', days: 5, status: 'Approved', reason: 'Family vacation' },
    { id: 2, type: 'Sick Leave', startDate: '2024-04-15', endDate: '2024-04-15', days: 1, status: 'Approved', reason: 'Medical appointment' },
    { id: 3, type: 'Personal Leave', startDate: '2024-06-20', endDate: '2024-06-21', days: 2, status: 'Pending', reason: 'Personal matters' }
  ]);

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    // API call to submit leave application
    alert('Leave application submitted successfully!');
    setShowApplicationForm(false);
    setLeaveApplication({ type: '', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="space-y-6">
      {/* Leave Balance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={18} /> My Leave Balance
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800">Annual Leave</h4>
            <p className="text-2xl font-bold text-blue-600">{leaveBalance.annual} days</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Sick Leave</h4>
            <p className="text-2xl font-bold text-green-600">{leaveBalance.sick} days</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800">Personal Leave</h4>
            <p className="text-2xl font-bold text-purple-600">{leaveBalance.personal} days</p>
          </div>
        </div>
      </div>

      {/* Apply for Leave */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Plus size={18} /> Apply for Leave
          </h3>
          <button
            onClick={() => setShowApplicationForm(!showApplicationForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showApplicationForm ? 'Cancel' : 'New Application'}
          </button>
        </div>

        {showApplicationForm && (
          <form onSubmit={handleSubmitLeave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select
                  value={leaveApplication.type}
                  onChange={(e) => setLeaveApplication({...leaveApplication, type: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={leaveApplication.startDate}
                  onChange={(e) => setLeaveApplication({...leaveApplication, startDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={leaveApplication.endDate}
                  onChange={(e) => setLeaveApplication({...leaveApplication, endDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={leaveApplication.reason}
                onChange={(e) => setLeaveApplication({...leaveApplication, reason: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="3"
                placeholder="Please provide reason for leave"
                required
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Submit Application
            </button>
          </form>
        )}
      </div>

      {/* Leave History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History size={18} /> My Leave History
        </h3>
        <div className="space-y-3">
          {leaveHistory.map(leave => (
            <div key={leave.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{leave.type}</h4>
                  <p className="text-sm text-gray-600">{leave.startDate} to {leave.endDate} ({leave.days} days)</p>
                  <p className="text-sm text-gray-600 mt-1">Reason: {leave.reason}</p>
                </div>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  leave.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {leave.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// My Payroll Information
const MyPayroll = () => {
  const [payrollHistory] = useState([
    { month: 'May 2024', gross: 5000, deductions: 750, net: 4250, status: 'Paid' },
    { month: 'April 2024', gross: 5000, deductions: 750, net: 4250, status: 'Paid' },
    { month: 'March 2024', gross: 5000, deductions: 750, net: 4250, status: 'Paid' }
  ]);

  const currentBalance = 4250;

  return (
    <div className="space-y-6">
      {/* Current Balance */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign size={18} /> Current Payroll Balance
        </h3>
        <div className="bg-green-50 p-6 rounded-lg">
          <p className="text-sm text-green-700">Current Month Net Pay</p>
          <p className="text-3xl font-bold text-green-600">${currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Payroll History */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History size={18} /> Payroll History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700">Month</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Gross Pay</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Deductions</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Net Pay</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Status</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {payrollHistory.map((record, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-2 px-3 font-medium">{record.month}</td>
                  <td className="py-2 px-3">${record.gross.toLocaleString()}</td>
                  <td className="py-2 px-3">${record.deductions.toLocaleString()}</td>
                  <td className="py-2 px-3 font-medium text-green-600">${record.net.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {record.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-800">
                      <Download size={14} />
                      <span className="text-sm">Download</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// My Notifications
const MyNotifications = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'leave',
      title: 'Leave Application Approved',
      message: 'Your annual leave request for May 1-5 has been approved.',
      date: '2024-06-14',
      read: false
    },
    {
      id: 2,
      type: 'payroll',
      title: 'Payroll Processed',
      message: 'Your May 2024 salary has been processed and will be credited soon.',
      date: '2024-06-01',
      read: true
    },
    {
      id: 3,
      type: 'admin',
      title: 'Company Policy Update',
      message: 'Please review the updated remote work policy in the employee handbook.',
      date: '2024-05-28',
      read: true
    },
    {
      id: 4,
      type: 'leave',
      title: 'Leave Balance Update',
      message: 'Your leave balance has been updated for the new quarter.',
      date: '2024-04-01',
      read: true
    }
  ]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'leave': return <Calendar size={16} className="text-blue-600" />;
      case 'payroll': return <DollarSign size={16} className="text-green-600" />;
      case 'admin': return <Bell size={16} className="text-purple-600" />;
      default: return <Bell size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Bell size={18} /> My Notifications
      </h3>
      
      <div className="space-y-3">
        {notifications.map(notification => (
          <div key={notification.id} className={`p-4 border rounded-lg ${
            notification.read ? 'border-gray-200 bg-gray-50' : 'border-blue-200 bg-blue-50'
          }`}>
            <div className="flex items-start gap-3">
              <div className="mt-1">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h4 className={`font-medium ${notification.read ? 'text-gray-900' : 'text-blue-900'}`}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-gray-500">{notification.date}</span>
                </div>
                <p className={`text-sm mt-1 ${notification.read ? 'text-gray-600' : 'text-blue-800'}`}>
                  {notification.message}
                </p>
                {!notification.read && (
                  <div className="mt-2">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                    <span className="text-xs text-blue-600 ml-2">New</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EmployeeDashboard = () => {
  const [activeTab, setActiveTab] = useState('profile');

  const TabButton = ({ id, label, icon: Icon, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
        active
          ? 'bg-blue-600 text-white shadow-lg'
          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <EmployeeProfile />
            <EmployeeDocuments />
          </div>
        );
      case 'attendance':
        return <MyAttendance />;
      case 'leave':
        return <MyLeaveManagement />;
      case 'payroll':
        return <MyPayroll />;
      case 'notifications':
        return <MyNotifications />;
      default:
        return <EmployeeProfile />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Dashboard</h1>
          <p className="text-gray-600">Welcome to your employee dashboard. Here you can manage your profile, attendance, leave, payroll, and notifications.</p>
        </div>
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="profile" label="Profile & Docs" icon={User} active={activeTab === 'profile'} onClick={setActiveTab} />
          <TabButton id="attendance" label="Attendance" icon={Clock} active={activeTab === 'attendance'} onClick={setActiveTab} />
          <TabButton id="leave" label="Leave" icon={Calendar} active={activeTab === 'leave'} onClick={setActiveTab} />
          <TabButton id="payroll" label="Payroll" icon={DollarSign} active={activeTab === 'payroll'} onClick={setActiveTab} />
          <TabButton id="notifications" label="Notifications" icon={Bell} active={activeTab === 'notifications'} onClick={setActiveTab} />
        </div>
        <div>{renderContent()}</div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;