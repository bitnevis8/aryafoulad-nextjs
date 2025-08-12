"use client";
import { useEffect, useMemo, useState } from "react";
import Button from "@/app/components/ui/Button";
import Select from "react-select";
import dynamic from "next/dynamic";
const DatePicker = dynamic(() => import("react-multi-date-picker"), { ssr: false });
const TimePicker = dynamic(() => import("react-multi-date-picker/plugins/time_picker"), { ssr: false });
import moment from "moment-jalaali";

export default function ProjectsCalendarPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [projectId, setProjectId] = useState(null);
  const [date, setDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [assigned, setAssigned] = useState([]);
  const [projects, setProjects] = useState([]);
  const [calendar, setCalendar] = useState(undefined);
  const [locale, setLocale] = useState(undefined);
  const [calReady, setCalReady] = useState(false);

  const [scope, setScope] = useState('all');
  const load = async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (from) qs.set('from', from);
    if (to) qs.set('to', to);
    if (scope && scope !== 'all') qs.set('scope', scope);
    const res = await fetch(`/api/projects/inspections/calendar?${qs.toString()}`, { credentials: 'include' });
    const data = await res.json();
    if (data.success) setItems(data.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/projects/requests/getAll', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        const list = Array.isArray(data.data)
          ? data.data
          : (Array.isArray(data.data?.items)
            ? data.data.items
            : []);
        setProjects(list);
      }
    })();
  }, []);
  useEffect(() => {
    // load calendar/locale at runtime from react-date-object (correct source for v4)
    (async () => {
      try {
        const calMod = await import('react-date-object/calendars/persian');
        const locMod = await import('react-date-object/locales/persian_fa');
        setCalendar(calMod.default || calMod);
        setLocale(locMod.default || locMod);
        setCalReady(true);
      } catch (e) {
        // fallback: still render picker without jalali calendar
        setCalReady(true);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      const d = new Date(it.scheduled_at).toISOString().slice(0,10);
      if (!map.has(d)) map.set(d, []);
      map.get(d).push(it);
    }
    return Array.from(map.entries()).sort((a,b)=>a[0].localeCompare(b[0]));
  }, [items]);

  const createInspection = async () => {
    let iso;
    // react-multi-date-picker DateObject
    if (date && typeof date === 'object' && typeof date.toDate === 'function') {
      iso = date.toDate().toISOString();
    } else if (typeof date === 'string' && date.trim()) {
      // Parse Jalali string
      iso = moment(date.trim(), 'jYYYY/jMM/jDD HH:mm').toDate().toISOString();
    } else if (date instanceof Date) {
      iso = date.toISOString();
    } else {
      alert('لطفاً تاریخ و ساعت را انتخاب کنید');
      return;
    }
    const res = await fetch('/api/projects/inspections/create', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include',
      body: JSON.stringify({ project_id: Number(projectId?.value), scheduled_at: iso, assigned_user_ids: assigned.map(a=>a.value), notes })
    });
    const data = await res.json();
    if (data.success) { setProjectId(null); setDate(null); setAssigned([]); setNotes(''); load(); }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تقویم بازرسی</h1>
          <p className="text-gray-600 text-sm mt-1">زمان‌بندی بازرسی پروژه‌ها و تخصیص بازرس</p>
        </div>
        <div className="flex items-center gap-2">
          <input type="date" className="border rounded px-2 py-1" value={from} onChange={e=>setFrom(e.target.value)} />
          <span>تا</span>
          <input type="date" className="border rounded px-2 py-1" value={to} onChange={e=>setTo(e.target.value)} />
          <Button variant="outline" onClick={load}>فیلتر</Button>
        </div>
      </div>

      <div className="border rounded-xl bg-white shadow-sm p-4">
        <div className="font-semibold mb-3">ایجاد بازرسی</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-4">
            <label className="block text-sm mb-1">پروژه</label>
            <ProjectSelect value={projectId} onChange={setProjectId} projects={projects} />
          </div>
          <div>
            <label className="block text-sm mb-1">تاریخ و ساعت (شمسی)</label>
            {calReady ? (
              <DatePicker
                value={date}
                onChange={setDate}
                format={calendar ? "jYYYY/jMM/jDD HH:mm" : "YYYY/MM/DD HH:mm"}
                plugins={[<TimePicker position="bottom" key="tp" />]}
                calendar={calendar}
                locale={locale}
                editable
                calendarPosition="bottom-center"
                className="w-full"
                containerClassName="w-full"
                style={{ width: '100%' }}
              />
            ) : (
              <div className="border rounded px-3 py-2 text-gray-500">در حال بارگذاری تقویم شمسی...</div>
            )}
          </div>
          <div>
            <label className="block text-sm mb-1">بازرس‌ها</label>
            <MultiUserSelect value={assigned} onChange={setAssigned} />
          </div>
          <div>
            <label className="block text-sm mb-1">یادداشت</label>
            <input className="border rounded px-3 py-2 w-full" placeholder="یادداشت" value={notes} onChange={e=>setNotes(e.target.value)} />
          </div>
        </div>
        <div className="flex justify-end mt-2"><Button onClick={createInspection}>ثبت برنامه</Button></div>
      </div>

      {/* فقط همه بازرسی‌ها نمایش داده می‌شود */}
      <div className="border-b pb-2 text-sm text-gray-600">همه بازرسی‌ها</div>

      {loading ? (
        <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {grouped.map(([d, arr]) => (
            <div key={d} className="border rounded-xl bg-white shadow-sm">
              <div className="p-3 font-semibold bg-gray-50 rounded-t-xl flex items-center justify-between">
                <span>{new Date(d).toLocaleDateString('fa-IR')}</span>
                <span className="text-xs text-gray-500">{arr.length} مورد</span>
              </div>
              <ul className="divide-y">
                {arr.map(ev => (
                  <li key={ev.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <a href={`/dashboard/projects/${ev.project_id}`} className="font-medium text-blue-600 hover:underline">پروژه #{ev.project_id} - {ev.project?.type?.name}</a>
                      <span className={`text-xs px-2 py-1 rounded-full border ${ev.status==='scheduled'?'bg-yellow-50 text-yellow-700 border-yellow-200':ev.status==='in_progress'?'bg-blue-50 text-blue-700 border-blue-200':ev.status==='done'?'bg-green-50 text-green-700 border-green-200':'bg-gray-50 text-gray-600 border-gray-200'}`}>{ev.status}</span>
                    </div>
                    <div className="text-sm text-gray-600">ساعت: {new Date(ev.scheduled_at).toLocaleTimeString('fa-IR')}</div>
                    <div className="text-sm text-gray-600">
                      بازرس‌ها: {Array.isArray(ev.assigned_users) && ev.assigned_users.length
                        ? ev.assigned_users.map(u => `${u.name}${u.mobile ? ' - ' + u.mobile : ''}`).join('، ')
                        : '-'}
                    </div>
                    {ev.notes && <div className="text-sm text-gray-600">یادداشت: {ev.notes}</div>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MultiUserSelect({ value, onChange }) {
  const [selected, setSelected] = useState(value || []);
  useEffect(()=>{ setSelected(value||[]); }, [value]);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    (async () => {
      const res = await fetch('/api/users/getAll?limit=300', { credentials: 'include' });
      const json = await res.json();
      const list = Array.isArray(json?.data?.users) ? json.data.users : (Array.isArray(json?.data) ? json.data : (Array.isArray(json?.data?.rows) ? json.data.rows : []));
      setOptions(list.map(u => ({ value: u.id, label: `${u.firstName ? `${u.firstName} ${u.lastName || ''}`.trim() : (u.username || u.email || u.mobile || 'بدون نام')}${u.roles?.length ? ` - ${u.roles.map(r=>r.nameFa || r.name || r.nameEn).join('، ')}` : ''}` })));
    })();
  }, []);
  return (
    <Select
      isMulti
      classNamePrefix="rs"
      options={options}
      value={selected}
      onChange={(vals)=>{ setSelected(vals || []); onChange?.(vals || []); }}
      placeholder="جست‌وجو و انتخاب بازرس(ها)"
      noOptionsMessage={()=>'موردی یافت نشد'}
    />
  );
}

function ProjectSelect({ value, onChange, projects }) {
  const opts = useMemo(() => (projects||[]).map(p => ({
    value: p.id,
    label: `${p.type?.name || 'پروژه'} - ${p.client_name || ''} - ${(p.meta?.companyName)||''} - ${p.client_contact || ''}`
  })), [projects]);
  const selected = useMemo(() => opts.find(o => o.value === value?.value) || value, [opts, value]);
  return (
    <Select classNamePrefix="rs" options={opts} value={selected} onChange={onChange} placeholder="جست‌وجوی پروژه..." />
  );
}

