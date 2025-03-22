"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "داشبورد",
      href: "/dashboard",
      icon: "🏠",
    },
    {
      title: "ابلاغ ماموریت",
      href: "/dashboard/missionOrder",
      icon: "🚗",
      submenu: [
        {
          title: "لیست ماموریت‌ها",
          href: "/dashboard/missionOrder",
          icon: "📋",
        },
        {
          title: "ایجاد ماموریت جدید",
          href: "/dashboard/missionOrder/create",
          icon: "✏️",
        },
      ],
    },
    {
      title: "تنظیمات",
      href: "/dashboard/settings",
      icon: "⚙️",
      submenu: [
        {
          title: "مدیریت مراکز",
          href: "/dashboard/settings/unit-locations",
          icon: "📍",
        },
      ],
    },
  ];

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500">
      {/* Header */}
      <header className="bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">آریا فولاد قرن</h1>
              <p className="text-sm text-gray-500">سامانه ابلاغ حکم ماموریت</p>
            </div>
            <div className="text-gray-700">
              خوش آمدید 👋
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-64 bg-white/95 shadow-lg backdrop-blur-sm rounded-lg">
            <nav className="p-4">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.href}>
                    <div className="mb-2">
                      <Link
                        href={item.href}
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                          isActive(item.href) 
                            ? "bg-gray-100 text-gray-900 font-medium" 
                            : "text-gray-600"
                        }`}
                      >
                        <span className="ml-2">{item.icon}</span>
                        {item.title}
                      </Link>
                    </div>
                    {item.submenu && (
                      <ul className="mr-6 space-y-2 border-r border-gray-200 pr-4">
                        {item.submenu.map((subitem) => (
                          <li key={subitem.href}>
                            <Link
                              href={subitem.href}
                              className={`flex items-center p-2 rounded-lg hover:bg-gray-100 ${
                                isActive(subitem.href) 
                                  ? "bg-gray-100 text-gray-900 font-medium" 
                                  : "text-gray-600"
                              }`}
                            >
                              <span className="ml-2">{subitem.icon}</span>
                              {subitem.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-sm p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 