"use client";

import { useRouter } from 'next/navigation';
import Button from '@/app/components/ui/Button/Button';
import EquipmentList from '@/app/components/equipment/EquipmentList/EquipmentList';

export default function EquipmentPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            مدیریت تجهیزات
          </h1>
          <p className="text-gray-600 text-lg">
            ثبت، ویرایش و مدیریت تجهیزات شرکت
          </p>
        </div>

        {/* Equipment List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">لیست تجهیزات</h2>
              <Button
                onClick={() => router.push('/dashboard/equipment/equipment/create')}
                variant="primary"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <span className="mr-2">📦</span>
                افزودن تجهیز جدید
              </Button>
            </div>
          </div>
          <div className="p-6">
            <EquipmentList />
          </div>
        </div>
      </div>
    </div>
  );
} 