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
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
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
  ArcElement
);

const RatesChart = () => {
  const [ratesData, setRatesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRatesData();
  }, []);

  const fetchRatesData = async () => {
    try {
      setLoading(true);
      const [ratesResponse, statusResponse] = await Promise.all([
        api.rateSettings.getAll(),
        api.rateSettings.getStatus()
      ]);

      setRatesData({
        rates: ratesResponse.data,
        status: statusResponse.data
      });
    } catch (err) {
      setError('خطا در بارگذاری داده‌های نرخ‌ها');
      console.error('Error fetching rates data:', err);
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

  if (!ratesData) return null;

  const { rates, status } = ratesData;

  // نمودار دایره‌ای برای وضعیت نرخ‌ها
  const statusChartData = {
    labels: ['فعال', 'غیرفعال', 'آینده', 'منقضی شده'],
    datasets: [
      {
        data: [
          status.activeCount,
          status.inactiveCount,
          status.futureCount,
          status.expiredCount
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)', // سبز برای فعال
          'rgba(156, 163, 175, 0.8)', // خاکستری برای غیرفعال
          'rgba(59, 130, 246, 0.8)', // آبی برای آینده
          'rgba(239, 68, 68, 0.8)' // قرمز برای منقضی
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(156, 163, 175, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  // نمودار میله‌ای برای نرخ‌های فعال
  const activeRates = rates.filter(rate => rate.isActive);
  const barChartData = {
    labels: activeRates.map(rate => rate.title),
    datasets: [
      {
        label: 'نرخ به ازای هر کیلومتر (تومان)',
        data: activeRates.map(rate => rate.ratePerKm),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
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

  return (
    <div className="space-y-6">
      {/* خلاصه آماری */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">کل نرخ‌ها</p>
                <p className="text-2xl font-bold">{status.totalCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">نرخ‌های فعال</p>
                <p className="text-2xl font-bold text-green-600">{status.activeCount}</p>
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
                <p className="text-sm font-medium text-muted-foreground">نرخ‌های آینده</p>
                <p className="text-2xl font-bold text-blue-600">{status.futureCount}</p>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                آینده
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">نرخ‌های منقضی</p>
                <p className="text-2xl font-bold text-red-600">{status.expiredCount}</p>
              </div>
              <Badge variant="outline" className="bg-red-50 text-red-700">
                منقضی
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* نمودارها */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* نمودار دایره‌ای وضعیت نرخ‌ها */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">وضعیت نرخ‌ها</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <Doughnut data={statusChartData} options={chartOptions} />
            </div>
          </CardContent>
        </Card>

        {/* نمودار میله‌ای نرخ‌های فعال */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">نرخ‌های فعال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {activeRates.length > 0 ? (
                <Bar data={barChartData} options={barChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-muted-foreground">هیچ نرخ فعالی یافت نشد</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جدول نرخ‌های اخیر */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">نرخ‌های اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-2">عنوان</th>
                  <th className="text-right p-2">نرخ (تومان/کیلومتر)</th>
                  <th className="text-right p-2">تاریخ شروع</th>
                  <th className="text-right p-2">تاریخ پایان</th>
                  <th className="text-right p-2">وضعیت</th>
                </tr>
              </thead>
              <tbody>
                {rates.slice(0, 5).map((rate) => (
                  <tr key={rate.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{rate.title}</td>
                    <td className="p-2 font-medium">{rate.ratePerKm.toLocaleString()}</td>
                    <td className="p-2">{rate.startDate}</td>
                    <td className="p-2">{rate.endDate || '-'}</td>
                    <td className="p-2">
                      <Badge 
                        variant={rate.isCurrentlyActive ? "default" : "secondary"}
                        className={rate.isCurrentlyActive ? "bg-green-100 text-green-800" : ""}
                      >
                        {rate.isCurrentlyActive ? 'فعال' : 'غیرفعال'}
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

export default RatesChart; 