"use client";
import React, { use } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectLayout({ children, params }) {
  const pathname = usePathname();
  const { id } = use(params);

  const navItems = [
    { href: `/dashboard/projects/${id}`, label: "جزئیات", icon: "📋" },
    { href: `/dashboard/projects/${id}/costs`, label: "هزینه‌ها", icon: "💰" },
    { href: `/dashboard/projects/${id}/payments`, label: "پرداختی‌ها", icon: "💳" },
    { href: `/dashboard/projects/${id}/reports`, label: "گزارش‌ها", icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Link href="/dashboard/projects" className="text-gray-500 hover:text-gray-700">
                ← بازگشت به لیست پروژه‌ها
              </Link>
            </div>
            <div className="flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-blue-100 text-blue-700 border border-blue-200"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {children}
      </div>
    </div>
  );
}
