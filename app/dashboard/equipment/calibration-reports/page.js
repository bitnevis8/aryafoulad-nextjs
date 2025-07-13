"use client";

import CalibrationReport from '@/app/components/equipment/CalibrationReport/CalibrationReport';

export default function CalibrationReportsPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">گزارش‌های کالیبراسیون</h1>
          <p className="text-gray-600 mt-2">مدیریت و نظارت بر وضعیت کالیبراسیون تجهیزات</p>
        </div>
        <CalibrationReport />
      </div>
    </div>
  );
} 