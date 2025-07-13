"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import Input from '@/app/components/ui/Input/Input';
import DatePicker from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const CalibrationForm = ({ equipmentId, calibrationId = null }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    calibration_date: '',
    certificate_number: '',
    calibration_place: '',
    expiry_date: '',
    notes: ''
  });
  const [equipment, setEquipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEquipment = useCallback(async () => {
    try {
      const response = await fetch(API_ENDPOINTS.equipment.getById(equipmentId));
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت اطلاعات تجهیز');
      }
      setEquipment(data.data);
    } catch (err) {
      setError(err.message);
    }
  }, [equipmentId]);

  const fetchCalibration = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.calibrationHistory.getById(calibrationId));
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در دریافت اطلاعات کالیبراسیون');
      }
      const calibration = data.data;
      setFormData({
        calibration_date: calibration.calibration_date ? calibration.calibration_date.split('T')[0] : '',
        certificate_number: calibration.certificate_number || '',
        calibration_place: calibration.calibration_place || '',
        expiry_date: calibration.expiry_date ? calibration.expiry_date.split('T')[0] : '',
        notes: calibration.notes || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [calibrationId]);

  useEffect(() => {
    if (equipmentId) {
      fetchEquipment();
    }
    if (calibrationId) {
      fetchCalibration();
    }
  }, [equipmentId, calibrationId, fetchEquipment, fetchCalibration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const apiData = {
        equipment_id: parseInt(equipmentId),
        ...formData
      };

      const url = calibrationId ? API_ENDPOINTS.calibrationHistory.update(calibrationId) : API_ENDPOINTS.calibrationHistory.create;
      const method = calibrationId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'خطا در ذخیره اطلاعات کالیبراسیون');
      }
      router.push(`/dashboard/equipment/equipment/history/${equipmentId}`);
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

  if (loading && calibrationId) return <div className="text-center py-10">در حال بارگیری...</div>;

  return (
    <form onSubmit={handleSubmit} className="max-w-full sm:max-w-2xl mx-auto p-4 sm:p-6 bg-white rounded-lg shadow-md">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
      )}
      
      {equipment && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">اطلاعات تجهیز</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium text-gray-600">نام تجهیز:</span>
              <span className="text-gray-800 mr-2">{equipment.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-600">کد تجهیز:</span>
              <span className="text-gray-800 mr-2">{equipment.equipment_code}</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="calibration_date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ کالیبراسیون *</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.calibration_date ? new Date(formData.calibration_date) : ''}
              onChange={date => setFormData(prev => ({ ...prev, calibration_date: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              format="YYYY/MM/DD"
              placeholder="تاریخ کالیبراسیون را انتخاب کنید"
              required
            />
          </div>
          <div>
            <label htmlFor="certificate_number" className="block text-sm font-medium text-gray-700 mb-1">شماره گواهی *</label>
            <Input
              id="certificate_number"
              name="certificate_number"
              value={formData.certificate_number}
              onChange={handleChange}
              required
              placeholder="شماره گواهی کالیبراسیون را وارد کنید"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="calibration_place" className="block text-sm font-medium text-gray-700 mb-1">محل کالیبراسیون *</label>
            <Input
              id="calibration_place"
              name="calibration_place"
              value={formData.calibration_place}
              onChange={handleChange}
              required
              placeholder="محل کالیبراسیون را وارد کنید"
              className="w-full"
            />
          </div>
          <div>
            <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700 mb-1">تاریخ انقضا *</label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.expiry_date ? new Date(formData.expiry_date) : ''}
              onChange={date => setFormData(prev => ({ ...prev, expiry_date: date ? date.toDate().toISOString().slice(0, 10) : '' }))}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              format="YYYY/MM/DD"
              placeholder="تاریخ انقضا را انتخاب کنید"
              required
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
            placeholder="توضیحات کالیبراسیون را وارد کنید"
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

export default CalibrationForm; 