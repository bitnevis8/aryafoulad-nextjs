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

const UsersChart = () => {
  const [usersData, setUsersData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsersData();
  }, []);

  const fetchUsersData = async () => {
    try {
      setLoading(true);
      const [usersResponse, rolesResponse] = await Promise.all([
        api.user.getAll(),
        api.user.roles.getAll()
      ]);

      setUsersData({
        users: usersResponse.data,
        roles: rolesResponse.data
      });
    } catch (err) {
      setError('خطا در بارگذاری داده‌های کاربران');
      console.error('Error fetching users data:', err);
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

  if (!usersData) return null;

  const { users, roles } = usersData;

  // محاسبه آمار کاربران
  const activeUsers = users.filter(user => user.isActive);
  const inactiveUsers = users.filter(user => !user.isActive);
  const verifiedUsers = users.filter(user => user.isEmailVerified);
  const unverifiedUsers = users.filter(user => !user.isEmailVerified);

  // محاسبه کاربران بر اساس نقش
  const usersByRole = {};
  roles.forEach(role => {
    usersByRole[role.nameFa] = users.filter(user => 
      user.UserRoles && user.UserRoles.some(ur => ur.Role && ur.Role.id === role.id)
    ).length;
  });

  // نمودار دایره‌ای برای وضعیت کاربران
  const statusChartData = {
    labels: ['فعال', 'غیرفعال', 'تایید شده', 'تایید نشده'],
    datasets: [
      {
        data: [
          activeUsers.length,
          inactiveUsers.length,
          verifiedUsers.length,
          unverifiedUsers.length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // سبز برای فعال
          'rgba(239, 68, 68, 0.8)', // قرمز برای غیرفعال
          'rgba(59, 130, 246, 0.8)', // آبی برای تایید شده
          'rgba(245, 158, 11, 0.8)' // نارنجی برای تایید نشده
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // نمودار میله‌ای برای کاربران بر اساس نقش
  const roleChartData = {
    labels: Object.keys(usersByRole),
    datasets: [
      {
        label: 'تعداد کاربران',
        data: Object.values(usersByRole),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // نمودار خطی برای ثبت‌نام ماهانه (شبیه‌سازی)
  const monthlyRegistrations = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
    const count = Math.floor(Math.random() * 10) + 1; // شبیه‌سازی
    monthlyRegistrations.push({ month: monthName, count });
  }

  const lineChartData = {
    labels: monthlyRegistrations.map(item => item.month),
    datasets: [
      {
        label: 'کاربران جدید',
        data: monthlyRegistrations.map(item => item.count),
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

  return (
    <div className="space-y-6">
      {/* خلاصه آماری */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل کاربران</p>
                <p className="text-2xl font-bold">{users.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">کاربران فعال</p>
                <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                فعال
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">تایید شده</p>
                <p className="text-2xl font-bold text-blue-600">{verifiedUsers.length}</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                تایید
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نقش‌های تعریف شده</p>
                <p className="text-2xl font-bold text-purple-600">{roles.length}</p>
              </div>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                نقش
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نمودار دایره‌ای وضعیت کاربران */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">وضعیت کاربران</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* نمودار میله‌ای کاربران بر اساس نقش */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">کاربران بر اساس نقش</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={roleChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودار خطی ثبت‌نام ماهانه */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">ثبت‌نام ماهانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* جدول کاربران اخیر */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">کاربران اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">نام کاربری</th>
                  <th className="text-right p-2">ایمیل</th>
                  <th className="text-right p-2">موبایل</th>
                  <th className="text-right p-2">وضعیت</th>
                  <th className="text-right p-2">تایید</th>
                </tr>
              </thead>
              <tbody>
                {users.slice(0, 5).map((user) => (
                  <tr key={user.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{user.username}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.mobile}</td>
                    <td className="p-2">
                      <Badge 
                        variant={user.isActive ? "default" : "secondary"}
                        className={user.isActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {user.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge 
                        variant={user.isEmailVerified ? "default" : "secondary"}
                        className={user.isEmailVerified ? "bg-blue-100 text-blue-800" : ""}
                      >
                        {user.isEmailVerified ? 'تایید شده' : 'تایید نشده'}
                      </Badge>
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

export default UsersChart; 