import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';

// or, if you use another icon library, import Send from there
import { 
  Users, 
  Bell, 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  BarChart3,
  Settings,
  Shield,
  User,
  FileText,
  Download,
  Eye
} from 'lucide-react';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// --- Admin Attendance: View employees currently at the office ---
const AdminAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      console.log('Fetching attendance from:', `${apiUrl}/attendance/detailed`);
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/attendance/detailed`, {
          withCredentials: true
        });
        console.log('Attendance response:', response.data);
        if (response.data.success) {
          setAttendanceData(response.data.attendance.present.employees || []);
        } else {
          setError('No attendance data available');
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        console.error('Error response:', err.response?.data);
        setError(`Failed to fetch attendance data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendanceData();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users size={22} /> Employees Present Today
      </h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div className="text-center py-4">Loading attendance data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Department</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Check-In Time</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Location</th>
              </tr>
            </thead>
            <tbody>
              {attendanceData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-gray-500">No employees present today</td>
                </tr>
              ) : attendanceData.map(record => (
                <tr key={record._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{record.employee_id?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{record.employee_id?.department || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">
                    {record.clock_in ? new Date(record.clock_in).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }) : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-gray-600">{record.location || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Admin Employee Profiles: View employee profiles and uploaded files ---
const AdminEmployeeProfiles = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      console.log('Fetching employees from:', `${apiUrl}/auth/employees`);
      try {
        const response = await axios.get(`${apiUrl}/auth/employees`, {
          withCredentials: true
        });
        console.log('Employees response:', response.data);
        setEmployees(response.data.employees || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching employees:', err);
        console.error('Error response:', err.response?.data);
        setEmployees([]);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError(`Failed to fetch employees: ${err.message}`);
        }
      }
    };

    fetchEmployees();
  }, []);

  const handleViewProfile = async (id) => {
    console.log('Fetching profile for employee ID:', id);
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/auth/employees/${id}`, {
        withCredentials: true
      });
      console.log('Profile response:', response.data);
      setProfile(response.data.employee);
      setFiles(response.data.files || []);
      setSelectedEmployee(id);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      console.error('Error response:', err.response?.data);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError(`Failed to fetch employee profile: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (selectedEmployee && profile) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User size={22} /> {profile.name} - Profile
          </h2>
          <button 
            onClick={() => { setSelectedEmployee(null); setProfile(null); setFiles([]); }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back to List
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><label className="text-sm font-medium text-gray-600">Full Name</label><p className="text-gray-900">{profile.name}</p></div>
              <div><label className="text-sm font-medium text-gray-600">Email</label><p className="text-gray-900">{profile.email}</p></div>
              <div><label className="text-sm font-medium text-gray-600">Phone</label><p className="text-gray-900">{profile.phone}</p></div>
              <div><label className="text-sm font-medium text-gray-600">Address</label><p className="text-gray-900">{profile.address}</p></div>
            </div>
          </div>
          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div><label className="text-sm font-medium text-gray-600">Department</label><p className="text-gray-900">{profile.department}</p></div>
              <div><label className="text-sm font-medium text-gray-600">Position</label><p className="text-gray-900">{profile.position}</p></div>
              <div><label className="text-sm font-medium text-gray-600">Join Date</label><p className="text-gray-900">{profile.joinDate}</p></div>
            </div>
          </div>
        </div>
        {/* Uploaded Files */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} /> Uploaded Files
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {files.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">File Name</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Upload Date</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map(file => (
                      <tr key={file._id} className="border-b border-gray-100 hover:bg-gray-100">
                        <td className="py-3 px-4 text-gray-900">{file.name}</td>
                        <td className="py-3 px-4 text-gray-600">{file.type}</td>
                        <td className="py-3 px-4 text-gray-600">{new Date(file.uploadDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mr-2">View</a>
                          <a href={file.url} download className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors">Download</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No files uploaded yet</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users size={22} /> Employee Profiles
      </h2>
      {employees.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No employees found. Check console for debugging info.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map(employee => (
            <div key={employee.id || employee._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                  <p className="text-sm text-gray-600">{employee.position || employee.role}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <p><span className="font-medium">Role:</span> {employee.role}</p>
                <p><span className="font-medium">ID:</span> {employee.id || employee._id}</p>
              </div>
              <button 
                onClick={() => handleViewProfile(employee.id || employee._id)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                View Profile
              </button>
            </div>
          ))}
        </div>
      )}
      {loading && <div className="text-center text-blue-600 mt-4">Loading...</div>}
    </div>
  );
};

// --- Admin Leave Management: View/Approve/Reject employee leaves ---
const AdminLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});

  // Fetch pending leave requests on mount
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/leave/pending`, {
          withCredentials: true
        });
        setLeaveRequests(response.data.data || []);
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
        } else {
          setError('Failed to fetch leave requests');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveRequests();
  }, []);

  // Approve/Reject leave request
  // const handleAction = async (id, action) => {
  //   setActionLoading(prev => ({ ...prev, [id]: true }));
  //   setError(null);
  //   try {
  //     await axios.patch(`${apiUrl}/leave/${id}/status`, 
  //       { status: action.toLowerCase() }, 
  //       { withCredentials: true }
  //     );
  //     setLeaveRequests(prev => prev.map(lr => lr._id === id ? { ...lr, status: action } : lr));
  //   } catch (err) {
  //     console.error('Error updating leave status:', err);
  //     if (err.response?.status === 401) {
  //       setError('Authentication failed. Please login again.');
  //     } else {
  //       setError('Failed to update leave status');
  //     }
  //   } finally {
  //     setActionLoading(prev => ({ ...prev, [id]: false }));
  //   }
  // };

  const handleAction = async (id, action) => {
  setActionLoading(prev => ({ ...prev, [id]: true }));
  setError(null);
  
  try {
    const response = await axios.patch(
      `${apiUrl}/leave/${id}/status`, 
      { status: action.toLowerCase() },
      { withCredentials: true }
    );

    if (response.data.success) {
      // Update local state
      setLeaveRequests(prev => 
        prev.map(lr => 
          lr._id === id 
            ? { ...lr, status: action.toLowerCase() } 
            : lr
        )
      );
    }
  } catch (err) {
    console.error('Error updating leave status:', err);
    setError(err.response?.data?.message || 'Failed to update leave status');
  } finally {
    setActionLoading(prev => ({ ...prev, [id]: false }));
  }
};

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar size={22} /> Employee Leave Requests
      </h2>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div>Loading leave requests...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Dates</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Days</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Reason</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
                <th className="text-left py-3 px-4 text-gray-600 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leaveRequests.length === 0 ? (
                <tr><td colSpan={7} className="py-4 text-center text-gray-500">No pending leave requests.</td></tr>
              ) : leaveRequests.map(req => (
                <tr key={req._id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-gray-900">{req.employee?.name || 'N/A'}</td>
                  <td className="py-3 px-4 text-gray-600">{req.type || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{req.startDate?.slice(0,10)} - {req.endDate?.slice(0,10)}</td>
                  <td className="py-3 px-4 text-gray-600">{req.days || ((new Date(req.endDate) - new Date(req.startDate))/(1000*60*60*24) + 1)}</td>
                  <td className="py-3 px-4 text-gray-600">{req.reason}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      req.status === 'approved' ? 'bg-green-100 text-green-800' :
                      req.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {req.status === 'pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleAction(req._id, 'approved')} disabled={actionLoading[req._id]} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs disabled:opacity-50">{actionLoading[req._id] ? 'Approving...' : 'Approve'}</button>
                        <button onClick={() => handleAction(req._id, 'rejected')} disabled={actionLoading[req._id]} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs disabled:opacity-50">{actionLoading[req._id] ? 'Rejecting...' : 'Reject'}</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- Admin Payroll: Approve payroll for employees ---
const AdminPayroll = () => {
  const [payrolls, setPayrolls] = useState([
    { id: 1, name: 'Alice Johnson', month: 'June 2024', gross: 5000, deductions: 500, net: 4500, status: 'Pending' },
    { id: 2, name: 'Bob Wilson', month: 'June 2024', gross: 4800, deductions: 400, net: 4400, status: 'Approved' },
    { id: 3, name: 'David Brown', month: 'June 2024', gross: 5200, deductions: 600, net: 4600, status: 'Pending' },
  ]);
  const handleApprove = (id) => {
    setPayrolls(prev => prev.map(p => p.id === id ? { ...p, status: 'Approved' } : p));
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <DollarSign size={22} /> Employee Payroll Approval
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Month</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Gross</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Deductions</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Net Pay</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Status</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {payrolls.map(pay => (
              <tr key={pay.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{pay.name}</td>
                <td className="py-3 px-4 text-gray-600">{pay.month}</td>
                <td className="py-3 px-4 text-gray-600">₦{pay.gross.toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-600">₦{pay.deductions.toLocaleString()}</td>
                <td className="py-3 px-4 text-green-700 font-semibold">₦{pay.net.toLocaleString()}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pay.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pay.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {pay.status === 'Pending' && (
                    <button onClick={() => handleApprove(pay.id)} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs">Approve</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Admin Send Notifications ---

const AdminSendNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showComposer, setShowComposer] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    recipientIds: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    // Fetch employees for recipient selection
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${apiUrl}/users/employees`, {
          withCredentials: true
        });
        setEmployees(response.data.data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee list');
      }
    };

    fetchEmployees();

    // Socket.io setup
    const socket = io(apiUrl);
    socket.on('notification_error', (error) => {
      setError(error.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [apiUrl]);

const AdminSendNotifications = () => {
  const [showComposer, setShowComposer] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    recipientIds: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Fetch employees for recipient selection
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiUrl}/users`, {
          withCredentials: true
        });
        setEmployees(response.data.data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee list');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [apiUrl]);

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setSuccess(null);
      
      if (!newNotification.title || !newNotification.message) {
        throw new Error('Title and message are required');
      }

      if (newNotification.recipientIds.length === 0) {
        throw new Error('Please select at least one recipient');
      }

      const response = await axios.post(`${apiUrl}/notifications`, {
        title: newNotification.title,
        message: newNotification.message,
        recipientIds: newNotification.recipientIds
      }, { withCredentials: true });

      if (response.data.success) {
        setShowComposer(false);
        setNewNotification({
          title: '',
          message: '',
          recipientIds: []
        });
        setSuccess('Notification sent successfully!');
      }
    } catch (err) {
      console.error('Error sending notification:', err);
      setError(err.response?.data?.message || err.message || 'Failed to send notification');
    }
  };

  const toggleRecipient = (employeeId) => {
    setNewNotification(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.includes(employeeId)
        ? prev.recipientIds.filter(id => id !== employeeId)
        : [...prev.recipientIds, employeeId]
    }));
  };

  const selectAllRecipients = () => {
    setNewNotification(prev => ({
      ...prev,
      recipientIds: prev.recipientIds.length === employees.length 
        ? [] 
        : employees.map(emp => emp._id)
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="text-blue-600" size={20} />
          Employee Notifications
        </h2>
        <button
          onClick={() => setShowComposer(!showComposer)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          {showComposer ? (
            <>
              <X size={16} /> Cancel
            </>
          ) : (
            <>
              <Send size={16} /> New Notification
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}

      {showComposer && (
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Send size={18} /> Compose New Notification
          </h3>
          
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  title: e.target.value
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notification title"
                required
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({
                  ...newNotification,
                  message: e.target.value
                })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                rows="4"
                placeholder="Enter your notification message here..."
                required
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users size={16} /> Recipients *
                </label>
                <button
                  type="button"
                  onClick={selectAllRecipients}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {newNotification.recipientIds.length === employees.length 
                    ? 'Deselect all' 
                    : 'Select all'}
                </button>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-md p-3 max-h-60 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-4 text-gray-500">
                    Loading employees...
                  </div>
                ) : employees.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    No employees found
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {employees.map(employee => (
                      <div key={employee._id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`emp-${employee._id}`}
                          checked={newNotification.recipientIds.includes(employee._id)}
                          onChange={() => toggleRecipient(employee._id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <label 
                          htmlFor={`emp-${employee._id}`} 
                          className="ml-2 text-sm text-gray-700"
                        >
                          {employee.name} ({employee.department || 'No department'})
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Selected: {newNotification.recipientIds.length} employee(s)
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowComposer(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || newNotification.recipientIds.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send size={16} /> Send Notification
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notification history/sent items could be added here */}
    </div>
  );
};

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Bell size={22} /> Notifications
        </h2>
        <button
          onClick={() => setShowComposer(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Send size={16} /> New Notification
        </button>
      </div>

      {error && <div className="text-red-600 mb-4">{error}</div>}

      {showComposer && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Compose Notification</h3>
            <button onClick={() => setShowComposer(false)} className="text-gray-500">
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="4"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Users size={16} /> Recipients
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {employees.map(employee => (
                  <div key={employee._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`emp-${employee._id}`}
                      checked={newNotification.recipientIds.includes(employee._id)}
                      onChange={() => toggleRecipient(employee._id)}
                      className="mr-2"
                    />
                    <label htmlFor={`emp-${employee._id}`} className="text-sm">
                      {employee.name} ({employee.department})
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              disabled={newNotification.recipientIds.length === 0}
            >
              <Send size={16} /> Send Notification
            </button>
          </form>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
        
        {loading ? (
          <div>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="text-gray-500 text-center py-8">No notifications sent yet</div>
        ) : (
          <div className="space-y-3">
            {notifications.map(notification => (
              <div key={notification._id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{notification.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Sent to {notification.recipientIds.length} employee(s)
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('attendance');
  const [apiTest, setApiTest] = useState(null);

  // Simple API connectivity test
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('Testing API connectivity...');
        
        // Test 1: Simple health check
        const healthResponse = await axios.get(`${apiUrl.replace('/api', '')}/health`);
        console.log('Health check:', healthResponse.data);
        
        // Test 2: Debug route
        const debugResponse = await axios.get(`${apiUrl}/auth/debug`, {
          withCredentials: true
        });
        console.log('Debug route:', debugResponse.data);
        
        setApiTest('API Connected Successfully');
      } catch (err) {
        console.error('API Test failed:', err);
        setApiTest(`API Test Failed: ${err.message}`);
      }
    };
    
    testAPI();
  }, []);

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
    switch(activeTab) {
      case 'attendance':
        return <AdminAttendance />;
      case 'profiles':
        return <AdminEmployeeProfiles />;
      case 'leave':
        return <AdminLeaveManagement />;
      case 'payroll':
        return <AdminPayroll />;
      case 'notifications':
        return <AdminSendNotifications />;
      default:
        return <AdminAttendance />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage employees, attendance, leave, payroll, profiles, and notifications from one place.</p>
          {apiTest && (
            <div className={`mt-2 p-2 rounded text-sm ${
              apiTest.includes('Successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              API Status: {apiTest}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-3 mb-8">
          <TabButton id="attendance" label="Attendance" icon={Users} active={activeTab === 'attendance'} onClick={setActiveTab} />
          <TabButton id="profiles" label="Profiles" icon={User} active={activeTab === 'profiles'} onClick={setActiveTab} />
          <TabButton id="leave" label="Leave" icon={Calendar} active={activeTab === 'leave'} onClick={setActiveTab} />
          <TabButton id="payroll" label="Payroll" icon={DollarSign} active={activeTab === 'payroll'} onClick={setActiveTab} />
          <TabButton id="notifications" label="Notifications" icon={Bell} active={activeTab === 'notifications'} onClick={setActiveTab} />
        </div>
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;

