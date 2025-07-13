"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const EquipmentAssignmentList = () => {
  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.equipmentAssignments.getAll);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت واگذاری‌ها');
      }
      setAssignments(data.data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این واگذاری اطمینان دارید؟')) return;
    try {
      const response = await fetch(API_ENDPOINTS.equipmentAssignments.delete(id), { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در حذف واگذاری');
      }
      setAssignments(assignments.filter(assignment => assignment.id !== id));
    } catch (err) {
      alert(err.message || 'خطا در حذف واگذاری');
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

  const getAssignmentStatus = (assignment) => {
    if (assignment.returned_at) {
      return <span className="text-green-600">بازگشت شده</span>;
    }
    return <span className="text-red-600">فعال</span>;
  };

  const getEquipmentType = (type) => {
    switch(type) {
      case 'company_asset': return 'اموال شرکت';
      case 'inspection_equipment': return 'تجهیزات بازرسی';
      default: return 'نامشخص';
    }
  };

  const columns = [
    { header: 'نام تجهیز', accessor: 'equipment.name' },
    { header: 'کد تجهیز', accessor: 'equipment.equipment_code' },
    { header: 'نوع تجهیز', accessor: 'equipment.type', cell: (row) => getEquipmentType(row.equipment?.type) },
    { header: 'نام کاربر', accessor: 'user.firstName' },
    { header: 'نام خانوادگی', accessor: 'user.lastName' },
    { header: 'تاریخ واگذاری', accessor: 'assigned_at', cell: (row) => formatDate(row.assigned_at) },
    { header: 'تاریخ بازگشت', accessor: 'returned_at', cell: (row) => formatDate(row.returned_at) },
    { header: 'وضعیت', accessor: 'status', cell: (row) => getAssignmentStatus(row) },
    { header: 'توضیحات', accessor: 'notes' },
    {
      header: 'عملیات',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex flex-col sm:flex-row gap-2 space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => router.push(`/dashboard/equipment/assignments/edit/${row.id}`)}
            variant="primary"
            size="sm"
            className="w-full sm:w-auto text-sm py-1.5 px-3"
          >
            ویرایش
          </Button>
          {!row.returned_at && (
            <Button
              onClick={() => handleReturn(row.id)}
              variant="success"
              size="sm"
              className="w-full sm:w-auto text-sm py-1.5 px-3"
            >
              بازگشت
            </Button>
          )}
          <Button
            onClick={() => handleDelete(row.id)}
            variant="danger"
            size="sm"
            className="w-full sm:w-auto text-sm py-1.5 px-3"
          >
            حذف
          </Button>
        </div>
      ),
    },
  ];

  const handleReturn = async (id) => {
    if (!confirm('آیا از بازگشت این تجهیز اطمینان دارید؟')) return;
    try {
      const response = await fetch(API_ENDPOINTS.equipmentAssignments.return(id), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returned_at: new Date().toISOString() })
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در بازگشت تجهیز');
      }
      fetchAssignments(); // Refresh the list
    } catch (err) {
      alert(err.message || 'خطا در بازگشت تجهیز');
    }
  };

  if (loading) return <div className="text-center py-10">در حال بارگیری...</div>;
  if (error) return <div className="text-center py-10 text-red-600">خطا: {error}</div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">لیست واگذاری تجهیزات</h1>
        <Button
          onClick={() => router.push('/dashboard/equipment/assignments/create')}
          variant="primary"
          className="w-full sm:w-auto py-2 px-4 text-sm"
        >
          واگذاری تجهیز جدید
        </Button>
      </div>
      <div className="overflow-x-auto shadow-md rounded-lg border border-gray-200">
        <Table columns={columns} data={assignments} emptyMessage="هیچ واگذاری یافت نشد" />
      </div>
    </div>
  );
};

export default EquipmentAssignmentList; 