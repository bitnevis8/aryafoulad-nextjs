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

const EquipmentChart = () => {
  const [equipmentData, setEquipmentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      const equipmentResponse = await api.equipment.getAll();

      setEquipmentData({
        equipment: equipmentResponse.data
      });
    } catch (err) {
      setError('خطا در بارگذاری داده‌های تجهیزات');
      console.error('Error fetching equipment data:', err);
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

  if (!equipmentData) return null;

  const { equipment } = equipmentData;

  // محاسبه آمار تجهیزات
  const availableEquipment = equipment.filter(item => item.status === 'available');
  const assignedEquipment = equipment.filter(item => item.status === 'assigned');
  const maintenanceEquipment = equipment.filter(item => item.status === 'maintenance');
  const retiredEquipment = equipment.filter(item => item.status === 'retired');

  // محاسبه تجهیزات بر اساس نوع
  const equipmentByType = {};
  equipment.forEach(item => {
    const type = item.type || 'نامشخص';
    equipmentByType[type] = (equipmentByType[type] || 0) + 1;
  });

  // محاسبه تجهیزات نیازمند کالیبراسیون
  const needsCalibration = equipment.filter(item => {
    if (!item.lastCalibrationDate) return true;
    const lastCalibration = new Date(item.lastCalibrationDate);
    const now = new Date();
    const monthsSinceCalibration = (now - lastCalibration) / (1000 * 60 * 60 * 24 * 30);
    return monthsSinceCalibration > 12; // فرض بر اینکه کالیبراسیون سالانه نیاز است
  });

  // نمودار دایره‌ای برای وضعیت تجهیزات
  const statusChartData = {
    labels: ['موجود', 'تخصیص داده شده', 'در تعمیر', 'بازنشسته'],
    datasets: [
      {
        data: [
          availableEquipment.length,
          assignedEquipment.length,
          maintenanceEquipment.length,
          retiredEquipment.length
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // سبز برای موجود
          'rgba(59, 130, 246, 0.8)', // آبی برای تخصیص داده شده
          'rgba(245, 158, 11, 0.8)', // نارنجی برای در تعمیر
          'rgba(156, 163, 175, 0.8)' // خاکستری برای بازنشسته
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // نمودار میله‌ای برای تجهیزات بر اساس نوع
  const typeChartData = {
    labels: Object.keys(equipmentByType),
    datasets: [
      {
        label: 'تعداد تجهیزات',
        data: Object.values(equipmentByType),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 1,
      },
    ],
  };

  // نمودار خطی برای کالیبراسیون ماهانه (شبیه‌سازی)
  const monthlyCalibrations = [];
  const currentDate = new Date();
  for (let i = 5; i >= 0; i--) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('fa-IR', { month: 'short' });
    const count = Math.floor(Math.random() * 8) + 2; // شبیه‌سازی
    monthlyCalibrations.push({ month: monthName, count });
  }

  const lineChartData = {
    labels: monthlyCalibrations.map(item => item.month),
    datasets: [
      {
        label: 'تعداد کالیبراسیون‌ها',
        data: monthlyCalibrations.map(item => item.count),
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
      available: { label: 'موجود', className: 'bg-green-100 text-green-800' },
      assigned: { label: 'تخصیص داده شده', className: 'bg-blue-100 text-blue-800' },
      maintenance: { label: 'در تعمیر', className: 'bg-yellow-100 text-yellow-800' },
      retired: { label: 'بازنشسته', className: 'bg-gray-100 text-gray-800' }
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
                <p className="text-sm font-medium text-muted-foreground">کل تجهیزات</p>
                <p className="text-2xl font-bold">{equipment.length}</p>
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
                <p className="text-sm font-medium text-muted-foreground">تجهیزات موجود</p>
                <p className="text-2xl font-bold text-green-600">{availableEquipment.length}</p>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                موجود
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نیازمند کالیبراسیون</p>
                <p className="text-2xl font-bold text-orange-600">{needsCalibration.length}</p>
              </div>
              <Badge variant="outline" className="bg-orange-50 text-orange-700">
                کالیبراسیون
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">در تعمیر</p>
                <p className="text-2xl font-bold text-yellow-600">{maintenanceEquipment.length}</p>
              </div>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                تعمیر
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نمودار دایره‌ای وضعیت تجهیزات */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">وضعیت تجهیزات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* نمودار میله‌ای تجهیزات بر اساس نوع */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">تجهیزات بر اساس نوع</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Bar data={typeChartData} options={barChartOptions} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودار خطی کالیبراسیون ماهانه */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">کالیبراسیون ماهانه</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* جدول تجهیزات اخیر */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">تجهیزات اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">نام تجهیز</th>
                  <th className="text-right p-2">نوع</th>
                  <th className="text-right p-2">شماره سریال</th>
                  <th className="text-right p-2">آخرین کالیبراسیون</th>
                  <th className="text-right p-2">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {equipment.slice(0, 5).map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{item.name}</td>
                    <td className="p-2">{item.type || '-'}</td>
                    <td className="p-2">{item.serialNumber || '-'}</td>
                    <td className="p-2">{item.lastCalibrationDate || 'کالیبره نشده'}</td>
                    <td className="p-2">
                      {getStatusBadge(item.status)}
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

export default EquipmentChart; 