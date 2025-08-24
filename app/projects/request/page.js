"use client";
import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";

export default function ProjectRequestPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    nationalId: "",
    companyName: "",
    project_type_id: "",
    request_payload: {}
  });
  const [tab, setTab] = useState('new');
  const [existing, setExisting] = useState({ nationalId: '', mobile: '' });
  const [existingResult, setExistingResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [canProceedNew, setCanProceedNew] = useState(false);
  const router = useRouter();
  const statusFa = {
    requested: "درخواست شده",
    quoted: "اعلام هزینه",
    scheduled: "زمان‌بندی",
    inspecting: "در حال بازرسی",
    reporting: "ثبت گزارش",
    approved: "تایید نهایی",
    rejected: "رد شده",
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/projects/types", { credentials: "include" });
        const data = await res.json();
        if (data.success) setTypes(data.data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // اگر تب مشتری جدید است، قبل از ثبت بررسی تداخل انجام دهیم
    if (tab === 'new' && (form.nationalId || form.mobile)) {
      const params = new URLSearchParams();
      if (form.nationalId) params.set('nationalId', form.nationalId);
      if (form.mobile) params.set('mobile', form.mobile);
      const chk = await fetch(`/api/projects/customers/find?${params.toString()}`, { credentials: 'include' });
      const chkData = await chk.json();
      if (chkData.success && chkData.data?.customer) {
        // مشتری موجود است → هشدار، تب را به «مشتری قدیمی» تغییر بده و نتایج را نشان بده
        setExisting({ nationalId: form.nationalId, mobile: form.mobile });
        setExistingResult(chkData.data);
        setTab('existing');
        alert('شما از مشتریان قبلی ما هستید. لطفاً از تب «مشتری قدیمی» درخواست جدید ثبت کنید.');
        return;
      }
    }
    const res = await fetch("/api/projects/requests/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      credentials: "include"
    });
    const data = await res.json();
    if (data.success) router.push("/dashboard/projects");
    else alert(data.message || "خطا در ثبت");
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ثبت درخواست پروژه</h1>
        <p className="text-gray-600 text-sm mt-1">لطفاً اطلاعات زیر را تکمیل کنید</p>
      </div>
      <div className="mb-4 border-b">
        {[
          {k:'new', t:'مشتری جدید'},
          {k:'existing', t:'مشتری قدیمی'},
        ].map(tb => (
          <button key={tb.k} type="button" className={`px-3 py-2 -mb-px border-b-2 ${tab===tb.k?'border-blue-600 text-blue-600':'border-transparent text-gray-600'}`} onClick={()=>setTab(tb.k)}>{tb.t}</button>
        ))}
      </div>
      {tab==='new' ? (
      <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">نام</label>
            <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.firstName} onChange={e=>setForm(f=>({...f, firstName: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm mb-1">نام خانوادگی</label>
            <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.lastName} onChange={e=>setForm(f=>({...f, lastName: e.target.value}))} required />
          </div>
          <div>
            <label className="block text-sm mb-1">موبایل</label>
            <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.mobile} onChange={e=>setForm(f=>({...f, mobile: e.target.value}))} />
          </div>
          <div>
            <label className="block text-sm mb-1">کد ملی</label>
            <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.nationalId} onChange={e=>setForm(f=>({...f, nationalId: e.target.value}))} required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">نام شرکت (اختیاری)</label>
            <input className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.companyName} onChange={e=>setForm(f=>({...f, companyName: e.target.value}))} />
          </div>
        </div>
        {!canProceedNew && (
          <div className="flex justify-end">
            <Button type="button" onClick={async()=>{
              setChecking(true);
              const params = new URLSearchParams();
              if (form.nationalId) params.set('nationalId', form.nationalId);
              if (form.mobile) params.set('mobile', form.mobile);
              const chk = await fetch(`/api/projects/customers/find?${params.toString()}`, { credentials: 'include' });
              const chkData = await chk.json();
              setChecking(false);
              if (chkData.success && chkData.data?.customer) {
                setExisting({ nationalId: form.nationalId, mobile: form.mobile });
                setExistingResult(chkData.data);
                setTab('existing');
                alert('شما از مشتریان قبلی ما هستید. لطفاً از تب «مشتری قدیمی» درخواست جدید ثبت کنید.');
              } else {
                setCanProceedNew(true);
              }
            }}>{checking? 'در حال بررسی...' : 'ادامه'}</Button>
          </div>
        )}
        {canProceedNew && (
          <>
            <div>
              <label className="block text-sm mb-1">نوع پروژه</label>
              <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.project_type_id} onChange={e=>setForm(f=>({...f, project_type_id: Number(e.target.value)}))} required>
                <option value="">انتخاب کنید</option>
                {types.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            {/* فرم پویا برای نوع مخصوص: اگر Playground Earth & Weld انتخاب شد، رندر فرم درخواست مخصوص */}
            {types.find(t => t.id === form.project_type_id)?.code === 'PLAYGROUND_EARTH_WELD' && (
              <PlaygroundRequestDynamic onPayloadChange={(payload)=>setForm(f=>({...f, request_payload: payload}))} />
            )}
            <div className="flex justify-end">
              <Button type="submit">ثبت درخواست</Button>
            </div>
          </>
        )}
      </form>
      ) : (
        <div className="space-y-4 bg-white border rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <input className="border rounded px-3 py-2" placeholder="کد ملی" value={existing.nationalId} onChange={e=>setExisting(s=>({...s, nationalId: e.target.value}))} />
            <input className="border rounded px-3 py-2" placeholder="موبایل" value={existing.mobile} onChange={e=>setExisting(s=>({...s, mobile: e.target.value}))} />
            <Button variant="outline" onClick={async()=>{
              setChecking(true);
              const params = new URLSearchParams();
              if (existing.nationalId) params.set('nationalId', existing.nationalId);
              if (existing.mobile) params.set('mobile', existing.mobile);
              const res = await fetch(`/api/projects/customers/find?${params.toString()}`, { credentials: 'include' });
              const data = await res.json();
              setExistingResult(data.success ? data.data : { error: data.message });
              setChecking(false);
            }}>{checking?'...':'بررسی'}</Button>
          </div>
          {existingResult && existingResult.customer && (
            <div className="space-y-4">
              <div className="border rounded p-3">
                <div className="font-semibold">مشتری</div>
                <div>{existingResult.customer.firstName} {existingResult.customer.lastName} - {existingResult.customer.mobile||'-'}</div>
              </div>
              <div className="border rounded p-3">
                <div className="font-semibold mb-2">تاریخچه درخواست‌ها</div>
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-2 text-right">ردیف</th>
                      <th className="p-2 text-right">نوع پروژه</th>
                      <th className="p-2 text-right">تاریخ درخواست</th>
                      <th className="p-2 text-right">وضعیت بازرسی</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(existingResult.projects||[]).map((p, idx) => (
                      <tr key={p.id} className="border-t">
                        <td className="p-2">{idx + 1}</td>
                        <td className="p-2">{p.type?.name || '-'}</td>
                        <td className="p-2">{new Date(p.createdAt).toLocaleDateString('fa-IR')}</td>
                        <td className="p-2">{statusFa[p.status] || p.status || '-'}</td>
                      </tr>
                    ))}
                    {(!existingResult.projects || existingResult.projects.length===0) && (
                      <tr><td className="p-3" colSpan={4}>موردی یافت نشد</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="border rounded p-3">
                <div className="font-semibold mb-2">ثبت درخواست جدید</div>
                {/* فقط نوع پروژه و فرم درخواست */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-1">نوع پروژه</label>
                    <select className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" value={form.project_type_id} onChange={e=>setForm(f=>({...f, project_type_id: Number(e.target.value)}))} required>
                      <option value="">انتخاب کنید</option>
                      {types.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  {types.find(t => t.id === form.project_type_id)?.code === 'PLAYGROUND_EARTH_WELD' && (
                    <PlaygroundRequestDynamic onPayloadChange={(payload)=>setForm(f=>({...f, request_payload: payload}))} />
                  )}
                  <div className="flex justify-end">
                    <Button onClick={handleSubmit}>ثبت درخواست</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {existingResult && existingResult.error && (
            <div className="text-red-600">{existingResult.error}</div>
          )}
        </div>
      )}
    </div>
  );
}

function PlaygroundRequestDynamic({ onPayloadChange }) {
  const [template, setTemplate] = useState(null);
  const [payload, setPayload] = useState(null);
  const [marker, setMarker] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/projects/forms/template/AFG-FR-XXX-R0', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setTemplate(data.data);
    })();
  }, []);

  useEffect(() => {
    onPayloadChange?.(payload);
  }, [payload]);

  if (!template) return <div className="text-sm text-gray-500">در حال بارگذاری فرم...</div>;
  const FormRenderer = require('@/app/components/projects/FormRenderer').default;
  const Map = require('@/app/components/ui/Map/Map').default;
  const SearchBox = require('@/app/components/ui/Map/SearchBox').default;
  return (
    <div className="mt-6 border-t pt-4">
      <h2 className="font-semibold mb-2">علامت‌گذاری آدرس روی نقشه</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <Map
            height="350px"
            center={marker ? [marker.latitude, marker.longitude] : undefined}
            onMapClick={({ latitude, longitude }) => {
              const next = { ...(payload||template.schema) };
              next.fields = next.fields || {};
              next.fields['آدرس'] = `${latitude},${longitude}`;
              setPayload(next);
              setMarker({ latitude, longitude });
            }}
            markers={marker? [marker]: []}
          />
        </div>
        <div>
          <SearchBox onSearchSelect={(coords)=>{
            const [lat, lng] = coords;
            const next = { ...(payload||template.schema) };
            next.fields = next.fields || {};
            next.fields['آدرس'] = `${lat},${lng}`;
            setPayload(next);
            setMarker({ latitude: lat, longitude: lng });
          }} />
          <p className="text-xs text-gray-600 mt-2">با جست‌وجو یا کلیک روی نقشه، مختصات در آدرس ثبت می‌شود.</p>
        </div>
      </div>
      <h2 className="font-semibold mb-2">جزئیات فرم درخواست (ارت و جوش)</h2>
      <FormRenderer template={template} value={template.schema} onChange={setPayload} />
    </div>
  );
}

