'use client';

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { api } from '../../../config/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const MissionsChart = () => {
  const [missionsData, setMissionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMissionsData();
  }, []);

  const fetchMissionsData = async () => {
    try {
      setLoading(true);
      const missionsResponse = await api.missionOrder.getAll();

      setMissionsData({
        missions: missionsResponse.data
      });
    } catch (err) {
      setError('خطا در بارگذاری داده‌های ماموریت‌ها');
      console.error('Error fetching missions data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">در حال بارگذاری...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-red-500">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!missionsData) return null;

  const { missions } = missionsData;

  // محاسبه آمار ماموریت‌ها
  const completedMissions = missions.filter(mission => mission.status === 'completed');
  const pendingMissions = missions.filter(mission => mission.status === 'pending');
  const cancelledMissions = missions.filter(mission => mission.status === 'cancelled');
  const inProgressMissions = missions.filter(mission => mission.status === 'in_progress');

  // محاسبه کل مسافت طی شده
  const totalDistance = missions.reduce((sum, mission) => sum + (mission.distance || 0), 0);
  
  // محاسبه کل هزینه
  const totalCost = missions.reduce((sum, mission) => sum + (mission.totalCost || 0), 0);

  // نمودار دایره‌ای برای وضعیت ماموریت‌ها
  const statusChartData = {
    labels: ['تکمیل شده', 'در انتظار', 'لغو شده', 'در حال انجام'],
    datasets: [
      {
        data: [
          completedMissions.length,
          pendingMissions.length,
          cancelledMissions.length,
          inProgressMissions.length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // سبز برای تکمیل شده
          'rgba(245, 158, 11, 0.8)', // نارنجی برای در انتظار
          'rgba(239, 68, 68, 0.8)', // قرمز برای لغو شده
          'rgba(59, 130, 246, 0.8)' // آبی برای در حال انجام
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // نمودار میله‌ای برای ماموریت‌های ماهانه (شبیه‌سازی)
  const monthlyMissions = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
    const count = Math.floor(Math.random() * 20) + 5; // شبیه‌سازی
    monthlyMissions.push({ month: monthName, count });
  }

  const barChartData = {
    labels: monthlyMissions.map(item => item.month),
    datasets: [
      {
        label: 'تعداد ماموریت‌ها',
        data: monthlyMissions.map(item => item.count),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // نمودار خطی برای مسافت طی شده ماهانه
  const monthlyDistance = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
    const distance = Math.floor(Math.random() * 5000) + 1000; // شبیه‌سازی
    monthlyDistance.push({ month: monthName, distance });
  }

  const lineChartData = {
    labels: monthlyDistance.map(item => item.month),
    datasets: [
      {
        label: 'مسافت طی شده (کیلومتر)',
        data: monthlyDistance.map(item => item.distance),
        borderColor: 'rgba(34, 197, 94, 1)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            family: 'Vazirmatn',
            size: 12
          }
        }
      },
      tooltip: {
        titleFont: {
          family: 'Vazirmatn',
          size: 14
        },
        bodyFont: {
          family: 'Vazirmatn',
          size: 12
        }
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Vazirmatn',
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Vazirmatn',
            size: 12
          }
        }
      }
    }
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: 'Vazirmatn',
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            family: 'Vazirmatn',
            size: 12
          }
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { label: 'تکمیل شده', className: 'bg-green-100 text-green-800' },
      pending: { label: 'در انتظار', className: 'bg-yellow-100 text-yellow-800' },
      cancelled: { label: 'لغو شده', className: 'bg-red-100 text-red-800' },
      in_progress: { label: 'در حال انجام', className: 'bg-blue-100 text-blue-800' }
    };
    
    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* خلاصه آماری */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل ماموریت‌ها</p>
                <p className="text-2xl font-bold">{missions.length}</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                کل
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ماموریت‌های تکمیل شده</p>
                <p className="text-2xl font-bold text-green-600">{completedMissions.length}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                تکمیل
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل مسافت (کیلومتر)</p>
                <p className="text-2xl font-bold text-purple-600">{totalDistance.toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                مسافت
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل هزینه (تومان)</p>
                <p className="text-2xl font-bold text-orange-600">{totalCost.toLocaleString()}</p>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                هزینه
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نمودار دایره‌ای وضعیت ماموریت‌ها */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">وضعیت ماموریت‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* نمودار میله‌ای ماموریت‌های ماهانه */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">ماموریت‌های ماهانه</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={barChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودار خطی مسافت ماهانه */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">مسافت طی شده ماهانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* جدول ماموریت‌های اخیر */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ماموریت‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">عنوان ماموریت</th>
                  <th className="text-right p-2">مسافت (کیلومتر)</th>
                  <th className="text-right p-2">هزینه (تومان)</th>
                  <th className="text-right p-2">تاریخ شروع</th>
                  <th className="text-right p-2">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {missions.slice(0, 5).map((mission) => (
                  <tr key={mission.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{mission.title}</td>
                    <td className="p-2">{mission.distance?.toLocaleString() || '-'}</td>
                    <td className="p-2">{mission.totalCost?.toLocaleString() || '-'}</td>
                    <td className="p-2">{mission.startDate}</td>
                    <td className="p-2">
                      {getStatusBadge(mission.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MissionsChart; 