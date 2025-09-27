"use client";
import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";

export default function DashboardProjectsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [filters, setFilters] = useState({ 
    q: '', 
    firstName: '', 
    lastName: '', 
    nationalId: '', 
    mobile: '',
    status: '',
    projectType: '',
    dateFrom: '',
    dateTo: '',
    source: ''
  });

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
    if (projectsData.success && (!filters.source || filters.source === 'project')) {
      const projectsList = Array.isArray(projectsData.data) ? projectsData.data : (Array.isArray(projectsData.data?.items) ? projectsData.data.items : []);
      allItems = [...projectsList.map(p => ({ ...p, source: 'project', uniqueId: `project_${p.id}` }))];
    }
    
    // اضافه کردن درخواست‌های بازرسی (فقط آنهایی که تبدیل نشده‌اند)
    if (inspectionData.success && (!filters.source || filters.source === 'inspection_request')) {
      const inspectionList = Array.isArray(inspectionData.data) ? inspectionData.data : (Array.isArray(inspectionData.data?.requests) ? inspectionData.data.requests : []);
      const inspectionItems = inspectionList
        .filter(i => !i.project_id) // فقط درخواست‌هایی که تبدیل نشده‌اند
        .map(i => ({
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
    
    // فیلتر وضعیت در frontend (اگر backend فیلتر نکرده باشد)
    if (filters.status) {
      allItems = allItems.filter(item => item.status === filters.status);
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
        // بارگذاری مجدد لیست برای نمایش به‌روز
        load();
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
          <p className="text-gray-600 text-sm mt-1">
            مدیریت درخواست‌ها و وضعیت پروژه‌ها 
            {items.length > 0 && (
              <span className="mr-2 text-blue-600 font-semibold">
                ({items.length} مورد یافت شد)
              </span>
            )}
          </p>
        </div>
        <a href="/projects/request"><Button variant="secondary">ثبت درخواست جدید</Button></a>
      </div>
      <div className="bg-white border rounded-xl shadow-sm p-4 mb-4">
        <h3 className="text-lg font-semibold mb-4">فیلترها و جستجو</h3>
        
        {/* ردیف اول - جستجوی کلی */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input 
            className="border rounded px-3 py-2" 
            placeholder="جست‌وجوی کلی" 
            value={filters.q} 
            onChange={e=>setFilters(f=>({...f, q: e.target.value}))} 
          />
          <select 
            className="border rounded px-3 py-2" 
            value={filters.source} 
            onChange={e=>setFilters(f=>({...f, source: e.target.value}))}
          >
            <option value="">همه انواع</option>
            <option value="project">پروژه</option>
            <option value="inspection_request">درخواست بازرسی</option>
          </select>
          <select 
            className="border rounded px-3 py-2" 
            value={filters.status} 
            onChange={e=>setFilters(f=>({...f, status: e.target.value}))}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="pending">در انتظار بررسی</option>
            <option value="reviewed">بررسی شده</option>
            <option value="approved">تایید شده</option>
            <option value="rejected">رد شده</option>
            <option value="archived">آرشیو شده</option>
            <option value="requested">درخواست شده</option>
            <option value="quoted">اعلام هزینه</option>
            <option value="scheduled">زمان‌بندی</option>
            <option value="inspecting">در حال بازرسی</option>
            <option value="reporting">ثبت گزارش</option>
          </select>
        </div>

        {/* ردیف دوم - اطلاعات شخصی */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input 
            className="border rounded px-3 py-2" 
            placeholder="نام" 
            value={filters.firstName} 
            onChange={e=>setFilters(f=>({...f, firstName: e.target.value}))} 
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="نام خانوادگی" 
            value={filters.lastName} 
            onChange={e=>setFilters(f=>({...f, lastName: e.target.value}))} 
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="کد ملی" 
            value={filters.nationalId} 
            onChange={e=>setFilters(f=>({...f, nationalId: e.target.value}))} 
          />
          <input 
            className="border rounded px-3 py-2" 
            placeholder="موبایل" 
            value={filters.mobile} 
            onChange={e=>setFilters(f=>({...f, mobile: e.target.value}))} 
          />
        </div>

        {/* ردیف سوم - تاریخ و نوع پروژه */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <input 
            type="date" 
            className="border rounded px-3 py-2" 
            placeholder="از تاریخ" 
            value={filters.dateFrom} 
            onChange={e=>setFilters(f=>({...f, dateFrom: e.target.value}))} 
          />
          <input 
            type="date" 
            className="border rounded px-3 py-2" 
            placeholder="تا تاریخ" 
            value={filters.dateTo} 
            onChange={e=>setFilters(f=>({...f, dateTo: e.target.value}))} 
          />
          <select 
            className="border rounded px-3 py-2" 
            value={filters.projectType} 
            onChange={e=>setFilters(f=>({...f, projectType: e.target.value}))}
          >
            <option value="">همه انواع پروژه</option>
            <option value="1">بازرسی جرثقیل</option>
            <option value="2">تست جذب ضربه (HIC)</option>
            <option value="3">تست لوله پلی‌اتیلن</option>
            <option value="4">بازرسی ارت</option>
          </select>
        </div>

        {/* دکمه‌های عملیات */}
        <div className="flex justify-between items-center">
          <Button 
            variant="outline" 
            onClick={() => setFilters({ q: '', firstName: '', lastName: '', nationalId: '', mobile: '', status: '', projectType: '', dateFrom: '', dateTo: '', source: '' })}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            پاک کردن فیلترها
          </Button>
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
                        <a href={`/dashboard/inspection-requests/${p.id}`}>
                          <Button variant="outline" size="sm">جزئیات</Button>
                        </a>
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

