import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${apiUrl}/attendance/detailed`, {
          withCredentials: true
        });
        if (response.data.success) {
          setAttendanceData(response.data.attendance.present.employees || []);
        }
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to fetch attendance data');
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
      try {
        const response = await axios.get(`${apiUrl}/employee/employee/list`, {
          withCredentials: true
        });
        setEmployees(response.data.employees || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setEmployees([]);
        if (err.response?.status === 401) {
          setError('Authentication failed. Please login again.');
          // Optional: redirect to login
          // window.location.href = '/adminlogin';
        } else {
          setError('Failed to fetch employees');
        }
      }
    };

    fetchEmployees();
  }, []);

  const handleViewProfile = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiUrl}/employee/detail/${id}`, {
        withCredentials: true
      });
      setProfile(response.data.Result?.[0] || response.data.employee);
      setFiles(response.data.files || []);
      setSelectedEmployee(id);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to fetch employee profile');
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
  const handleAction = async (id, action) => {
    setActionLoading(prev => ({ ...prev, [id]: true }));
    setError(null);
    try {
      await axios.patch(`${apiUrl}/leave/${id}/status`, 
        { status: action.toLowerCase() }, 
        { withCredentials: true }
      );
      setLeaveRequests(prev => prev.map(lr => lr._id === id ? { ...lr, status: action } : lr));
    } catch (err) {
      console.error('Error updating leave status:', err);
      if (err.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      } else {
        setError('Failed to update leave status');
      }
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
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [recipient, setRecipient] = useState('all');
  const [employees, setEmployees] = useState([]);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(`${apiUrl}/employee/employee/list`, {
          withCredentials: true
        });
        setEmployees(response.data.employees || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    fetchEmployees();
  }, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (recipient === 'all') {
        // Send to all employees
        for (const employee of employees) {
          await axios.post(`${apiUrl}/notification`, {
            title: title || 'Admin Notification',
            message: message,
            recipient_id: employee.id || employee._id,
            type: 'admin'
          }, { withCredentials: true });
        }
      } else {
        // Send to specific employee
        await axios.post(`${apiUrl}/notification`, {
          title: title || 'Admin Notification',
          message: message,
          recipient_id: recipient,
          type: 'admin'
        }, { withCredentials: true });
      }

      setSent(true);
      setTimeout(() => setSent(false), 3000);
      setMessage('');
      setTitle('');
      setRecipient('all');
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Bell size={22} /> Send Notification to Employees
      </h2>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
          <input
            type="text"
            className="w-full p-3 border border-gray-300 rounded-lg"
            placeholder="Notification title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Send To</label>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          >
            <option value="all">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id || emp._id} value={emp.id || emp._id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg"
            rows={4}
            placeholder="Type your notification message here..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
          />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button 
          type="submit" 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </button>
        {sent && <div className="text-green-600 mt-2">Notification sent successfully!</div>}
      </form>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('attendance');

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

