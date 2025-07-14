'use client';
import { useState, useEffect } from 'react';

export default function ConnectionStatus() {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      setApiUrl(url);
      
      console.log('Checking connection to:', url);
      
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('Health check response:', data);

      if (data.success) {
        setStatus('connected');
      } else {
        setStatus('error');
        setError(data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Connection check error:', err);
      setStatus('error');
      setError(err.message);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'checking': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected': return 'متصل';
      case 'checking': return 'در حال بررسی...';
      case 'error': return 'خطا در اتصال';
      default: return 'نامشخص';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h3 className="text-lg font-semibold mb-2">وضعیت اتصال به سرور</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>وضعیت:</span>
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span>آدرس سرور:</span>
          <span className="text-sm text-gray-600">{apiUrl}</span>
        </div>
        {error && (
          <div className="text-red-600 text-sm mt-2">
            خطا: {error}
          </div>
        )}
        <button
          onClick={checkConnection}
          className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
        >
          بررسی مجدد
        </button>
      </div>
    </div>
  );
} 