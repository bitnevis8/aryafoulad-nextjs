"use client";
import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";

export default function DashboardProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [filters, setFilters] = useState({ q: '', firstName: '', lastName: '', nationalId: '', mobile: '' });

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k,v])=>{ if (v) params.set(k, v); });
    
    // دریافت هم پروژه‌ها و هم درخواست‌های بازرسی
    const [projectsRes, inspectionRes] = await Promise.all([
      fetch(`/api/projects/requests/getAll?${params.toString()}`, { credentials: 'include' }),
      fetch(`/api/inspection-requests/getAll?${params.toString()}`, { credentials: 'include' })
    ]);
    
    const [projectsData, inspectionData] = await Promise.all([
      projectsRes.json(),
      inspectionRes.json()
    ]);
    
    let allItems = [];
    
    // اضافه کردن پروژه‌ها
    if (projectsData.success) {
      const projectsList = Array.isArray(projectsData.data) ? projectsData.data : (Array.isArray(projectsData.data?.items) ? projectsData.data.items : []);
      allItems = [...projectsList.map(p => ({ ...p, source: 'project', uniqueId: `project_${p.id}` }))];
    }
    
    // اضافه کردن درخواست‌های بازرسی
    if (inspectionData.success) {
      const inspectionList = Array.isArray(inspectionData.data) ? inspectionData.data : (Array.isArray(inspectionData.data?.requests) ? inspectionData.data.requests : []);
      const inspectionItems = inspectionList.map(i => ({
        id: i.id,
        type: { name: i.projectType?.name || 'درخواست بازرسی' },
        client_name: `${i.firstName} ${i.lastName}`,
        status: i.status,
        createdAt: i.createdAt,
        source: 'inspection_request',
        uniqueId: `inspection_${i.id}`
      }));
      allItems = [...allItems, ...inspectionItems];
    }
    
    // مرتب‌سازی بر اساس تاریخ
    allItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setItems(allItems);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const statusFa = {
    // وضعیت‌های پروژه
    requested: "درخواست شده",
    quoted: "اعلام هزینه",
    scheduled: "زمان‌بندی",
    inspecting: "در حال بازرسی",
    reporting: "ثبت گزارش",
    approved: "تایید نهایی",
    rejected: "رد شده",
    // وضعیت‌های درخواست بازرسی
    pending: "در انتظار بررسی",
    reviewed: "بررسی شده",
    archived: "آرشیو شده",
  };

  const updateStatus = async (id, status, source) => {
    setStatusUpdating(id);
    try {
      let url;
      if (source === 'inspection_request') {
        url = `/api/inspection-requests/updateStatus/${id}`;
      } else {
        url = `/api/projects/requests/status/${id}`;
      }
      
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setItems(prev => prev.map(p => p.uniqueId === `${source}_${id}` ? { ...p, status } : p));
      } else {
        alert(data.message || 'خطا در تغییر وضعیت');
      }
    } finally {
      setStatusUpdating(null);
    }
  };

  const convertToProject = async (inspectionRequestId) => {
    if (!confirm('آیا می‌خواهید این درخواست بازرسی را به پروژه تبدیل کنید؟')) return;
    
    try {
      const res = await fetch(`/api/inspection-requests/convertToProject/${inspectionRequestId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('درخواست با موفقیت به پروژه تبدیل شد');
        // حذف درخواست بازرسی از لیست و اضافه کردن پروژه جدید
        setItems(prev => {
          const filtered = prev.filter(p => p.uniqueId !== `inspection_${inspectionRequestId}`);
          const newProject = {
            id: data.data.project.id,
            type: { name: data.data.project.type?.name || 'پروژه' },
            client_name: data.data.project.client_name,
            status: data.data.project.status,
            createdAt: data.data.project.createdAt,
            source: 'project',
            uniqueId: `project_${data.data.project.id}`
          };
          return [...filtered, newProject].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      } else {
        alert(data.message || 'خطا در تبدیل درخواست به پروژه');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">درخواست‌های پروژه</h1>
          <p className="text-gray-600 text-sm mt-1">مدیریت درخواست‌ها و وضعیت پروژه‌ها</p>
        </div>
        <a href="/projects/request"><Button variant="secondary">ثبت درخواست جدید</Button></a>
      </div>
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input className="border rounded px-3 py-2" placeholder="جست‌وجوی کلی" value={filters.q} onChange={e=>setFilters(f=>({...f, q: e.target.value}))} />
          <input className="border rounded px-3 py-2" placeholder="نام" value={filters.firstName} onChange={e=>setFilters(f=>({...f, firstName: e.target.value}))} />
          <input className="border rounded px-3 py-2" placeholder="نام خانوادگی" value={filters.lastName} onChange={e=>setFilters(f=>({...f, lastName: e.target.value}))} />
          <input className="border rounded px-3 py-2" placeholder="کد ملی" value={filters.nationalId} onChange={e=>setFilters(f=>({...f, nationalId: e.target.value}))} />
          <input className="border rounded px-3 py-2" placeholder="موبایل" value={filters.mobile} onChange={e=>setFilters(f=>({...f, mobile: e.target.value}))} />
        </div>
        <div className="flex justify-end mt-3">
          <Button variant="outline" onClick={load}>جست‌وجو</Button>
        </div>
      </div>
      <div className="overflow-x-auto border rounded-xl bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-right">شناسه</th>
              <th className="p-2 text-right">نوع</th>
              <th className="p-2 text-right">متقاضی</th>
              <th className="p-2 text-right">وضعیت</th>
              <th className="p-2 text-right">تاریخ</th>
              <th className="p-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p.uniqueId} className="border-t">
                <td className="p-3">{p.id}</td>
                <td className="p-3">
                  <div>
                    <div className="font-medium">{p.type?.name || '-'}</div>
                    <div className="text-xs text-gray-500">
                      {p.source === 'inspection_request' ? 'درخواست بازرسی' : 'پروژه'}
                    </div>
                  </div>
                </td>
                <td className="p-3">{p.client_name}</td>
                <td className="p-3">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">{statusFa[p.status] || p.status}</span>
                </td>
                <td className="p-3">{new Date(p.createdAt).toLocaleDateString('fa-IR')}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    {p.source === 'inspection_request' ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => convertToProject(p.id)}>تبدیل به پروژه</Button>
                        <Button variant="outline" size="sm" onClick={() => alert('جزئیات درخواست بازرسی')}>جزئیات</Button>
                        <select disabled={statusUpdating===p.id} className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 min-w-40"
                              value={p.status}
                              onChange={(e)=>updateStatus(p.id, e.target.value, p.source)}>
                          {['pending','reviewed','approved','rejected','archived'].map(s=>
                            <option key={s} value={s}>{statusFa[s] || s}</option>
                          )}
                        </select>
                      </>
                    ) : (
                      <>
                        <a href={`/dashboard/projects/${p.id}`}><Button variant="outline" size="sm">جزئیات</Button></a>
                        <a href={`/dashboard/projects/${p.id}/costs`}><Button variant="outline" size="sm" className="bg-green-50 text-green-700 border-green-200">هزینه‌ها</Button></a>
                        <a href={`/dashboard/projects/${p.id}/payments`}><Button variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200">پرداختی‌ها</Button></a>
                        <a href={`/dashboard/projects/${p.id}/reports`}><Button variant="outline" size="sm" className="bg-purple-50 text-purple-700 border-purple-200">گزارش‌ها</Button></a>
                        <select disabled={statusUpdating===p.id} className="border rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 min-w-40"
                              value={p.status}
                              onChange={(e)=>updateStatus(p.id, e.target.value, p.source)}>
                          {['requested','quoted','scheduled','inspecting','reporting','approved','rejected'].map(s=>
                            <option key={s} value={s}>{statusFa[s] || s}</option>
                          )}
                        </select>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="p-6 text-center text-gray-500" colSpan={6}>موردی یافت نشد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

