'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/app/context/AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || (process.env.NODE_ENV === 'production' ? 'https://aryafoulad-api.pourdian.com:3010' : 'http://localhost:3000');

export default function WebSocketStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState('disconnected');
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;

    console.log('Attempting to connect to:', SOCKET_URL);
    setStatus('connecting');

    const s = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      timeout: 20000,
      forceNew: true
    });

    s.on('connect', () => {
      console.log('✅ Socket connected successfully');
      setStatus('connected');
      setError(null);
      
      const userData = {
        id: user.userId || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      };
      s.emit('user-online', userData);
    });

    s.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      setStatus('error');
      setError(error.message);
    });

    s.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setStatus('disconnected');
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, [user]);

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'connecting': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'متصل';
      case 'connecting': return 'در حال اتصال...';
      case 'error': return 'خطا در اتصال';
      default: return 'قطع اتصال';
    }
  };

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">وضعیت اتصال WebSocket</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>وضعیت:</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>سرور:</span>
          <span className="text-sm text-gray-600">{SOCKET_URL}</span>
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2">
            خطا: {error}
          </div>
        )}
      </div>
    </div>
  );
} 