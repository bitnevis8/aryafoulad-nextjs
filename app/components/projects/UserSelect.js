"use client";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

export default function UserSelect({ value, onChange, placeholder = "انتخاب کاربر", filterRole }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/users/getAll?limit=200', { credentials: 'include' });
        const data = await res.json();
        if (data.success) setUsers(data.data || []);
      } finally { setLoading(false); }
    })();
  }, []);

  const flatUsers = useMemo(() => {
    if (Array.isArray(users)) return users;
    if (Array.isArray(users?.users)) return users.users;
    if (Array.isArray(users?.rows)) return users.rows;
    return [];
  }, [users]);

  const filteredUsers = useMemo(() => {
    if (!filterRole) return flatUsers;
    return flatUsers.filter(u => Array.isArray(u.roles) && u.roles.some(r => r?.name === filterRole));
  }, [flatUsers, filterRole]);

  const options = useMemo(() => filteredUsers.map(u => {
    // تعیین نام بر اساس نوع کاربر
    let displayName = '';
    if (u.type === 'company' && u.companyName) {
      // کاربر حقوقی: نام شرکت
      displayName = u.companyName;
    } else if (u.type === 'person') {
      // کاربر حقیقی: نام + نام خانوادگی
      displayName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
    } else {
      // fallback: اگر نوع مشخص نیست، هر کدام که موجود باشد
      displayName = u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
    }
    
    // اگر نام خالی است، از username یا email استفاده کن
    if (!displayName) {
      displayName = u.username || u.email || u.mobile || 'بدون نام';
    }
    
    // اضافه کردن نقش‌ها
    const rolesText = u.roles?.length ? ` - ${u.roles.map(r=>r.nameFa || r.name || r.nameEn).join('، ')}` : '';
    
    return {
      value: u.id,
      label: displayName + rolesText
    };
  }), [filteredUsers]);

  const selected = useMemo(() => options.find(o => o.value === value) || null, [options, value]);

  return (
    <Select
      classNamePrefix="rs"
      isLoading={loading}
      isClearable
      placeholder={placeholder}
      options={options}
      value={selected}
      onChange={(opt) => onChange?.(opt?.value || '')}
      noOptionsMessage={() => 'موردی یافت نشد'}
      loadingMessage={() => 'در حال بارگذاری...'}
      styles={{
        control: (base) => ({ ...base, borderRadius: 8, minHeight: 40 }),
        menu: (base) => ({ ...base, zIndex: 50 }),
      }}
    />
  );
}

