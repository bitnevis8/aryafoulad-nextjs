"use client";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

export default function UserSelect({ value, onChange, placeholder = "انتخاب کاربر" }) {
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

  const options = useMemo(() => flatUsers.map(u => ({
    value: u.id,
    label: `${u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || u.email || u.mobile || 'بدون نام')}` +
           `${u.roles?.length ? ` - ${u.roles.map(r=>r.nameFa || r.name || r.nameEn).join('، ')}` : ''}`
  })), [flatUsers]);

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

