'use client';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/app/context/AuthContext';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://aryafoulad-api.pourdian.com';

export default function OnlineUsers() {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!user) return;
    // اتصال به سرور Socket.io
    const s = io(SOCKET_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
    setSocket(s);

    // ارسال اطلاعات کاربر پس از اتصال
    s.on('connect', () => {
      s.emit('user-online', {
        id: user.userId || user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      });
    });

    // دریافت لیست کاربران آنلاین
    s.on('online-users', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">کاربران آنلاین</h3>
      {onlineUsers.length === 0 ? (
        <div className="text-gray-500">کاربری آنلاین نیست</div>
      ) : (
        <ul className="space-y-1">
          {onlineUsers.map((u) => (
            <li key={u.id || u.userId || u.email} className="text-sm text-gray-800">
              {u.firstName || ''} {u.lastName || ''} <span className="text-gray-400">({u.email})</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 