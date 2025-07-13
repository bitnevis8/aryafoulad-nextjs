"use client";

import { use } from 'react';
import CalibrationForm from '@/app/components/equipment/CalibrationForm/CalibrationForm';

export default function AddCalibrationPage({ params }) {
  const resolvedParams = use(params);
  
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">ثبت کالیبراسیون جدید</h1>
        <CalibrationForm equipmentId={resolvedParams.id} />
      </div>
    </div>
  );
} 