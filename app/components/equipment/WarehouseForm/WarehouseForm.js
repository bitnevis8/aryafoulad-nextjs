"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';

const WarehouseForm = ({ warehouseId = null }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWarehouse = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.warehouse.getById(warehouseId));
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در دریافت اطلاعات انبار');
      }
      
      const data = await response.json();
      if (data.success) {
        setFormData(data.data);
      } else {
        throw new Error(data.message || 'خطا در دریافت اطلاعات');
      }
    } catch (err) {
      console.error('Error fetching warehouse:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [warehouseId]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId, fetchWarehouse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = warehouseId 
        ? API_ENDPOINTS.warehouse.update(warehouseId)
        : API_ENDPOINTS.warehouse.create;
      
      const method = warehouseId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در ذخیره اطلاعات انبار');
      }

      router.push('/dashboard/equipment');
      router.refresh();
    } catch (err) {
      console.error('Error saving warehouse:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && warehouseId) {
    return <div className="text-center py-10">در حال بارگیری...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-full sm:max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            نام انبار
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="نام انبار را وارد کنید"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            موقعیت
          </label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="موقعیت انبار را وارد کنید"
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            توضیحات
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="توضیحات انبار را وارد کنید"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="w-full sm:w-auto"
          >
            انصراف
          </Button>
        </div>
      </div>
    </form>
  );
};

export default WarehouseForm; 