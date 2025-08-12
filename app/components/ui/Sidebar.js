'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BuildingOffice2Icon as WarehouseIcon,
  CubeIcon as PackageIcon,
  ClipboardDocumentListIcon as ClipboardListIcon,
  UserPlusIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

const menuItems = [
  {
    title: 'داشبورد',
    path: '/dashboard',
    icon: '🏠',
  },
  {
    title: 'ابلاغ ماموریت',
    icon: '🚗',
    submenu: [
      { title: 'لیست ماموریت‌ها', path: '/dashboard/missionOrder', icon: '📋' },
      { title: 'ایجاد ماموریت جدید', path: '/dashboard/missionOrder/create', icon: '✏️' },
    ],
  },
  {
    title: 'تنظیمات',
    icon: '⚙️',
    submenu: [
      { title: 'مدیریت مراکز', path: '/dashboard/settings/unit-locations', icon: '📍' },
      { title: 'مدیریت نرخ‌ها', path: '/dashboard/settings/rate-settings', icon: '💰' },
    ],
  },
  {
    title: 'مدیریت کاربران',
    icon: '👤',
    submenu: [
      { title: 'لیست کاربران', path: '/dashboard/user-management/users', icon: '🧑‍💼' },
      { title: 'لیست نقش‌ها', path: '/dashboard/user-management/roles', icon: '🛡️' },
    ],
  },
  {
    title: 'مدیریت پروژه‌ها',
    icon: '📁',
    submenu: [
      { title: 'درخواست‌های بازرسی', path: '/dashboard/projects', icon: '📝' },
      { title: 'تقویم بازرسی', path: '/dashboard/projects/calendar', icon: '🗓️' },
    ],
  },
  {
    title: 'مدیریت تجهیزات',
    icon: <WarehouseIcon className="w-5 h-5" />,
    submenu: [
      {
        title: 'مرور کلی',
        path: '/dashboard/equipment',
        icon: '📊'
      },
      {
        title: 'انبارها',
        path: '/dashboard/equipment/warehouse',
        icon: <WarehouseIcon className="w-4 h-4" />
      },
      {
        title: 'تجهیزات',
        path: '/dashboard/equipment/equipment',
        icon: <PackageIcon className="w-4 h-4" />
      },
      {
        title: 'واگذاری تجهیزات',
        path: '/dashboard/equipment/assignments',
        icon: <UserPlusIcon className="w-4 h-4" />
      },
      {
        title: 'گزارش‌های کالیبراسیون',
        path: '/dashboard/equipment/calibration-reports',
        icon: <ClipboardListIcon className="w-4 h-4" />
      }
    ]
  },
  // {
  //   title: 'مدیریت مرخصی',
  //   icon: <CalendarDaysIcon className="w-5 h-5" />,
  //   submenu: [
  //     {
  //       title: 'درخواست مرخصی',
  //       path: '/dashboard/leave-request',
  //       icon: '📝'
  //     },
  //     {
  //       title: 'ایجاد درخواست جدید',
  //       path: '/dashboard/leave-request/create',
  //       icon: '➕'
  //     },
  //     {
  //       title: 'مدیریت درخواست‌ها',
  //       path: '/dashboard/leave-request/management',
  //       icon: '✅'
  //     }
  //   ]
  // },
];

export default function Sidebar({ onLinkClick }) {
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (title) => {
    setOpenMenu(openMenu === title ? null : title);
  };

  const isActive = (path) => {
    // For exact path matching, especially for submenu items
    if (path === '/dashboard/equipment') {
      return pathname === path; // Only exact match for overview
    }
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <aside className="w-64 h-screen bg-gray-800 text-white p-4">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.title} className="space-y-1">
            {item.submenu ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                    openMenu === item.title ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center">
                    <span className="ml-2">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  <span className="text-lg">
                    {openMenu === item.title ? '▼' : '▶'}
                  </span>
                </button>
                
                {openMenu === item.title && (
                  <div className="mr-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => (
                      <Link
                        key={subItem.path}
                        href={subItem.path}
                        onClick={onLinkClick}
                        className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                          isActive(subItem.path) ? 'bg-gray-700' : ''
                        }`}
                      >
                        <span className="ml-2">{subItem.icon}</span>
                        <span>{subItem.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                href={item.path}
                onClick={onLinkClick}
                className={`flex items-center p-2 rounded-lg hover:bg-gray-700 transition-colors ${
                  isActive(item.path) ? 'bg-gray-700' : ''
                }`}
              >
                <span className="ml-2">{item.icon}</span>
                <span>{item.title}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
} 