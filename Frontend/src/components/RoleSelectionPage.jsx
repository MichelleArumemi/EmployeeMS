import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Shield,
  User,
  ArrowRight
} from 'lucide-react';

const RoleSelectionPage = () => {
  const navigate = useNavigate();
const handleEmployeeClick = () => {
  console.log('Employee card clicked - going to /employeelogin');
  navigate('/employeelogin');
};

const handleAdminClick = () => {
  console.log('Admin card clicked - going to /adminlogin');
  navigate('/adminlogin');
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Employee Management System
          </h1>
          <p className="text-xl text-gray-600">
            Please select your role to continue
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          {/* Employee Role Card */}
          <div 
            onClick={handleEmployeeClick}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-blue-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="text-blue-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Employee</h2>
              <p className="text-gray-600 mb-6">
                Access your profile, manage attendance, apply for leave, and view notifications
              </p>
              <div className="flex items-center justify-center text-blue-600 font-medium">
                Continue as Employee
                <ArrowRight className="ml-2" size={20} />
              </div>
            </div>
          </div>
          
          {/* Admin Role Card */}
          <div 
            onClick={handleAdminClick}
            className="bg-white rounded-2xl shadow-lg p-8 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-purple-200"
          >
            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="text-purple-600" size={40} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Administrator</h2>
              <p className="text-gray-600 mb-6">
                Manage employees, approve leave requests, monitor attendance, and send notifications
              </p>
              <div className="flex items-center justify-center text-purple-600 font-medium">
                Continue as Admin
                <ArrowRight className="ml-2" size={20} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelectionPage;