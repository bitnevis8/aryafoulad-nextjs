import { useState } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';
import Button from '@/app/components/ui/Button/Button';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

export default function RateSettingsCreate() {
  const [title, setTitle] = useState('');
  const [ratePerKm, setRatePerKm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async () => {
    if (!title || !ratePerKm || !startDate) {
      setError('لطفاً عنوان، نرخ و تاریخ شروع را وارد کنید');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.rateSettings.create, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          title, 
          ratePerKm: parseFloat(ratePerKm), 
          startDate: startDate.toDate().toISOString().slice(0, 10),
          endDate: endDate ? endDate.toDate().toISOString().slice(0, 10) : null,
          description 
        }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'خطا در ایجاد نرخ جدید');
      }
      
      alert('نرخ جدید با موفقیت ایجاد شد!');
      setTitle('');
      setRatePerKm('');
      setStartDate('');
      setEndDate('');
      setDescription('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">ایجاد نرخ جدید</h2>
      
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

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <Button 
            variant="primary" 
            onClick={handleCreate} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'در حال ایجاد...' : 'ایجاد نرخ جدید'}
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => window.history.back()}
            className="flex-1"
          >
            انصراف
          </Button>
        </div>
      </div>
    </div>
  );
} 