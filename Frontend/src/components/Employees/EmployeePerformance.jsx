import React from 'react';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

const EmployeePerformance = () => {
  const employees = [
    { id: 1, name: 'Sarah Johnson', department: 'Marketing', status: 'Active', performance: 92, attendance: 98 },
    { id: 2, name: 'Mike Chen', department: 'Development', status: 'Active', performance: 88, attendance: 85 },
    { id: 3, name: 'Emily Davis', department: 'HR', status: 'Active', performance: 95, attendance: 100 },
    { id: 4, name: 'James Wilson', department: 'Sales', status: 'Active', performance: 90, attendance: 92 }
  ];

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Performance Tracking</h3>
        <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
          Generate Report
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-4">Team Performance</h4>
          <div className="space-y-3">
            {employees.map(employee => (
              <div key={employee.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{employee.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${employee.performance}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{employee.performance}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-green-600" />
                <span className="text-sm font-medium">Goals Met</span>
              </div>
              <span className="text-lg font-bold text-green-600">87%</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-600" />
                <span className="text-sm font-medium">Avg Rating</span>
              </div>
              <span className="text-lg font-bold text-blue-600">4.2</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-purple-600" />
                <span className="text-sm font-medium">Improvement</span>
              </div>
              <span className="text-lg font-bold text-purple-600">+12%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeePerformance;