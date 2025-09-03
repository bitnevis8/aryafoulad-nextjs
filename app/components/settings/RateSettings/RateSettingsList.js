"use client";

import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Table from '@/app/components/ui/Table/Table';
import { useRouter } from 'next/navigation';

export default function RateSettingsList() {
  const router = useRouter();
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.rateSettings.getAll);
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات نرخ‌ها');
        const data = await response.json();
        setRates(data.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  const handleEdit = (id) => {
    router.push(`/dashboard/settings/rate-settings/edit/${id}`);
  };

  const handleCreateClick = () => {
    router.push('/dashboard/settings/rate-settings/create');
  };

  const handleDelete = async (id) => {
    if (!confirm('آیا از حذف این نرخ اطمینان دارید؟')) return;
    
    try {
      const response = await fetch(`${API_ENDPOINTS.rateSettings.delete(id)}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در حذف نرخ');
      }
      
      // به‌روزرسانی لیست
      setRates(prev => prev.filter(rate => rate.id !== id));
      alert('نرخ با موفقیت حذف شد');
    } catch (err) {
      alert(err.message);
    }
  };

  const formatPersianDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fa-IR');
    } catch (error) {
      return dateString;
    }
  };

  const getDateRange = (startDate, endDate) => {
    const start = formatPersianDate(startDate);
    const end = endDate ? formatPersianDate(endDate) : 'تا زمان حال';
    return `${start} تا ${end}`;
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? 'فعال' : 'غیرفعال'}
      </span>
    );
  };

  const columns = [
    { 
      header: 'عنوان نرخ', 
      accessor: 'title',
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.title}</div>
          {row.description && (
            <div className="text-sm text-gray-500 mt-1">{row.description}</div>
          )}
        </div>
      )
    },
    { 
      header: 'نرخ (تومان)', 
      accessor: 'ratePerKm', 
      cell: (row) => (
        <div className="font-bold text-lg text-blue-600">
          {Number(row.ratePerKm).toLocaleString('fa-IR')}
        </div>
      )
    },
    { 
      header: 'بازه زمانی', 
      accessor: 'dateRange',
      cell: (row) => getDateRange(row.startDate, row.endDate)
    },
    { 
      header: 'وضعیت', 
      accessor: 'isActive',
      cell: (row) => getStatusBadge(row.isActive)
    },
    { 
      header: 'عملیات', 
      accessor: 'actions', 
      cell: (row) => (
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            size="small" 
            onClick={() => handleEdit(row.id)}
          >
            ویرایش
          </Button>
          <Button 
            variant="danger" 
            size="small"
            disabled={row.isActive}
            title={row.isActive ? 'نرخ فعال قابل حذف نیست' : 'حذف نرخ'}
            onClick={() => handleDelete(row.id)}
          >
            حذف
          </Button>
        </div>
      ) 
    },
  ];

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">مدیریت نرخ‌ها</h2>
          <p className="text-gray-600 mt-1">تعریف و مدیریت نرخ‌های مختلف بر اساس بازه زمانی</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              💡 <strong>نکته:</strong> سیستم نرخ‌ها بر اساس تاریخ ماموریت کار می‌کند. 
              نرخ مناسب برای هر تاریخ ماموریت به صورت خودکار انتخاب می‌شود. 
              اگر برای تاریخ ماموریت نرخ معتبری یافت نشود، نرخ پیش‌فرض اعمال می‌شود.
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={handleCreateClick}>
          افزودن نرخ جدید
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        {rates.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">هیچ نرخی تعریف نشده است</div>
            <Button variant="primary" onClick={handleCreateClick}>
              ایجاد اولین نرخ
            </Button>
          </div>
        ) : (
          <Table columns={columns} data={rates} />
        )}
      </div>
    </div>
  );
} 