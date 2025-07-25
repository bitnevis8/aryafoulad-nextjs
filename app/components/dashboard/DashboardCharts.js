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
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { API_ENDPOINTS } from '../../config/api';

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

const DashboardCharts = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchData = async (url) => {
    try {
      const response = await fetch(url, {
        credentials: 'include', // برای ارسال cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching from ${url}:`, error);
      return null;
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // دریافت داده‌های مختلف به صورت همزمان
      const [usersData, missionsData, ratesData, equipmentData] = await Promise.all([
        fetchData(API_ENDPOINTS.users.getAll),
        fetchData(API_ENDPOINTS.missionOrders.getAll),
        fetchData(API_ENDPOINTS.rateSettings.getAll),
        fetchData(API_ENDPOINTS.equipment.getAll)
      ]);

      // پردازش داده‌های کاربران مانند صفحه مدیریت کاربران
      let users = [];
      if (usersData?.success) {
        if (usersData.data && Array.isArray(usersData.data.users)) {
          users = usersData.data.users;
        } else if (Array.isArray(usersData.data)) {
          users = usersData.data;
        }
      }

      const data = {
        users: users,
        missions: missionsData?.data || [],
        rates: ratesData?.data || [],
        equipment: equipmentData?.data || []
      };

      console.log('Users Data:', {
        raw: usersData,
        processed: users,
        success: usersData?.success,
        hasData: !!usersData?.data,
        isArray: Array.isArray(usersData?.data),
        hasUsers: !!usersData?.data?.users,
        usersArray: Array.isArray(usersData?.data?.users)
      });

      setDashboardData(data);
    } catch (err) {
      setError('خطا در بارگذاری داده‌های داشبورد');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // محاسبه آمار
  const getStats = () => {
    if (!dashboardData) return {};

    const users = Array.isArray(dashboardData.users) ? dashboardData.users : [];
    const missions = Array.isArray(dashboardData.missions) ? dashboardData.missions : [];
    const rates = Array.isArray(dashboardData.rates) ? dashboardData.rates : [];
    const equipment = Array.isArray(dashboardData.equipment) ? dashboardData.equipment : [];

    const activeUsers = users.filter(user => user.isActive);
    const activeMissions = missions.filter(mission => mission.status === 'in_progress' || mission.status === 'pending');
    const activeRates = rates.filter(rate => rate.isActive);
    const availableEquipment = equipment.filter(item => item.status === 'available');

    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalMissions: missions.length,
      activeMissions: activeMissions.length,
      totalRates: rates.length,
      activeRates: activeRates.length,
      totalEquipment: equipment.length,
      availableEquipment: availableEquipment.length
    };
  };

  // نمودار وضعیت کاربران
  const getUsersChartData = () => {
    if (!dashboardData?.users) return null;

    const users = Array.isArray(dashboardData.users) ? dashboardData.users : [];
    const activeUsers = users.filter(user => user.isActive).length;
    const inactiveUsers = users.length - activeUsers;

    return {
      labels: ['کاربران فعال', 'کاربران غیرفعال'],
      datasets: [
        {
          data: [activeUsers, inactiveUsers],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(156, 163, 175, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // نمودار وضعیت ماموریت‌ها
  const getMissionsChartData = () => {
    if (!dashboardData?.missions) return null;

    const missions = Array.isArray(dashboardData.missions) ? dashboardData.missions : [];
    const completed = missions.filter(m => m.status === 'completed').length;
    const inProgress = missions.filter(m => m.status === 'in_progress').length;
    const pending = missions.filter(m => m.status === 'pending').length;
    const cancelled = missions.filter(m => m.status === 'cancelled').length;

    return {
      labels: ['تکمیل شده', 'در حال انجام', 'در انتظار', 'لغو شده'],
      datasets: [
        {
          data: [completed, inProgress, pending, cancelled],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)',
            'rgba(239, 68, 68, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // نمودار وضعیت نرخ‌ها
  const getRatesChartData = () => {
    if (!dashboardData?.rates) return null;

    const rates = Array.isArray(dashboardData.rates) ? dashboardData.rates : [];
    const activeRates = rates.filter(rate => rate.isActive).length;
    const inactiveRates = rates.length - activeRates;

    return {
      labels: ['نرخ‌های فعال', 'نرخ‌های غیرفعال'],
      datasets: [
        {
          data: [activeRates, inactiveRates],
          backgroundColor: [
            'rgba(168, 85, 247, 0.8)',
            'rgba(156, 163, 175, 0.8)'
          ],
          borderColor: [
            'rgba(168, 85, 247, 1)',
            'rgba(156, 163, 175, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // نمودار وضعیت تجهیزات
  const getEquipmentChartData = () => {
    if (!dashboardData?.equipment) return null;

    const equipment = Array.isArray(dashboardData.equipment) ? dashboardData.equipment : [];
    const available = equipment.filter(item => item.status === 'available').length;
    const assigned = equipment.filter(item => item.status === 'assigned').length;
    const maintenance = equipment.filter(item => item.status === 'maintenance').length;

    return {
      labels: ['موجود', 'تخصیص داده شده', 'در تعمیر'],
      datasets: [
        {
          data: [available, assigned, maintenance],
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(245, 158, 11, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // نمودار خطی برای ماموریت‌های ماهانه (شبیه‌سازی)
  const getMonthlyMissionsData = () => {
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور'];
    const missionsCount = [12, 19, 15, 25, 22, 30]; // داده‌های شبیه‌سازی شده

    return {
      labels: months,
      datasets: [
        {
          label: 'تعداد ماموریت‌ها',
          data: missionsCount,
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
        },
      ],
    };
  };

  const stats = getStats();

  const tabs = [
    {
      id: 'overview',
      label: 'نمای کلی',
      icon: '📊',
      description: 'خلاصه‌ای از تمام بخش‌ها'
    },
    {
      id: 'rates',
      label: 'نرخ‌ها',
      icon: '💰',
      description: 'مدیریت و آمار نرخ‌ها'
    },
    {
      id: 'users',
      label: 'کاربران',
      icon: '👥',
      description: 'آمار کاربران و نقش‌ها'
    },
    {
      id: 'missions',
      label: 'ماموریت‌ها',
      icon: '🚗',
      description: 'آمار ماموریت‌ها و مسافت‌ها'
    },
    {
      id: 'equipment',
      label: 'تجهیزات',
      icon: '🔧',
      description: 'مدیریت تجهیزات و کالیبراسیون'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-gray-600">در حال بارگذاری داده‌ها...</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-sm text-gray-500">در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* هدر داشبورد */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">داشبورد</h1>
        <p className="text-gray-600">
          مشاهده آمار و نمودارهای مختلف سیستم
        </p>
      </div>

      {/* تب‌های اصلی */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center space-x-2">
              <span className="text-lg">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* نمای کلی */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل کاربران</CardTitle>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">
                  👥
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-gray-500">
                  {stats.activeUsers} کاربر فعال
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ماموریت‌های فعال</CardTitle>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  🚗
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeMissions}</div>
                <p className="text-xs text-gray-500">
                  از {stats.totalMissions} ماموریت کل
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">نرخ‌های فعال</CardTitle>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">
                  💰
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeRates}</div>
                <p className="text-xs text-gray-500">
                  از {stats.totalRates} نرخ کل
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تجهیزات موجود</CardTitle>
                <Badge variant="outline" className="bg-orange-50 text-orange-700">
                  🔧
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.availableEquipment}</div>
                <p className="text-xs text-gray-500">
                  از {stats.totalEquipment} تجهیز کل
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نمودار وضعیت کاربران */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">وضعیت کاربران</CardTitle>
              </CardHeader>
              <CardContent>
                {getUsersChartData() ? (
                  <div className="h-64">
                    <Doughnut 
                      data={getUsersChartData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* نمودار ماموریت‌های ماهانه */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">ماموریت‌های ماهانه</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={getMonthlyMissionsData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">آخرین فعالیت‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(dashboardData?.missions || []).slice(0, 3).map((mission, index) => (
                    <div key={mission.id} className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'}`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{mission.title || 'ماموریت جدید'}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(mission.createdAt).toLocaleDateString('fa-IR')}
                        </p>
                      </div>
                    </div>
                  ))}
                  {(!dashboardData?.missions || (dashboardData.missions || []).length === 0) && (
                    <p className="text-sm text-gray-500">هیچ فعالیتی یافت نشد</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">وضعیت سیستم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">سرور API</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      آنلاین
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">دیتابیس</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      متصل
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">فایل سرور</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      فعال
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ایمیل</span>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      آماده
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* نمودار نرخ‌ها */}
        <TabsContent value="rates" className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💰</span>
            <div>
              <h2 className="text-2xl font-bold">مدیریت نرخ‌ها</h2>
              <p className="text-gray-600">مشاهده آمار و وضعیت نرخ‌های سیستم</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نمودار وضعیت نرخ‌ها */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">وضعیت نرخ‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                {getRatesChartData() ? (
                  <div className="h-64">
                    <Doughnut 
                      data={getRatesChartData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* لیست نرخ‌ها */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">لیست نرخ‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.rates && (dashboardData.rates || []).length > 0 ? (
                  <div className="space-y-4">
                    {(dashboardData.rates || []).map((rate) => (
                      <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{rate.title}</h4>
                          <p className="text-sm text-gray-500">{rate.ratePerKm.toLocaleString()} تومان</p>
                        </div>
                        <Badge 
                          variant={rate.isActive ? "default" : "secondary"}
                          className={rate.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {rate.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">هیچ نرخی یافت نشد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* نمودار کاربران */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">👥</span>
            <div>
              <h2 className="text-2xl font-bold">مدیریت کاربران</h2>
              <p className="text-gray-600">مشاهده آمار کاربران و نقش‌های سیستم</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نمودار وضعیت کاربران */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">وضعیت کاربران</CardTitle>
              </CardHeader>
              <CardContent>
                {getUsersChartData() ? (
                  <div className="h-64">
                    <Doughnut 
                      data={getUsersChartData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* لیست کاربران */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">لیست کاربران</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.users && (dashboardData.users || []).length > 0 ? (
                  <div className="space-y-4">
                    {(dashboardData.users || []).slice(0, 6).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{user.username}</h4>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <Badge 
                          variant={user.isActive ? "default" : "secondary"}
                          className={user.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {user.isActive ? 'فعال' : 'غیرفعال'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">هیچ کاربری یافت نشد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* نمودار ماموریت‌ها */}
        <TabsContent value="missions" className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚗</span>
            <div>
              <h2 className="text-2xl font-bold">مدیریت ماموریت‌ها</h2>
              <p className="text-gray-600">مشاهده آمار ماموریت‌ها و مسافت‌های طی شده</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نمودار وضعیت ماموریت‌ها */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">وضعیت ماموریت‌ها</CardTitle>
              </CardHeader>
              <CardContent>
                {getMissionsChartData() ? (
                  <div className="h-64">
                    <Doughnut 
                      data={getMissionsChartData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* نمودار ماموریت‌های ماهانه */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">ماموریت‌های ماهانه</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <Line 
                    data={getMonthlyMissionsData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* لیست ماموریت‌ها */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold">لیست ماموریت‌ها</CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData?.missions && (dashboardData.missions || []).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(dashboardData.missions || []).slice(0, 6).map((mission) => (
                    <div key={mission.id} className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">{mission.title || 'ماموریت'}</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">وضعیت:</span>
                          <Badge 
                            variant="outline"
                            className={
                              mission.status === 'completed' ? "bg-green-100 text-green-800" :
                              mission.status === 'in_progress' ? "bg-blue-100 text-blue-800" :
                              mission.status === 'pending' ? "bg-yellow-100 text-yellow-800" :
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {mission.status === 'completed' ? 'تکمیل شده' :
                             mission.status === 'in_progress' ? 'در حال انجام' :
                             mission.status === 'pending' ? 'در انتظار' :
                             mission.status}
                          </Badge>
                        </div>
                        {mission.distance && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-500">مسافت:</span>
                            <span className="font-medium">{mission.distance.toLocaleString()} کیلومتر</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          {new Date(mission.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-500">هیچ ماموریتی یافت نشد</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* نمودار تجهیزات */}
        <TabsContent value="equipment" className="space-y-6">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔧</span>
            <div>
              <h2 className="text-2xl font-bold">مدیریت تجهیزات</h2>
              <p className="text-gray-600">مشاهده آمار تجهیزات و وضعیت کالیبراسیون</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* نمودار وضعیت تجهیزات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">وضعیت تجهیزات</CardTitle>
              </CardHeader>
              <CardContent>
                {getEquipmentChartData() ? (
                  <div className="h-64">
                    <Doughnut 
                      data={getEquipmentChartData()} 
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'bottom',
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">داده‌ای برای نمایش وجود ندارد</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* لیست تجهیزات */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">لیست تجهیزات</CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData?.equipment && (dashboardData.equipment || []).length > 0 ? (
                  <div className="space-y-4">
                    {(dashboardData.equipment || []).slice(0, 6).map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-gray-500">{item.type || 'نوع نامشخص'}</p>
                        </div>
                        <Badge 
                          variant="outline"
                          className={
                            item.status === 'available' ? "bg-green-100 text-green-800" :
                            item.status === 'assigned' ? "bg-blue-100 text-blue-800" :
                            item.status === 'maintenance' ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }
                        >
                          {item.status === 'available' ? 'موجود' :
                           item.status === 'assigned' ? 'تخصیص داده شده' :
                           item.status === 'maintenance' ? 'در تعمیر' :
                           item.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">هیچ تجهیزی یافت نشد</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardCharts; 