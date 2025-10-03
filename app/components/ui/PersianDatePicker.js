"use client";
import React from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

export default function PersianDatePicker({ 
  value, 
  onChange, 
  placeholder = "تاریخ را انتخاب کنید",
  className = "",
  inputClass = "",
  ...props 
}) {
  const handleChange = (date) => {
    if (onChange) {
      // اگر تاریخ انتخاب شده، آن را به فرمت شمسی نگه دار
      if (date) {
        // تاریخ شمسی را به فرمت YYYY-MM-DD شمسی تبدیل کن
        const year = date.year;
        const month = String(date.month.number).padStart(2, '0');
        const day = String(date.day).padStart(2, '0');
        const persianDateString = `${year}-${month}-${day}`;
        onChange(persianDateString);
      } else {
        onChange('');
      }
    }
  };

  return (
    <DatePicker
      calendar={persian}
      locale={persian_fa}
      value={value}
      onChange={handleChange}
      className={`w-full ${className}`}
      containerClassName="w-full"
      style={{ width: '100%' }}
      inputClass={`border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 w-full ${inputClass}`}
      placeholder={placeholder}
      format="YYYY/MM/DD"
      {...props}
    />
  );
}
