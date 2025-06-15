import React, { useState } from 'react';
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

// --- Admin Attendance: View employees currently at the office ---
const AdminAttendance = () => {
  // Dummy data for employees present
  const presentEmployees = [
    { id: 1, name: 'Alice Johnson', department: 'Sales', checkIn: '09:05 AM' },
    { id: 2, name: 'Bob Wilson', department: 'IT', checkIn: '08:55 AM' },
    { id: 3, name: 'David Brown', department: 'Finance', checkIn: '09:10 AM' },
  ];
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Users size={22} /> Employees Present Today
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Name</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Department</th>
              <th className="text-left py-3 px-4 text-gray-600 font-medium">Check-In Time</th>
            </tr>
          </thead>
          <tbody>
            {presentEmployees.map(emp => (
              <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{emp.name}</td>
                <td className="py-3 px-4 text-gray-600">{emp.department}</td>
                <td className="py-3 px-4 text-gray-600">{emp.checkIn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Admin Employee Profiles: View employee profiles and uploaded files ---
const AdminEmployeeProfiles = () => {
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Dummy data for employees with profiles and files
  const employees = [
    {
      id: 1,
      name: 'Alice Johnson',
      email: 'alice.johnson@company.com',
      department: 'Sales',
      position: 'Sales Manager',
      phone: '+1 (555) 123-4567',
      joinDate: '2023-01-15',
      address: '123 Main St, City, State 12345',
      emergencyContact: 'John Johnson - +1 (555) 987-6543',
      files: [
        { id: 1, name: 'Resume_Alice_Johnson.pdf', type: 'Resume', uploadDate: '2024-06-01', size: '245 KB' },
        { id: 2, name: 'ID_Copy_Alice.pdf', type: 'ID Document', uploadDate: '2024-06-01', size: '156 KB' },
        { id: 3, name: 'Bank_Details_Alice.pdf', type: 'Banking', uploadDate: '2024-06-02', size: '89 KB' },
      ]
    },
    {
      id: 2,
      name: 'Bob Wilson',
      email: 'bob.wilson@company.com',
      department: 'IT',
      position: 'Software Developer',
      phone: '+1 (555) 234-5678',
      joinDate: '2022-11-20',
      address: '456 Oak Ave, City, State 12345',
      emergencyContact: 'Sarah Wilson - +1 (555) 876-5432',
      files: [
        { id: 4, name: 'Resume_Bob_Wilson.pdf', type: 'Resume', uploadDate: '2024-05-28', size: '312 KB' },
        { id: 5, name: 'Passport_Bob.pdf', type: 'ID Document', uploadDate: '2024-05-28', size: '201 KB' },
        { id: 6, name: 'Certificates_Bob.pdf', type: 'Certification', uploadDate: '2024-05-30', size: '445 KB' },
      ]
    },
    {
      id: 3,
      name: 'David Brown',
      email: 'david.brown@company.com',
      department: 'Finance',
      position: 'Financial Analyst',
      phone: '+1 (555) 345-6789',
      joinDate: '2023-03-10',
      address: '789 Pine St, City, State 12345',
      emergencyContact: 'Emma Brown - +1 (555) 765-4321',
      files: [
        { id: 7, name: 'Resume_David_Brown.pdf', type: 'Resume', uploadDate: '2024-06-03', size: '278 KB' },
        { id: 8, name: 'License_David.pdf', type: 'ID Document', uploadDate: '2024-06-03', size: '134 KB' },
      ]
    },
  ];

  const handleViewFile = (fileName) => {
    alert(`Viewing file: ${fileName}`);
  };

  const handleDownloadFile = (fileName) => {
    alert(`Downloading file: ${fileName}`);
  };

  if (selectedEmployee) {
    const employee = employees.find(emp => emp.id === selectedEmployee);
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <User size={22} /> {employee.name} - Profile
          </h2>
          <button 
            onClick={() => setSelectedEmployee(null)}
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
              <div>
                <label className="text-sm font-medium text-gray-600">Full Name</label>
                <p className="text-gray-900">{employee.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-gray-900">{employee.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Phone</label>
                <p className="text-gray-900">{employee.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Address</label>
                <p className="text-gray-900">{employee.address}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Emergency Contact</label>
                <p className="text-gray-900">{employee.emergencyContact}</p>
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Information</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Department</label>
                <p className="text-gray-900">{employee.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Position</label>
                <p className="text-gray-900">{employee.position}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Join Date</label>
                <p className="text-gray-900">{employee.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText size={20} /> Uploaded Files
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {employee.files.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">File Name</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Upload Date</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Size</th>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employee.files.map(file => (
                      <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-100">
                        <td className="py-3 px-4 text-gray-900">{file.name}</td>
                        <td className="py-3 px-4 text-gray-600">{file.type}</td>
                        <td className="py-3 px-4 text-gray-600">{file.uploadDate}</td>
                        <td className="py-3 px-4 text-gray-600">{file.size}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewFile(file.name)}
                              className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              title="View File"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => handleDownloadFile(file.name)}
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Download File"
                            >
                              <Download size={16} />
                            </button>
                          </div>
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
          <div key={employee.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                <p className="text-sm text-gray-600">{employee.position}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p><span className="font-medium">Department:</span> {employee.department}</p>
              <p><span className="font-medium">Email:</span> {employee.email}</p>
              <p><span className="font-medium">Files:</span> {employee.files.length} uploaded</p>
            </div>
            <button 
              onClick={() => setSelectedEmployee(employee.id)}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Admin Leave Management: View/Approve/Reject employee leaves ---
const AdminLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([
    { id: 1, name: 'Alice Johnson', type: 'Annual', start: '2024-06-20', end: '2024-06-22', days: 3, status: 'Pending', reason: 'Family trip' },
    { id: 2, name: 'Bob Wilson', type: 'Sick', start: '2024-06-15', end: '2024-06-16', days: 2, status: 'Approved', reason: 'Flu' },
    { id: 3, name: 'David Brown', type: 'Personal', start: '2024-06-18', end: '2024-06-18', days: 1, status: 'Pending', reason: 'Bank work' },
  ]);
  const handleAction = (id, action) => {
    setLeaveRequests(prev => prev.map(lr => lr.id === id ? { ...lr, status: action } : lr));
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Calendar size={22} /> Employee Leave Requests
      </h2>
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
            {leaveRequests.map(req => (
              <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-900">{req.name}</td>
                <td className="py-3 px-4 text-gray-600">{req.type}</td>
                <td className="py-3 px-4 text-gray-600">{req.start} - {req.end}</td>
                <td className="py-3 px-4 text-gray-600">{req.days}</td>
                <td className="py-3 px-4 text-gray-600">{req.reason}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {req.status === 'Pending' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleAction(req.id, 'Approved')} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs">Approve</button>
                      <button onClick={() => handleAction(req.id, 'Rejected')} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs">Reject</button>
                    </div>
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
                <td className="py-3 px-4 text-gray-600">${pay.gross.toLocaleString()}</td>
                <td className="py-3 px-4 text-gray-600">${pay.deductions.toLocaleString()}</td>
                <td className="py-3 px-4 text-green-700 font-semibold">${pay.net.toLocaleString()}</td>
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
  const [sent, setSent] = useState(false);
  const handleSend = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 2000);
    setMessage('');
  };
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Bell size={22} /> Send Notification to Employees
      </h2>
      <div className="space-y-4">
        <textarea
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={4}
          placeholder="Type your notification message here..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
        <button onClick={handleSend} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send Notification</button>
        {sent && <div className="text-green-600 mt-2">Notification sent!</div>}
      </div>
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