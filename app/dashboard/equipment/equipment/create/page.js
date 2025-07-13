"use client";

import EquipmentForm from '@/app/components/equipment/EquipmentForm/EquipmentForm';

export default function CreateEquipmentPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">افزودن تجهیز جدید</h1>
        <EquipmentForm />
      </div>
    </div>
  );
} 