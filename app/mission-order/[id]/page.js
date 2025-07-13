"use client";

import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '@/app/config/api';

export default function MissionOrderViewPage({ params }) {
  const [missionOrder, setMissionOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMissionOrder = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.missionOrders.getById(params.id));
        if (!response.ok) {
          throw new Error('خطا در دریافت اطلاعات ماموریت');
        }
        const data = await response.json();
        setMissionOrder(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMissionOrder();
  }, [params.id]);

  if (loading) {
    return <div className="text-center py-10">در حال بارگیری اطلاعات...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-red-600">خطا: {error}</div>;
  }

  if (!missionOrder) {
    return <div className="text-center py-10">ماموریت یافت نشد</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">اطلاعات ماموریت</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">اطلاعات شخصی</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><span className="font-medium">نام:</span> {missionOrder.firstName}</p>
                <p><span className="font-medium">نام خانوادگی:</span> {missionOrder.lastName}</p>
                <p><span className="font-medium">کد پرسنلی:</span> {missionOrder.personnelNumber}</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">اطلاعات ماموریت</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><span className="font-medium">واحد مبدا:</span> {missionOrder.fromUnit}</p>
                <p><span className="font-medium">تاریخ:</span> {missionOrder.day}</p>
                <p><span className="font-medium">ساعت:</span> {missionOrder.time}</p>
                <p><span className="font-medium">موضوع:</span> {missionOrder.missionSubject}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">جزئیات مسیر</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><span className="font-medium">مسافت رفت:</span> {missionOrder.distance} کیلومتر</p>
                <p><span className="font-medium">مسافت برگشت:</span> {missionOrder.roundTripDistance} کیلومتر</p>
                <p><span className="font-medium">مدت زمان رفت:</span> {missionOrder.estimatedTime} ساعت</p>
                <p><span className="font-medium">مدت زمان برگشت:</span> {missionOrder.estimatedReturnTime} ساعت</p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-700 mb-2">اطلاعات تکمیلی</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p><span className="font-medium">همراهان:</span> {missionOrder.companions}</p>
                <p><span className="font-medium">نوع وسیله نقلیه:</span> {missionOrder.transport}</p>
                <p><span className="font-medium">وزن کل:</span> {missionOrder.totalWeightKg} کیلوگرم</p>
                <p><span className="font-medium">هزینه نهایی:</span> {missionOrder.finalCost?.toLocaleString('fa-IR')} تومان</p>
              </div>
            </div>
          </div>
        </div>

        {missionOrder.missionDescription && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">توضیحات</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>{missionOrder.missionDescription}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 