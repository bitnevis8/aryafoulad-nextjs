"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomersListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = new URL("/api/users/getAll", window.location.origin);
      url.searchParams.set("limit", "20");
      if (q) url.searchParams.set("q", q);
      const res = await fetch(url.toString(), { credentials: "include" });
      const data = await res.json();
      const usersArr = Array.isArray(data?.data?.users) ? data.data.users : (Array.isArray(data?.data) ? data.data : []);
      // فیلتر نقش مشتری در کلاینت تا زمانی که فیلتر سرور اضافه شود
      const customersOnly = usersArr.filter(u => (u.roles || []).some(r => r.nameEn === "Customer" || r.nameFa === "مشتری"));
      setItems(customersOnly);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">لیست مشتری‌ها</h1>
        <Link href="/dashboard/customers/create" className="px-3 py-2 rounded bg-sky-600 text-white hover:bg-sky-700">افزودن مشتری</Link>
      </div>

      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="جست‌وجوی نام/موبایل/کدملی" className="border rounded px-3 py-2 w-full" />
        <button onClick={fetchData} className="px-3 py-2 rounded bg-gray-800 text-white">جست‌وجو</button>
      </div>

      {loading ? (
        <div>در حال بارگذاری...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border bg-white">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">#</th>
                <th className="p-2 border">نام</th>
                <th className="p-2 border">نام خانوادگی</th>
                <th className="p-2 border">کد ملی</th>
                <th className="p-2 border">موبایل</th>
                <th className="p-2 border">نقش‌ها</th>
                <th className="p-2 border">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u, idx) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-2 border">{idx+1}</td>
                  <td className="p-2 border">{u.firstName}</td>
                  <td className="p-2 border">{u.lastName}</td>
                  <td className="p-2 border">{u.nationalId || "-"}</td>
                  <td className="p-2 border">{u.mobile || "-"}</td>
                  <td className="p-2 border">{(u.roles||[]).map(r=>r.nameFa||r.nameEn).join("، ")}</td>
                  <td className="p-2 border whitespace-nowrap">
                    <Link href={`/dashboard/user-management/users/${u.id}`} className="text-sky-700 hover:underline ml-2">مشاهده</Link>
                    <Link href={`/dashboard/user-management/users/${u.id}/edit`} className="text-amber-600 hover:underline ml-2">ویرایش</Link>
                    <button onClick={async()=>{
                      if(!confirm('حذف این مشتری؟')) return;
                      await fetch(`/api/user/delete?id=${u.id}`, { method: 'DELETE' });
                      fetchData();
                    }} className="text-red-600 hover:underline">حذف</button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td className="p-3 text-center" colSpan={7}>موردی یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


