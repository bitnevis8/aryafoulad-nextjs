"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const EquipmentList = () => {
  const router = useRouter();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.equipment.getAll);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت تجهیزات');
      }
      setEquipments(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این تجهیز اطمینان دارید؟')) return;
    try {
      const response = await fetch(API_ENDPOINTS.equipment.delete(id), { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در حذف تجهیز');
      }
      setEquipments(equipments.filter(equipment => equipment.id !== id));
    } catch (err) {
      alert(err.message || 'خطا در حذف تجهیز');
    }
  };

  const getEquipmentType = (type) => {
    switch(type) {
      case 'company_asset': return 'اموال شرکت';
      case 'inspection_equipment': return 'تجهیزات بازرسی';
      default: return 'نامشخص';
    }
  };

  const getCalibrationStatus = (equipment) => {
    if (!equipment.needs_calibration) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">نیاز ندارد</span>;
    }
    if (equipment.calibration_certificate) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">هر {equipment.calibration_period_years} سال</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">نیاز به کالیبراسیون</span>;
  };

  const getAssignmentStatus = (equipment) => {
    if (equipment.current_assignment) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">واگذار شده</span>;
    }
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">موجود</span>;
  };

  const getEquipmentStatus = (equipment) => {
    switch(equipment.status) {
      case 'active':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">فعال</span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">غیرفعال</span>;
      case 'maintenance':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">تعمیر</span>;
      case 'retired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">بازنشسته</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">نامشخص</span>;
    }
  };

  const columns = [
    { 
      header: 'نام تجهیز', 
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold text-sm">
              {row.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="mr-3">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
            <div className="text-sm text-gray-500">{row.equipment_code}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'نوع و دسته‌بندی', 
      accessor: 'type_category',
      cell: (row) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{getEquipmentType(row.type)}</div>
          <div className="text-sm text-gray-500">{row.category || '-'}</div>
        </div>
      )
    },
    { 
      header: 'وضعیت', 
      accessor: 'status',
      cell: (row) => (
        <div className="space-y-1">
          {getEquipmentStatus(row)}
          {getAssignmentStatus(row)}
        </div>
      )
    },
    { 
      header: 'کالیبراسیون', 
      accessor: 'calibration_status',
      cell: (row) => getCalibrationStatus(row)
    },
    {
      header: 'عملیات',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => router.push(`/dashboard/equipment/equipment/edit/${row.id}`)}
            variant="primary"
            size="sm"
            className="text-xs px-3 py-1"
          >
            ویرایش
          </Button>
          <Button
            onClick={() => router.push(`/dashboard/equipment/equipment/history/${row.id}`)}
            variant="secondary"
            size="sm"
            className="text-xs px-3 py-1"
          >
            تاریخچه
          </Button>
          <Button
            onClick={() => handleDelete(row.id)}
            variant="danger"
            size="sm"
            className="text-xs px-3 py-1"
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="mr-3 text-gray-600">در حال بارگیری...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">خطا در بارگیری</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table 
        columns={columns} 
        data={equipments} 
        emptyMessage={
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ تجهیزی یافت نشد</h3>
            <p className="text-gray-600 mb-4">هنوز تجهیزی در سیستم ثبت نشده است</p>
        <Button
              onClick={() => router.push('/dashboard/equipment/equipment/create')}
          variant="primary"
              size="sm"
        >
              افزودن اولین تجهیز
        </Button>
      </div>
        } 
      />
    </div>
  );
};

export default EquipmentList; 