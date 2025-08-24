"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function DateBar() {
  const [persianDate, setPersianDate] = useState("");

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const persianDate = new Intl.DateTimeFormat('fa-IR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long'
      }).format(now);
      setPersianDate(persianDate);
    };

    updateDate();
    const interval = setInterval(updateDate, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-sky-950 border-b border-gray-800 py-2 px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm text-sky-50 font-medium">{persianDate}</div>
        <Link href="/projects/request" className="text-xs px-3 py-1.5 rounded bg-sky-100 text-sky-900 hover:bg-sky-200 transition">ثبت درخواست بازرسی</Link>
      </div>
    </div>
  );
} 