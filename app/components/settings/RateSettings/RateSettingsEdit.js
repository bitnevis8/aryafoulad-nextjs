import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

export default function RateSettingsEdit({ id }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [ratePerKm, setRatePerKm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.rateSettings.getById(id));
        if (!response.ok) throw new Error('خطا در دریافت اطلاعات نرخ');
        const responseData = await response.json();
        if (responseData && responseData.data) {
          const rate = responseData.data;
          setTitle(rate.title || '');
          setRatePerKm(rate.ratePerKm || '');
          setStartDate(rate.startDate ? new Date(rate.startDate) : '');
          setEndDate(rate.endDate ? new Date(rate.endDate) : '');
          setDescription(rate.description || '');
          setIsActive(rate.isActive !== false);
        } else {
          throw new Error('ساختار پاسخ دریافتی نامعتبر است');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || !ratePerKm || !startDate) {
      setError('لطفاً عنوان، نرخ و تاریخ شروع را وارد کنید');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // تبدیل تاریخ به آبجکت مناسب اگر رشته باشد
      const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
      const end = endDate && typeof endDate === 'string' ? new Date(endDate) : endDate;
      const response = await fetch(API_ENDPOINTS.rateSettings.update(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          ratePerKm: parseFloat(ratePerKm), 
          startDate: start && start.toDate ? start.toDate().toISOString().slice(0, 10) : start.toISOString().slice(0, 10),
          endDate: end ? (end.toDate ? end.toDate().toISOString().slice(0, 10) : end.toISOString().slice(0, 10)) : null,
          description,
          isActive
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'خطا در به‌روزرسانی نرخ');
      }
      
      alert('نرخ با موفقیت به‌روزرسانی شد!');
      router.push('/dashboard/settings/rate-settings');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ویرایش نرخ</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-medium mb-2">عنوان نرخ *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="مثال: نرخ فروردین 1400 تا مرداد 1400"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">نرخ به ازای هر کیلومتر (تومان) *</label>
          <input
            type="number"
            value={ratePerKm}
            onChange={(e) => setRatePerKm(e.target.value)}
            placeholder="مثال: 2000"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">تاریخ شروع اعتبار *</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={startDate}
            onChange={setStartDate}
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            format="YYYY/MM/DD"
            placeholder="تاریخ شروع را انتخاب کنید"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">تاریخ پایان اعتبار (اختیاری)</label>
          <DatePicker
            calendar={persian}
            locale={persian_fa}
            value={endDate}
            onChange={setEndDate}
            inputClass="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            format="YYYY/MM/DD"
            placeholder="تاریخ پایان را انتخاب کنید (خالی = تا زمان حال)"
          />
          <p className="text-sm text-gray-500 mt-1">اگر خالی بگذارید، نرخ تا زمان حال معتبر خواهد بود</p>
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-2">توضیحات</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="توضیحات اضافی درباره این نرخ"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-gray-700 font-medium">نرخ فعال</span>
          </label>
          <p className="text-sm text-gray-500 mt-1">اگر فعال باشد، این نرخ برای محاسبات استفاده می‌شود</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button 
            variant="primary" 
            onClick={handleUpdate} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی نرخ'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push('/dashboard/settings/rate-settings')}
            className="flex-1"
          >
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
} 