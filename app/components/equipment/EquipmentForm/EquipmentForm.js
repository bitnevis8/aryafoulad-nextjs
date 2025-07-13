"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';
import DatePicker from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const EquipmentForm = ({ equipmentId = null }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    equipment_code: '',
    type: '',
    category: '',
    model: '',
    serial_number: '',
    manufacturer: '',
    purchase_date: '',
    purchase_price: '',
    location: '',
    description: '',
    needs_calibration: false,
    calibration_certificate: '',
    calibration_period_years: '',
    calibration_place: '',
    last_calibration_date: '',
    next_calibration_date: '',
    has_identity_document: false,
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.equipment.getById(equipmentId));
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت اطلاعات تجهیز');
      }
      const equipment = data.data;
      setFormData({
        name: equipment.name || '',
        equipment_code: equipment.equipment_code || '',
        type: equipment.type || '',
        category: equipment.category || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        manufacturer: equipment.manufacturer || '',
        purchase_date: equipment.purchase_date ? equipment.purchase_date.split('T')[0] : '',
        purchase_price: equipment.purchase_price || '',
        location: equipment.location || '',
        description: equipment.description || '',
        needs_calibration: equipment.needs_calibration || false,
        calibration_certificate: equipment.calibration_certificate || '',
        calibration_period_years: equipment.calibration_period_years || '',
        calibration_place: equipment.calibration_place || '',
        last_calibration_date: equipment.last_calibration_date ? equipment.last_calibration_date.split('T')[0] : '',
        next_calibration_date: equipment.next_calibration_date ? equipment.next_calibration_date.split('T')[0] : '',
        has_identity_document: equipment.has_identity_document || false,
        notes: equipment.notes || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => {
    if (equipmentId) {
      fetchEquipment();
    }
  }, [equipmentId, fetchEquipment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiData = {
        ...formData,
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        calibration_period_years: formData.calibration_period_years ? parseInt(formData.calibration_period_years) : null,
        last_calibration_date: (!formData.last_calibration_date || formData.last_calibration_date === 'Invalid date') ? null : formData.last_calibration_date,
        next_calibration_date: (!formData.next_calibration_date || formData.next_calibration_date === 'Invalid date') ? null : formData.next_calibration_date,
        purchase_date: (!formData.purchase_date || formData.purchase_date === 'Invalid date') ? null : formData.purchase_date,
      };

      const url = equipmentId ? API_ENDPOINTS.equipment.update(equipmentId) : API_ENDPOINTS.equipment.create;
      const method = equipmentId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در ذخیره اطلاعات تجهیز');
      }
      router.push('/dashboard/equipment/equipment');
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  if (loading && equipmentId) return <div className="text-center py-10">در حال بارگیری...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-full sm:max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}
      
      <div className="space-y-6">


        {/* اطلاعات اصلی تجهیز */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات اصلی تجهیز</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">نام تجهیز *</label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="نام تجهیز را وارد کنید" className="w-full" />
            </div>
            <div>
              <label htmlFor="equipment_code" className="block text-sm font-medium text-gray-700 mb-1">کد تجهیز *</label>
              <Input id="equipment_code" name="equipment_code" value={formData.equipment_code} onChange={handleChange} required placeholder="کد تجهیز را وارد کنید" className="w-full" />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">نوع تجهیز *</label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                <option value="">انتخاب کنید</option>
                <option value="company_asset">اموال شرکت</option>
                <option value="inspection_equipment">تجهیزات بازرسی</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
              <Input id="category" name="category" value={formData.category} onChange={handleChange} placeholder="دسته‌بندی را وارد کنید" className="w-full" />
            </div>
            <div>
              <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">مدل</label>
              <Input id="model" name="model" value={formData.model} onChange={handleChange} placeholder="مدل را وارد کنید" className="w-full" />
            </div>
            <div>
              <label htmlFor="serial_number" className="block text-sm font-medium text-gray-700 mb-1">شماره سریال</label>
              <Input id="serial_number" name="serial_number" value={formData.serial_number} onChange={handleChange} placeholder="شماره سریال را وارد کنید" className="w-full" />
            </div>
            <div>
              <label htmlFor="manufacturer" className="block text-sm font-medium text-gray-700 mb-1">سازنده</label>
              <Input id="manufacturer" name="manufacturer" value={formData.manufacturer} onChange={handleChange} placeholder="نام سازنده را وارد کنید" className="w-full" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">موقعیت</label>
              <Input id="location" name="location" value={formData.location} onChange={handleChange} placeholder="موقعیت را وارد کنید" className="w-full" />
            </div>
          </div>
        </div>

        {/* اطلاعات خرید */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">اطلاعات خرید</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ خرید</label>
              <DatePicker
                calendar={persian}
                locale={persian_fa}
                value={formData.purchase_date ? new Date(formData.purchase_date) : ''}
                onChange={date => setFormData(prev => ({ ...prev, purchase_date: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
                inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                format="YYYY/MM/DD"
                placeholder="تاریخ خرید را انتخاب کنید"
              />
            </div>
            <div>
              <label htmlFor="purchase_price" className="block text-sm font-medium text-gray-700 mb-1">قیمت خرید (ریال)</label>
              <Input id="purchase_price" name="purchase_price" type="number" value={formData.purchase_price} onChange={handleChange} placeholder="قیمت خرید را وارد کنید" className="w-full" />
            </div>
          </div>
        </div>

        {/* تنظیمات کالیبراسیون */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">تنظیمات کالیبراسیون</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="needs_calibration"
                name="needs_calibration"
                checked={formData.needs_calibration}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="needs_calibration" className="mr-2 block text-sm text-gray-700">نیاز به کالیبراسیون دارد</label>
            </div>
            
            {formData.needs_calibration && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="calibration_certificate" className="block text-sm font-medium text-gray-700 mb-1">شماره گواهی کالیبراسیون</label>
                  <Input id="calibration_certificate" name="calibration_certificate" value={formData.calibration_certificate} onChange={handleChange} placeholder="شماره گواهی را وارد کنید" className="w-full" />
                </div>
                <div>
                  <label htmlFor="calibration_period_years" className="block text-sm font-medium text-gray-700 mb-1">دوره کالیبراسیون (سال)</label>
                  <Input id="calibration_period_years" name="calibration_period_years" type="number" value={formData.calibration_period_years} onChange={handleChange} placeholder="دوره کالیبراسیون را وارد کنید" className="w-full" />
                </div>
                <div>
                  <label htmlFor="calibration_place" className="block text-sm font-medium text-gray-700 mb-1">محل کالیبراسیون</label>
                  <Input id="calibration_place" name="calibration_place" value={formData.calibration_place} onChange={handleChange} placeholder="محل کالیبراسیون را وارد کنید" className="w-full" />
                </div>
                <div>
                  <label htmlFor="last_calibration_date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ آخرین کالیبراسیون</label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={formData.last_calibration_date ? new Date(formData.last_calibration_date) : ''}
                    onChange={date => setFormData(prev => ({ ...prev, last_calibration_date: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    format="YYYY/MM/DD"
                    placeholder="تاریخ آخرین کالیبراسیون را انتخاب کنید"
                  />
                </div>
                <div>
                  <label htmlFor="next_calibration_date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ کالیبراسیون بعدی</label>
                  <DatePicker
                    calendar={persian}
                    locale={persian_fa}
                    value={formData.next_calibration_date ? new Date(formData.next_calibration_date) : ''}
                    onChange={date => setFormData(prev => ({ ...prev, next_calibration_date: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
                    inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    format="YYYY/MM/DD"
                    placeholder="تاریخ کالیبراسیون بعدی را انتخاب کنید"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* سایر اطلاعات */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">سایر اطلاعات</h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="has_identity_document"
                name="has_identity_document"
                checked={formData.has_identity_document}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="has_identity_document" className="mr-2 block text-sm text-gray-700">دارای مدارک شناسایی</label>
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
              <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="توضیحات تجهیز را وارد کنید" />
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">یادداشت‌ها</label>
              <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="یادداشت‌های اضافی را وارد کنید" />
            </div>
          </div>
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

export default EquipmentForm; 