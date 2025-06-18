import React, { useState, useEffect } from 'react';
import MyNotifications from '../MyNotifications'; // Adjust the path if needed
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
import axios from 'axios';
import {io} from 'socket.io-client';

// Employee Profile Component - View/Edit Own Profile
const EmployeeProfile = () => {
  // Placeholder user data (simulate signup info)
  const signupData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@company.com',
    position: 'Software Developer',
    // Add more fields as needed
  };
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: signupData.firstName,
    lastName: signupData.lastName,
    email: signupData.email,
    phone: 'Not provided', // Placeholder for phone number
    address: 'Not provided', // Placeholder for address
    dateOfBirth: 'Not provided',
    employeeId: 'EMP001',
    department: 'Not provided',
    position: signupData.position,
    joinDate: 'Not provided'
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
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file || !fileType) {
      alert('Please select a file and type.');
      return;
    }
    setUploading(true);
    setTimeout(() => {
      setDocuments(prev => [
        {
          id: prev.length ? prev[0].id + 1 : 1,
          name: file.name,
          type: fileType,
          uploadDate: new Date().toISOString().slice(0, 10),
          status: 'Pending'
        },
        ...prev
      ]);
      setFile(null);
      setFileType('');
      setUploading(false);
      alert('File uploaded successfully!');
    }, 1200);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <UploadCloud size={18} /> My Documents
      </h3>
      <form className="mb-4" onSubmit={handleUpload}>
        <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Document</label>
        <input
          type="file"
          className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          accept=".pdf,.doc,.docx,.jpg,.png"
          onChange={handleFileChange}
        />
        <select
          className="w-full p-2 border border-gray-300 rounded-lg mb-2"
          value={fileType}
          onChange={e => setFileType(e.target.value)}
        >
          <option value="">Select document type</option>
          <option value="Resume">Resume</option>
          <option value="ID Document">ID Document</option>
          <option value="Certificate">Certificate</option>
          <option value="Other">Other</option>
        </select>
        <button type="submit" disabled={uploading} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {uploading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form>
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
  const [attendanceData, setAttendanceData] = useState([]);
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkedOut, setCheckedOut] = useState(false);
  const [loading, setLoading] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);
  const [location, setLocation] = useState('office'); // Default location
  const [workFromType, setWorkFromType] = useState('office'); // Default work type

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const userId = localStorage.getItem('userId'); // Make sure you store userId after login

  // Get today's date in YYYY-MM-DD
  const today = new Date().toISOString().slice(0, 10);

  // Check if already checked in/out for today
  useEffect(() => {
    const fetchTodayAttendance = async () => {
      try {
        const response = await axios.get(`${apiUrl}/attendance/today/${userId}`, { 
          withCredentials: true 
        });
        
        if (response.data.data) {
          const record = response.data.data;
          setTodayRecord(record);
          setCheckedIn(!!record.clock_in);
          setCheckedOut(!!record.clock_out);
          
          // Add to local attendance data if not already present
          if (!attendanceData.some(r => r.date === today)) {
            setAttendanceData(prev => [{
              date: today,
              checkIn: record.clock_in ? new Date(record.clock_in).toLocaleTimeString() : '-',
              checkOut: record.clock_out ? new Date(record.clock_out).toLocaleTimeString() : '-',
              status: record.clock_out ? 'Present' : (record.clock_in ? 'Checked In' : 'Absent'),
              hours: record.clock_out ? calculateHours(
                new Date(record.clock_in).toLocaleTimeString(),
                new Date(record.clock_out).toLocaleTimeString()
              ) : '0'
            }, ...prev]);
          }
        }
      } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
      }
    };

    fetchTodayAttendance();
  }, [userId, today]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/employee_clockin/${userId}`,
        { 
          location,
          work_from_type: workFromType 
        },
        { withCredentials: true }
      );

      if (response.data.status === "success") {
        const now = new Date();
        const checkInTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setAttendanceData(prev => [{
          date: today,
          checkIn: checkInTime,
          checkOut: '-',
          status: 'Checked In',
          hours: '0'
        }, ...prev]);
        
        setCheckedIn(true);
        setCheckedOut(false);
        alert('Checked in successfully!');
      }
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${apiUrl}/employee_clockout/${userId}`,
        {},
        { withCredentials: true }
      );

      if (response.data.success) {
        const now = new Date();
        const checkOutTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setAttendanceData(prev => prev.map(row => 
          row.date === today
            ? {
                ...row,
                checkOut: checkOutTime,
                hours: calculateHours(row.checkIn, checkOutTime),
                status: 'Present'
              }
            : row
        ));
        
        setCheckedOut(true);
        setCheckedIn(false);
        alert('Checked out successfully!');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  // Helper to calculate hours between check-in and check-out
  function calculateHours(checkIn, checkOut) {
    if (!checkIn || !checkOut || checkIn === '-' || checkOut === '-') return '0';
    const [inH, inM, inPeriod] = checkIn.split(/:| /);
    const [outH, outM, outPeriod] = checkOut.split(/:| /);
    
    // Convert to 24-hour format
    let in24 = parseInt(inH) + (inPeriod === 'PM' && inH !== '12' ? 12 : 0);
    let out24 = parseInt(outH) + (outPeriod === 'PM' && outH !== '12' ? 12 : 0);
    
    // Calculate difference
    let hours = out24 - in24 + (parseInt(outM) - parseInt(inM)) / 60;
    if (hours < 0) hours += 24; // handle overnight
    
    return hours.toFixed(1);
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={18} /> My Attendance History
      </h3>
      
      {/* Check-in/Check-out Form */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {!checkedIn && !checkedOut && (
          <div className="flex gap-4 w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="office">Office</option>
                <option value="remote">Remote</option>
                <option value="client-site">Client Site</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Type</label>
              <select
                value={workFromType}
                onChange={(e) => setWorkFromType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
              >
                <option value="office">Office</option>
                <option value="home">Home</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>
        )}
        
        <button
          onClick={handleCheckIn}
          disabled={checkedIn || checkedOut || loading}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors flex-1 ${
            checkedIn ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {loading && !checkedIn ? 'Checking in...' : checkedIn ? 'Checked In' : 'Check In'}
        </button>
        
        <button
          onClick={handleCheckOut}
          disabled={!checkedIn || checkedOut || loading}
          className={`px-4 py-2 rounded-lg font-semibold text-white transition-colors flex-1 ${
            checkedOut ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading && !checkedOut ? 'Checking out...' : checkedOut ? 'Checked Out' : 'Check Out'}
        </button>
      </div>

      {/* Stats */}
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

      {/* Attendance Table */}
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
  const [leaveBalance, setLeaveBalance] = useState({
    annual: 12,
    sick: 8,
    personal: 3
  });
  const [leaveHistory, setLeaveHistory] = useState([]);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Fetch leave history
    axios.get(`${apiUrl}/leave/my-requests`, { withCredentials: true })
      .then(res => {
        if (res.data.success) setLeaveHistory(res.data.data.map((item, idx) => ({
          id: item._id,
          type: item.type || (item.reason?.toLowerCase().includes('sick') ? 'Sick Leave' : item.reason?.toLowerCase().includes('personal') ? 'Personal Leave' : 'Annual Leave'),
          startDate: item.startDate?.slice(0,10),
          endDate: item.endDate?.slice(0,10),
          days: Math.max(1, Math.round((new Date(item.endDate) - new Date(item.startDate)) / (1000 * 60 * 60 * 24)) + 1),
          status: item.status?.charAt(0).toUpperCase() + item.status?.slice(1),
          reason: item.reason
        })));
      });

    // Socket.io connection
    const socket = io(apiUrl);
    
    socket.on('leave_status_update', (data) => {
      setLeaveHistory(prev => 
        prev.map(leave => 
          leave.id === data.requestId.toString()
            ? { 
                ...leave, 
                status: data.status.charAt(0).toUpperCase() + data.status.slice(1),
                // Add any other updated fields you receive
              }
            : leave
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl]);

  const handleSubmitLeave = (e) => {
    e.preventDefault();
    axios.post(`${apiUrl}/leave`, {
      startDate: leaveApplication.startDate,
      endDate: leaveApplication.endDate,
      reason: leaveApplication.reason,
      type: leaveApplication.type
    }, { withCredentials: true })
      .then(res => {
        if (res.data.success) {
          setLeaveHistory(prev => [
            {
              id: res.data.data.requestId,
              type: leaveApplication.type === 'annual' ? 'Annual Leave' : 
                   leaveApplication.type === 'sick' ? 'Sick Leave' : 'Personal Leave',
              startDate: leaveApplication.startDate,
              endDate: leaveApplication.endDate,
              days: Math.max(1, Math.round(
                (new Date(leaveApplication.endDate) - new Date(leaveApplication.startDate)) / (1000 * 60 * 60 * 24)
              ) + 1),
              status: 'Pending',
              reason: leaveApplication.reason
            },
            ...prev
          ]);
          setShowApplicationForm(false);
          setLeaveApplication({ type: '', startDate: '', endDate: '', reason: '' });
          alert('Leave application submitted successfully!');
        }
      });
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
          <p className="text-3xl font-bold text-green-600">₦{currentBalance.toLocaleString()}</p>
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
                  <td className="py-2 px-3">₦{record.gross.toLocaleString()}</td>
                  <td className="py-2 px-3">₦{record.deductions.toLocaleString()}</td>
                  <td className="py-2 px-3 font-medium text-green-600">₦{record.net.toLocaleString()}</td>
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
const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${apiUrl}/notifications/mynotifications`, {
          withCredentials: true
        });
        if (response.data.success) {
          setNotifications(response.data.data);
          setUnreadCount(response.data.data.filter(n => !n.isRead).length);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Socket.io setup
    const socket = io(apiUrl);
    
    socket.on('new_notification', (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl]);

  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `${apiUrl}/notifications/${notificationId}/read`,
        {},
        { withCredentials: true }
      );
      
      setNotifications(prev =>
        prev.map(notification =>
          notification._id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.isRead)
        .map(n => n._id);
      
      if (unreadIds.length > 0) {
        await Promise.all(
          unreadIds.map(id => 
            axios.patch(
              `${apiUrl}/notifications/${id}/read`,
              {},
              { withCredentials: true }
            )
          )
        );
        
        setNotifications(prev =>
          prev.map(notification => ({
            ...notification,
            isRead: true
          }))
        );
        
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={22} /> My Notifications
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {loading ? (
        <div>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          You don't have any notifications yet
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(notification => (
            <div
              key={notification._id}
              className={`p-4 border rounded-lg ${
                notification.isRead
                  ? 'border-gray-200 bg-white'
                  : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.message}
                  </p>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    {notification.sender?.name || 'System'}
                    <span className="mx-2">•</span>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Mark as read"
                  >
                    <Check size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
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