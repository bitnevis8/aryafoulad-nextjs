"use client";

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const CalibrationReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.calibrationHistory.report);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت گزارش');
      }
      setReportData(data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getCalibrationStatus = (equipment) => {
    const today = new Date();
    const nextCalibration = new Date(equipment.next_calibration_date);
    
    if (nextCalibration < today) {
      return <span className="text-red-600 font-bold">منقضی شده</span>;
    } else if (nextCalibration.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
      return <span className="text-orange-600 font-bold">نزدیک به انقضا</span>;
    } else {
      return <span className="text-green-600">معتبر</span>;
    }
  };

  const getEquipmentType = (type) => {
    switch(type) {
      case 'company_asset': return 'اموال شرکت';
      case 'inspection_equipment': return 'تجهیزات بازرسی';
      default: return 'نامشخص';
    }
  };

  const equipmentColumns = [
    { header: 'نام تجهیز', accessor: 'name' },
    { header: 'کد تجهیز', accessor: 'equipment_code' },
    { header: 'نوع تجهیز', accessor: 'type', cell: (row) => getEquipmentType(row.type) },
    { header: 'دسته‌بندی', accessor: 'category' },
    { header: 'تاریخ کالیبراسیون بعدی', accessor: 'next_calibration_date', cell: (row) => formatDate(row.next_calibration_date) },
    { header: 'وضعیت', accessor: 'status', cell: (row) => getCalibrationStatus(row) },
    { header: 'آخرین گواهی', accessor: 'calibrationHistory.0.certificate_number', cell: (row) => row.calibrationHistory?.[0]?.certificate_number || '-' },
  ];

  if (loading) return <div className="text-center py-10">در حال بارگیری...</div>;
  if (error) return <div className="text-center py-10 text-red-600">خطا: {error}</div>;
  if (!reportData) return <div className="text-center py-10">داده‌ای یافت نشد</div>;

  return (
    <div className="space-y-6">
      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-500">کل تجهیزات</div>
          <div className="text-2xl font-bold text-gray-900">{reportData.summary.totalEquipment}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500">نیازمند کالیبراسیون</div>
          <div className="text-2xl font-bold text-gray-900">{reportData.summary.equipmentWithCalibration}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="text-sm font-medium text-gray-500">منقضی شده</div>
          <div className="text-2xl font-bold text-red-600">{reportData.summary.expiredCalibrations}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-orange-500">
          <div className="text-sm font-medium text-gray-500">نزدیک به انقضا</div>
          <div className="text-2xl font-bold text-orange-600">{reportData.summary.nearExpiryCalibrations}</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-500">کالیبراسیون‌های اخیر</div>
          <div className="text-2xl font-bold text-green-600">{reportData.summary.recentCalibrations}</div>
        </div>
      </div>

      {/* جدول تجهیزات نیازمند کالیبراسیون */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            تجهیزات نیازمند کالیبراسیون ({reportData.equipmentNeedingCalibration.length})
          </h3>
          <Table 
            columns={equipmentColumns} 
            data={reportData.equipmentNeedingCalibration} 
            emptyMessage="هیچ تجهیز نیازمند کالیبراسیون یافت نشد" 
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={fetchReport}
          variant="primary"
          className="px-6"
        >
          به‌روزرسانی گزارش
        </Button>
      </div>
    </div>
  );
};

export default CalibrationReport; 