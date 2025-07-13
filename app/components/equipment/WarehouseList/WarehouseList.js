"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';

const WarehouseList = () => {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.warehouse.getAll);
      
      if (!response.ok) {
        throw new Error(`Error fetching warehouses: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setWarehouses(data.data || []);
        setError(null);
      } else {
        throw new Error(data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (err) {
      console.error("Error fetching warehouses:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این انبار اطمینان دارید؟')) return;

    try {
      const response = await fetch(API_ENDPOINTS.warehouse.delete(id), {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در حذف انبار');
      }

      // حذف انبار از لیست
      setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
    } catch (err) {
      console.error('Error deleting warehouse:', err);
      alert(err.message || 'خطا در حذف انبار');
    }
  };

  const columns = [
    { 
      header: 'نام انبار', 
      accessor: 'name',
      cell: (row) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-semibold text-sm">
              {row.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="mr-3">
            <div className="text-sm font-medium text-gray-900">{row.name}</div>
          </div>
        </div>
      )
    },
    { 
      header: 'موقعیت', 
      accessor: 'location',
      cell: (row) => (
        <div className="flex items-center">
          <span className="text-gray-500 mr-2">📍</span>
          <span className="text-sm text-gray-900">{row.location || '-'}</span>
        </div>
      )
    },
    { 
      header: 'توضیحات', 
      accessor: 'description',
      cell: (row) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">
          {row.description || '-'}
        </div>
      )
    },
    {
      header: 'عملیات',
      accessor: 'actions',
      cell: (row) => (
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button
            onClick={() => router.push(`/dashboard/equipment/warehouse/edit/${row.id}`)}
            variant="primary"
            size="sm"
            className="text-xs px-3 py-1"
          >
            ویرایش
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
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
    <div className="space-y-6">
      {/* Quick Action */}
      <div className="flex justify-end">
        <Button
          onClick={() => router.push('/dashboard/equipment/warehouse/create')}
          variant="primary"
          className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
        >
          <span className="mr-2">🏢</span>
          ایجاد انبار جدید
        </Button>
      </div>

      {/* Warehouse Table */}
      <div className="overflow-hidden">
      <Table
        columns={columns}
        data={warehouses}
          emptyMessage={
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ انباری یافت نشد</h3>
              <p className="text-gray-600 mb-4">هنوز انباری در سیستم ثبت نشده است</p>
              <Button
                onClick={() => router.push('/dashboard/equipment/warehouse/create')}
                variant="primary"
                size="sm"
              >
                ایجاد اولین انبار
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default WarehouseList; 