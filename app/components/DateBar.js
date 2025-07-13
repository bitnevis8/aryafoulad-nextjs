"use client";
import { useState, useEffect } from "react";

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
      <div className=" mx-auto px-8">
        <div className="text-sm text-sky-50 font-medium text-center">
          {persianDate}
        </div>
      </div>
    </div>
  );
} 