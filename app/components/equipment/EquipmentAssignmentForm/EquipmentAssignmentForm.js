"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';
import DatePicker from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const EquipmentAssignmentForm = ({ assignmentId = null }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    equipmentId: '',
    userId: '',
    assigned_at: '',
    expected_return_date: '',
    notes: ''
  });
  const [equipments, setEquipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEquipments();
    fetchUsers();
    if (assignmentId) {
      fetchAssignment();
    }
  }, [assignmentId]);

  const fetchEquipments = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.equipment.getAll);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت لیست تجهیزات');
      }
      // فقط تجهیزات موجود (غیر واگذار شده) را نمایش دهید
      const availableEquipments = data.data.filter(equipment => !equipment.current_assignment);
      setEquipments(availableEquipments || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.users.getAll);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت لیست کاربران');
      }
      // Handle both old and new API response formats
      const users = data.data && data.data.users ? data.data.users : data.data;
      setUsers(users || []);
    } catch (err) {
      setError(err.message);
    }
  };

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.equipmentAssignments.getById(assignmentId));
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت اطلاعات واگذاری');
      }
      const assignment = data.data;
      setFormData({
        equipmentId: assignment.equipment_id,
        userId: assignment.user_id,
        assigned_at: assignment.assigned_at ? assignment.assigned_at.split('T')[0] : '',
        expected_return_date: assignment.expected_return_date ? assignment.expected_return_date.split('T')[0] : '',
        notes: assignment.notes || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.equipmentId || !formData.userId) {
      setError('لطفاً تجهیز و کاربر را انتخاب کنید');
      setLoading(false);
      return;
    }

    try {
      const apiData = {
        equipment_id: parseInt(formData.equipmentId),
        user_id: parseInt(formData.userId),
        assigned_at: formData.assigned_at,
        expected_return_date: formData.expected_return_date || null,
        notes: formData.notes
      };

      const url = assignmentId ? API_ENDPOINTS.equipmentAssignments.update(assignmentId) : API_ENDPOINTS.equipmentAssignments.create;
      const method = assignmentId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در ذخیره اطلاعات واگذاری');
      }
      router.push('/dashboard/equipment/assignments');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && assignmentId) return <div className="text-center py-10">در حال بارگیری...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-full sm:max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700 mb-1">تجهیز *</label>
            <select
              id="equipmentId"
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">
                {equipments.length === 0 ? 'هیچ تجهیز موجودی یافت نشد' : 'انتخاب تجهیز'}
              </option>
              {equipments.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name} ({equipment.equipment_code}) - {equipment.type === 'company_asset' ? 'اموال شرکت' : 'تجهیزات بازرسی'}
                </option>
              ))}
            </select>
            {equipments.length === 0 && (
              <p className="mt-1 text-sm text-orange-600">
                ⚠️ تمام تجهیزات در حال حاضر واگذار شده‌اند. ابتدا باید تجهیزات بازگشت داده شوند.
              </p>
            )}
          </div>
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">کاربر *</label>
            <select
              id="userId"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">انتخاب کاربر</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="assigned_at" className="block text-sm font-medium text-gray-700 mb-1">تاریخ واگذاری *</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.assigned_at ? new Date(formData.assigned_at) : ''}
              onChange={date => setFormData(prev => ({ ...prev, assigned_at: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              format="YYYY/MM/DD"
              placeholder="تاریخ واگذاری را انتخاب کنید"
              required
            />
          </div>
          <div>
            <label htmlFor="expected_return_date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ بازگشت مورد انتظار</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.expected_return_date ? new Date(formData.expected_return_date) : ''}
              onChange={date => setFormData(prev => ({ ...prev, expected_return_date: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              format="YYYY/MM/DD"
              placeholder="تاریخ بازگشت مورد انتظار را انتخاب کنید"
            />
          </div>
        </div>
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            placeholder="توضیحات واگذاری را وارد کنید"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button type="submit" variant="primary" disabled={loading} className="w-full sm:w-auto">
            {loading ? 'در حال ذخیره...' : 'ذخیره'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
            انصراف
          </Button>
        </div>
      </div>
    </form>
  );
};

export default EquipmentAssignmentForm; 