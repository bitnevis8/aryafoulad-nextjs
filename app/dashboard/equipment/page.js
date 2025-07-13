"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import EquipmentList from '@/app/components/equipment/EquipmentList/EquipmentList';

export default function EquipmentDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEquipment: 0,
    activeEquipment: 0,
    assignedEquipment: 0,
    needsCalibration: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.equipment.getAll);
      const data = await response.json();
      
      if (data.success) {
        const equipment = data.data || [];
        setStats({
          totalEquipment: equipment.length,
          activeEquipment: equipment.filter(e => e.status === 'active').length,
          assignedEquipment: equipment.filter(e => e.current_assignment).length,
          needsCalibration: equipment.filter(e => e.needs_calibration).length
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'افزودن تجهیز جدید',
      description: 'ثبت تجهیز جدید در سیستم',
      icon: '📦',
      action: () => router.push('/dashboard/equipment/equipment/create'),
      color: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
    },
    {
      title: 'واگذاری تجهیز',
      description: 'واگذاری تجهیز به کاربر',
      icon: '🚀',
      action: () => router.push('/dashboard/equipment/assignments/create'),
      color: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
    },
    {
      title: 'مدیریت انبارها',
      description: 'مدیریت انبارها و موقعیت‌ها',
      icon: '🏢',
      action: () => router.push('/dashboard/equipment/warehouse'),
      color: 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
    },
    {
      title: 'گزارش کالیبراسیون',
      description: 'مشاهده گزارش‌های کالیبراسیون',
      icon: '📈',
      action: () => router.push('/dashboard/equipment/calibration-reports'),
      color: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            مرور کلی
          </h1>
          <p className="text-gray-600 text-lg">
            خلاصه‌ای از وضعیت تجهیزات و عملیات‌های مهم
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">کل تجهیزات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
              </div>
              <div className="text-3xl text-blue-500">📦</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">تجهیزات فعال</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeEquipment}</p>
              </div>
              <div className="text-3xl text-green-500">✅</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">واگذار شده</p>
                <p className="text-2xl font-bold text-gray-900">{stats.assignedEquipment}</p>
              </div>
              <div className="text-3xl text-orange-500">📤</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">نیاز کالیبراسیون</p>
                <p className="text-2xl font-bold text-gray-900">{stats.needsCalibration}</p>
              </div>
              <div className="text-3xl text-purple-500">🔧</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">عملیات سریع</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white rounded-lg p-4 text-left transition-all duration-200 hover:scale-105 hover:shadow-lg`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                <p className="text-xs opacity-90">{action.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">لیست تجهیزات</h2>
          </div>
          <div className="p-6">
            <EquipmentList />
          </div>
        </div>
      </div>
    </div>
  );
} 