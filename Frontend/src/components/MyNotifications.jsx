// src/components/Employees/MyNotifications.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, BellOff, Check, Clock } from 'lucide-react';

const MyNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${apiUrl}/notifications`, {
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
const fetchNotifications = async () => {
  try {
    const response = await axios.get('/api/notifications/mynotifications');
    setNotifications(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Notifications endpoint not available');
      // Optionally set some state to show a user-friendly message
    } else {
      console.error('Error fetching notifications:', error);
    }
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

export default MyNotifications;