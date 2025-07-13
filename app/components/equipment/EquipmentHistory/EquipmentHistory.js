"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const EquipmentHistory = ({ equipmentId }) => {
  const router = useRouter();
  const [equipment, setEquipment] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('assignments');

  const fetchEquipmentData = useCallback(async () => {
    try {
      setLoading(true);
      
      // دریافت اطلاعات تجهیز
      const equipmentResponse = await fetch(API_ENDPOINTS.equipment.getById(equipmentId));
      const equipmentData = await equipmentResponse.json();
      if (!equipmentResponse.ok || !equipmentData.success) {
        throw new Error(equipmentData.message || 'خطا در دریافت اطلاعات تجهیز');
      }
      setEquipment(equipmentData.data);

      // دریافت تاریخچه واگذاری‌ها
      const assignmentsResponse = await fetch(API_ENDPOINTS.equipmentAssignments.getByEquipment(equipmentId));
      const assignmentsData = await assignmentsResponse.json();
      if (assignmentsResponse.ok && assignmentsData.success) {
        setAssignments(assignmentsData.data || []);
      }

      // دریافت تاریخچه کالیبراسیون‌ها
      const calibrationsResponse = await fetch(API_ENDPOINTS.calibrationHistory.getByEquipment(equipmentId));
      const calibrationsData = await calibrationsResponse.json();
      if (calibrationsResponse.ok && calibrationsData.success) {
        setCalibrations(calibrationsData.data || []);
      }

      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    if (equipmentId) {
      fetchEquipmentData();
    }
  }, [equipmentId, fetchEquipmentData]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getEquipmentType = (type) => {
    switch(type) {
      case 'company_asset': return 'اموال شرکت';
      case 'inspection_equipment': return 'تجهیزات بازرسی';
      default: return 'نامشخص';
    }
  };

  const getCalibrationStatus = (equipment) => {
    if (!equipment.needs_calibration) return 'نیاز ندارد';
    if (equipment.calibration_certificate) {
      return `هر ${equipment.calibration_period_years} سال`;
    }
    return 'نیاز به کالیبراسیون';
  };

  const assignmentColumns = [
    { header: 'نام کاربر', accessor: 'user.firstName' },
    { header: 'نام خانوادگی', accessor: 'user.lastName' },
    { header: 'تاریخ واگذاری', accessor: 'assigned_at', cell: (row) => formatDate(row.assigned_at) },
    { header: 'تاریخ بازگشت', accessor: 'returned_at', cell: (row) => formatDate(row.returned_at) },
    { header: 'وضعیت', accessor: 'status', cell: (row) => {
      if (row.returned_at) {
        return <span className="text-green-600">بازگشت شده</span>;
      }
      return <span className="text-red-600">فعال</span>;
    }},
    { header: 'توضیحات', accessor: 'notes' },
  ];

  const calibrationColumns = [
    { header: 'تاریخ کالیبراسیون', accessor: 'calibration_date', cell: (row) => formatDate(row.calibration_date) },
    { header: 'شماره گواهی', accessor: 'certificate_number' },
    { header: 'محل کالیبراسیون', accessor: 'calibration_place' },
    { header: 'تاریخ انقضا', accessor: 'expiry_date', cell: (row) => formatDate(row.expiry_date) },
    { header: 'وضعیت', accessor: 'status', cell: (row) => {
      const expiryDate = new Date(row.expiry_date);
      const today = new Date();
      if (expiryDate < today) {
        return <span className="text-red-600">منقضی شده</span>;
      }
      return <span className="text-green-600">معتبر</span>;
    }},
    { header: 'توضیحات', accessor: 'notes' },
  ];

  if (loading) return <div className="text-center py-10">در حال بارگیری...</div>;
  if (error) return <div className="text-center py-10 text-red-600">خطا: {error}</div>;
  if (!equipment) return <div className="text-center py-10">تجهیز یافت نشد</div>;

  return (
    <div className="space-y-6">
      {/* اطلاعات تجهیز */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-gray-800 mb-4">اطلاعات تجهیز</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-500">نام تجهیز</label>
            <p className="text-sm text-gray-900">{equipment.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">کد تجهیز</label>
            <p className="text-sm text-gray-900">{equipment.equipment_code}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">نوع تجهیز</label>
            <p className="text-sm text-gray-900">{getEquipmentType(equipment.type)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">دسته‌بندی</label>
            <p className="text-sm text-gray-900">{equipment.category || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">مدل</label>
            <p className="text-sm text-gray-900">{equipment.model || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">شماره سریال</label>
            <p className="text-sm text-gray-900">{equipment.serial_number || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">وضعیت کالیبراسیون</label>
            <p className="text-sm text-gray-900">{getCalibrationStatus(equipment)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">وضعیت واگذاری</label>
            <p className="text-sm text-gray-900">
              {equipment.current_assignment ? 
                <span className="text-red-600">واگذار شده</span> : 
                <span className="text-green-600">موجود</span>
              }
            </p>
          </div>
        </div>
      </div>

      {/* تب‌های تاریخچه */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 rtl:space-x-reverse">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assignments'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              تاریخچه واگذاری ({assignments.length})
            </button>
            <button
              onClick={() => setActiveTab('calibrations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calibrations'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              تاریخچه کالیبراسیون ({calibrations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'assignments' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">تاریخچه واگذاری</h3>
                <Button
                  onClick={() => router.push('/dashboard/equipment/assignments/create')}
                  variant="primary"
                  size="sm"
                >
                  واگذاری جدید
                </Button>
              </div>
              <Table 
                columns={assignmentColumns} 
                data={assignments} 
                emptyMessage="هیچ واگذاری یافت نشد" 
              />
            </div>
          )}

          {activeTab === 'calibrations' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">تاریخچه کالیبراسیون</h3>
                <Button
                  onClick={() => router.push(`/dashboard/equipment/equipment/calibration/${equipmentId}`)}
                  variant="primary"
                  size="sm"
                >
                  ثبت کالیبراسیون جدید
                </Button>
              </div>
              <Table 
                columns={calibrationColumns} 
                data={calibrations} 
                emptyMessage="هیچ کالیبراسیون یافت نشد" 
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => router.back()}
          variant="secondary"
        >
          بازگشت
        </Button>
        <Button
          onClick={() => router.push(`/dashboard/equipment/equipment/edit/${equipmentId}`)}
          variant="primary"
        >
          ویرایش تجهیز
        </Button>
      </div>
    </div>
  );
};

export default EquipmentHistory; 