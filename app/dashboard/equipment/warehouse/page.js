"use client";

import WarehouseList from '@/app/components/equipment/WarehouseList/WarehouseList';

export default function WarehousePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            مدیریت انبارها
          </h1>
          <p className="text-gray-600 text-lg">
            مدیریت انبارها و موقعیت‌های تجهیزات
          </p>
        </div>

        {/* Warehouse List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6">
            <WarehouseList />
          </div>
        </div>
      </div>
    </div>
  );
} 