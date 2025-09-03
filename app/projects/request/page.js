"use client";
import { useEffect, useState } from "react";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ProjectRequestPage() {
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    description: "",
    project_type_id: "",
    request_payload: {}
  });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

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
    
    // اعتبارسنجی فیلدهای اجباری
    if (!form.firstName || !form.lastName || !form.mobile || !form.project_type_id) {
      alert("لطفاً تمام فیلدهای اجباری را پر کنید");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.inspectionRequests.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert("درخواست بازرسی با موفقیت ثبت شد. تیم ما در اسرع وقت با شما تماس خواهند گرفت.");
        // پاک کردن فرم
        setForm({
          firstName: "",
          lastName: "",
          mobile: "",
          description: "",
          project_type_id: "",
          request_payload: {}
        });
      } else {
        alert(data.message || "خطا در ثبت درخواست");
      }
    } catch (error) {
      alert("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">ثبت درخواست بازرسی</h1>
        <p className="text-gray-600 text-sm mt-1">لطفاً اطلاعات زیر را تکمیل کنید. تیم ما در اسرع وقت با شما تماس خواهند گرفت.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white border rounded-xl p-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">نام *</label>
            <input 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
              value={form.firstName} 
              onChange={e=>setForm(f=>({...f, firstName: e.target.value}))} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">نام خانوادگی *</label>
            <input 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
              value={form.lastName} 
              onChange={e=>setForm(f=>({...f, lastName: e.target.value}))} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">شماره موبایل *</label>
            <input 
              type="tel"
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
              value={form.mobile} 
              onChange={e=>setForm(f=>({...f, mobile: e.target.value}))} 
              placeholder="09123456789"
              required 
            />
          </div>
          <div>
            <label className="block text-sm mb-1">نوع پروژه *</label>
            <select 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
              value={form.project_type_id} 
              onChange={e=>setForm(f=>({...f, project_type_id: Number(e.target.value)}))} 
              required
            >
              <option value="">انتخاب کنید</option>
              {types.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">توضیحات (اختیاری)</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500" 
              value={form.description} 
              onChange={e=>setForm(f=>({...f, description: e.target.value}))} 
              placeholder="توضیحات اضافی در مورد درخواست خود..."
              rows="3"
            />
          </div>
        </div>
        
        {/* فرم پویا برای نوع مخصوص: اگر Playground Earth & Weld انتخاب شد، رندر فرم درخواست مخصوص */}
        {types.find(t => t.id === form.project_type_id)?.code === 'PLAYGROUND_EARTH_WELD' && (
          <PlaygroundRequestDynamic onPayloadChange={(payload)=>setForm(f=>({...f, request_payload: payload}))} />
        )}
        
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'در حال ثبت...' : 'ثبت درخواست'}
          </Button>
        </div>
      </form>
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

