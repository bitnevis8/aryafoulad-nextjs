"use client";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/app/components/ui/Map/Map"), { ssr: false });

export default function CreateCustomerPage() {
  const [form, setForm] = useState({
    type: "person", // person | company
    firstName: "",
    lastName: "",
    nationalId: "",
    phone: "",
    mobile: "",
    email: "",
    companyName: "",
    username: "",
    password: "123456", // پیشفرض، بعداً می‌توان به OTP تغییر داد
    latitude: null,
    longitude: null,
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [customerRoleId, setCustomerRoleId] = useState(null);

  useEffect(() => {
    // یافتن نقش مشتری برای اختصاص هنگام ایجاد
    const loadRoles = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.roles.getAll, { credentials: "include" });
        const data = await res.json();
        const roles = Array.isArray(data?.data?.roles) ? data.data.roles : (Array.isArray(data?.data) ? data.data : []);
        const customer = roles.find(r => r.nameEn === 'Customer' || r.nameFa === 'مشتری');
        if (customer) setCustomerRoleId(customer.id);
      } catch (e) {
        // ignore
      }
    };
    loadRoles();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      // ساخت کاربر و تخصیص نقش "Customer"
      const res = await fetch("/api/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName || form.companyName || "-",
          lastName: form.lastName || (form.type === "company" ? "(شرکت)" : "-"),
          email: form.email || `${Date.now()}@example.com`,
          mobile: form.mobile || null,
          phone: form.phone || null,
          username: form.username || form.mobile || form.nationalId || undefined,
          password: form.password,
          roleIds: customerRoleId ? [customerRoleId] : undefined,
          // فیلدهای پروفایل مشتری
          nationalId: form.nationalId || null,
          type: form.type,
          companyName: form.companyName || null,
          latitude: typeof form.latitude === 'number' ? form.latitude : null,
          longitude: typeof form.longitude === 'number' ? form.longitude : null,
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "خطا");
      setMessage("مشتری با موفقیت ایجاد شد.");
    } catch (err) {
      setMessage(err.message || "خطا در ذخیره سازی");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">افزودن مشتری</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">نوع مشتری</label>
            <select value={form.type} onChange={e=>setForm(f=>({...f, type: e.target.value}))} className="border rounded px-3 py-2 w-full">
              <option value="person">شخص</option>
              <option value="company">شرکت</option>
            </select>
          </div>

          {form.type === "company" ? (
            <div>
              <label className="block mb-1">نام شرکت</label>
              <input value={form.companyName} onChange={e=>setForm(f=>({...f, companyName: e.target.value}))} className="border rounded px-3 py-2 w-full" />
            </div>
          ) : (
            <>
              <div>
                <label className="block mb-1">نام</label>
                <input value={form.firstName} onChange={e=>setForm(f=>({...f, firstName: e.target.value}))} className="border rounded px-3 py-2 w-full" />
              </div>
              <div>
                <label className="block mb-1">نام خانوادگی</label>
                <input value={form.lastName} onChange={e=>setForm(f=>({...f, lastName: e.target.value}))} className="border rounded px-3 py-2 w-full" />
              </div>
            </>
          )}

          <div>
            <label className="block mb-1">کد ملی</label>
            <input value={form.nationalId} onChange={e=>setForm(f=>({...f, nationalId: e.target.value}))} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">ایمیل</label>
            <input type="email" value={form.email} onChange={e=>setForm(f=>({...f, email: e.target.value}))} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">تلفن</label>
            <input value={form.phone} onChange={e=>setForm(f=>({...f, phone: e.target.value}))} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">موبایل</label>
            <input value={form.mobile} onChange={e=>setForm(f=>({...f, mobile: e.target.value}))} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">نام کاربری</label>
            <input value={form.username} onChange={e=>setForm(f=>({...f, username: e.target.value}))} className="border rounded px-3 py-2 w-full" />
          </div>
          <div>
            <label className="block mb-1">رمز عبور</label>
            <input type="password" value={form.password} onChange={e=>setForm(f=>({...f, password: e.target.value}))} className="border rounded px-3 py-2 w-full" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block">موقعیت روی نقشه</label>
          <div className="h-64 rounded overflow-hidden border relative">
            <Map 
              showSearch
              onLocationSelect={({ latitude, longitude }) => setForm(f => ({ ...f, latitude, longitude }))}
              onMapClick={({ latitude, longitude }) => setForm(f => ({ ...f, latitude, longitude }))}
              markers={form.latitude && form.longitude ? [{ latitude: form.latitude, longitude: form.longitude, name: 'موقعیت مشتری' }] : []}
            />
          </div>
        </div>

        {message && <div className="text-sm text-sky-800 bg-sky-100 rounded px-3 py-2">{message}</div>}

        <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50">
          {saving ? "در حال ذخیره..." : "ثبت مشتری"}
        </button>
      </form>
    </div>
  );
}


