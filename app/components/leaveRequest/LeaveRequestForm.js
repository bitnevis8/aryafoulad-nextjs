"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DatePicker from 'react-multi-date-picker';
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function LeaveRequestForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [leaveTypes, setLeaveTypes] = useState([
    { type: 'annual', typeFa: 'استحقاقی' },
    { type: 'sick', typeFa: 'استعلاجی' },
    { type: 'unpaid', typeFa: 'بدون حقوق' }
  ]);
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    type: "",
    description: "",
    isHourly: false,
  });

  // انواع مرخصی به صورت ثابت تعریف شده‌اند
  // در صورت نیاز به دریافت از سرور، کد زیر را فعال کنید:
  /*
  useEffect(() => {
    const fetchLeaveTypes = async () => {
      try {
        const response = await fetch("/api/leave-request/types", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.success) {
          setLeaveTypes(data.data);
        }
      } catch (error) {
        console.error("Error fetching leave types:", error);
      }
    };
    fetchLeaveTypes();
  }, []);
  */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/leave-request/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("درخواست مرخصی با موفقیت ثبت شد");
        router.push("/dashboard/leave-request");
      } else {
        alert(data.message || "خطا در ثبت درخواست");
      }
    } catch (error) {
      console.error("Error creating leave request:", error);
      alert("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">درخواست مرخصی جدید</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isHourly"
              name="isHourly"
              checked={formData.isHourly}
              onChange={(e) => setFormData(prev => ({ ...prev, isHourly: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isHourly" className="mr-2 block text-sm text-gray-700">
              مرخصی ساعتی
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ شروع
            </label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.startDate ? new Date(formData.startDate) : ''}
              onChange={date => setFormData(prev => ({ 
                ...prev, 
                startDate: date ? date.toDate().toISOString().slice(0, 10) : '' 
              }))}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              format="YYYY/MM/DD"
              placeholder="تاریخ شروع را انتخاب کنید"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              تاریخ پایان
            </label>
            <DatePicker
              calendar={persian}
              locale={persian_fa}
              value={formData.endDate ? new Date(formData.endDate) : ''}
              onChange={date => setFormData(prev => ({ 
                ...prev, 
                endDate: date ? date.toDate().toISOString().slice(0, 10) : '' 
              }))}
              inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              format="YYYY/MM/DD"
              placeholder="تاریخ پایان را انتخاب کنید"
              required
              minDate={formData.startDate ? new Date(formData.startDate) : undefined}
            />
          </div>
        </div>

        {formData.isHourly && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ساعت شروع
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required={formData.isHourly}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ساعت پایان
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required={formData.isHourly}
                min={formData.startTime}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع مرخصی
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">انتخاب کنید</option>
            {leaveTypes.map((type) => (
              <option key={type.type} value={type.type}>
                {type.typeFa}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            توضیحات
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="توضیحات خود را وارد کنید..."
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "در حال ثبت..." : "ثبت درخواست"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
          >
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
} 