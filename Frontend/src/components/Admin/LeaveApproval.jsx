import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { format } from 'date-fns';
import { io } from 'socket.io-client';

const LeaveApproval = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to Socket.IO
    const newSocket = io(process.env.REACT_APP_API_URL, {
      withCredentials: true
    });
    setSocket(newSocket);

    // Join admin room
    newSocket.emit('join', 'admin_room');

    // Listen for new leave requests
    newSocket.on('new_leave_request', () => {
      fetchPendingRequests();
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  

  const fetchPendingRequests = async () => {
    try {
await axios.patch(`/api/leave/${requestId}/status`, {
  status: 'approved'
}, {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

      setPendingRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching pending leave requests:', error);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await axios.patch(`/api/leave/${requestId}/status`, {
        status: 'approved'
      }, {
        withCredentials: true
      });
      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving leave request:', error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      await axios.patch(`/api/leave/${requestId}/status`, {
        status: 'rejected'
      }, {
        withCredentials: true
      });
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting leave request:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Leave Request Approvals</h1>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="py-2 px-4 border">Employee</th>
              <th className="py-2 px-4 border">Start Date</th>
              <th className="py-2 px-4 border">End Date</th>
              <th className="py-2 px-4 border">Reason</th>
              <th className="py-2 px-4 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pendingRequests.map((request) => (
              <tr key={request._id}>
                <td className="py-2 px-4 border">
                  {request.employee?.name || 'Unknown'}
                </td>
                <td className="py-2 px-4 border">
                  {format(new Date(request.startDate), 'MMM dd, yyyy')}
                </td>
                <td className="py-2 px-4 border">
                  {format(new Date(request.endDate), 'MMM dd, yyyy')}
                </td>
                <td className="py-2 px-4 border">{request.reason || '-'}</td>
                <td className="py-2 px-4 border">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleApprove(request._id)}
                      className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pendingRequests.length === 0 && (
              <tr>
                <td colSpan="5" className="py-4 px-4 border text-center">
                  No pending leave requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveApproval;