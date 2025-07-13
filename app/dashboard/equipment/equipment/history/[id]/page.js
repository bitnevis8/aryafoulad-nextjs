"use client";

import { use } from 'react';
import EquipmentHistory from '@/app/components/equipment/EquipmentHistory/EquipmentHistory';

export default function EquipmentHistoryPage({ params }) {
  const resolvedParams = use(params);
  
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <EquipmentHistory equipmentId={resolvedParams.id} />
      </div>
    </div>
  );
} 