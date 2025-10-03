"use client";
import { useEffect, useState } from 'react';
import Button from '@/app/components/ui/Button';
import { API_ENDPOINTS } from '@/app/config/api';

export default function AccountingSettingsPage() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoVersion, setLogoVersion] = useState(0); // cache-buster for preview
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [signatureVersion, setSignatureVersion] = useState(0); // cache-buster for preview

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/settings', { credentials: 'include' });
        const data = await res.json();
        if (data?.data) setForm(data.data);
      } finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [svcRes, usersRes, banksRes] = await Promise.all([
          fetch('/api/accounting/services/getAll', { credentials: 'include' }),
          fetch('/api/users/getAll?limit=200', { credentials: 'include' }),
          fetch('/api/accounting/bank-accounts', { credentials: 'include' })
        ]);
        const svcData = await svcRes.json();
        const usersData = await usersRes.json();
        const banksData = await banksRes.json();
        if (svcData.success) setServices(Array.isArray(svcData.data) ? svcData.data : []);
        const flatUsers = Array.isArray(usersData?.data) ? usersData.data : (Array.isArray(usersData?.data?.users) ? usersData.data.users : usersData?.users || usersData?.rows || []);
        setUsers(flatUsers);
        if (banksData.success) setBankAccounts(Array.isArray(banksData.data) ? banksData.data : []);
      } catch {}
    })();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/accounting/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!data.success) alert(data.message || 'خطا در ذخیره تنظیمات');
    } finally { setSaving(false); }
  };

  const uploadLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) { alert('لطفاً یک فایل تصویری انتخاب کنید'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('حجم فایل نباید بیشتر از 5 مگابایت باشد'); return; }
    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);
      const res = await fetch(API_ENDPOINTS.logo.upload, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (data?.success) {
        setLogoVersion(prev => prev + 1);
      } else {
        alert(data?.message || 'خطا در آپلود لوگو');
      }
    } catch (err) {
      alert('خطا در آپلود لوگو');
      console.error('Logo upload error:', err);
    } finally {
      setUploadingLogo(false);
    }
  };

  const uploadSignature = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type?.startsWith('image/')) { alert('لطفاً یک فایل تصویری انتخاب کنید'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('حجم فایل نباید بیشتر از 5 مگابایت باشد'); return; }
    try {
      setUploadingSignature(true);
      const formData = new FormData();
      formData.append('signature', file);
      const res = await fetch(API_ENDPOINTS.companySignature.upload, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      const data = await res.json();
      if (data?.success) {
        setSignatureVersion(prev => prev + 1);
      } else {
        alert(data?.message || 'خطا در آپلود امضای شرکت');
      }
    } catch (err) {
      alert('خطا در آپلود امضای شرکت');
      console.error('Signature upload error:', err);
    } finally {
      setUploadingSignature(false);
    }
  };

  const editService = (index, updates) => {
    setServices(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));
  };
  const saveService = async (index) => {
    const s = services[index];
    const payload = { row_no: Number(s.row_no||0), code: s.code||'', name: s.name||'', description: s.description||'', responsible_user_id: s.responsible_user_id || null };
    const url = s.id && !String(s.id).startsWith('tmp_') ? `/api/accounting/services/update/${s.id}` : '/api/accounting/services/create';
    const method = s.id && !String(s.id).startsWith('tmp_') ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      setServices(prev => prev.map((row, i) => i === index ? data.data || row : row));
    } else {
      alert(data.message || 'خطا در ذخیره خدمت');
    }
  };
  const deleteService = async (index) => {
    const s = services[index];
    if (String(s.id).startsWith('tmp_')) { setServices(prev => prev.filter((_,i)=>i!==index)); return; }
    const res = await fetch(`/api/accounting/services/delete/${s.id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.success) setServices(prev => prev.filter((_,i)=>i!==index)); else alert(data.message || 'خطا در حذف');
  };

  const onChangeBool = (e) => setForm({ ...form, [e.target.name]: e.target.checked });

  const editBank = (index, updates) => {
    setBankAccounts(prev => prev.map((b, i) => i === index ? { ...b, ...updates } : b));
  };
  const saveBank = async (index) => {
    const b = bankAccounts[index];
    const payload = { bank_name: b.bank_name||'', account_number: b.account_number||'', iban: b.iban||'', holder_name: b.holder_name||'', is_active: b.is_active !== false };
    const url = b.id && !String(b.id).startsWith('tmp_') ? `/api/accounting/bank-accounts/update/${b.id}` : '/api/accounting/bank-accounts/create';
    const method = b.id && !String(b.id).startsWith('tmp_') ? 'PUT' : 'POST';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(payload) });
    const data = await res.json();
    if (data.success) {
      setBankAccounts(prev => prev.map((row, i) => i === index ? data.data || row : row));
    } else {
      alert(data.message || 'خطا در ذخیره حساب');
    }
  };
  const deleteBank = async (index) => {
    const b = bankAccounts[index];
    if (String(b.id).startsWith('tmp_')) { setBankAccounts(prev => prev.filter((_,i)=>i!==index)); return; }
    const res = await fetch(`/api/accounting/bank-accounts/delete/${b.id}`, { method: 'DELETE', credentials: 'include' });
    const data = await res.json();
    if (data.success) setBankAccounts(prev => prev.filter((_,i)=>i!==index)); else alert(data.message || 'خطا در حذف حساب');
  };

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">تنظیمات حسابداری</h1>

      {/* Company Logo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border">
        <h2 className="md:col-span-3 font-semibold">لوگوی شرکت</h2>
        <div className="flex items-center gap-6 md:col-span-3">
          <div className="w-40 h-40 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
            {/* Use cache-buster to reflect new uploads immediately */}
            <img
              src={`${API_ENDPOINTS.logo.download}?v=${logoVersion}`}
              alt="لوگوی شرکت"
              className="max-w-full max-h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm text-gray-600 mb-1">انتخاب فایل لوگو</label>
            <input type="file" accept="image/*" onChange={uploadLogo} className="border rounded-lg px-3 py-2" />
            {uploadingLogo && <span className="text-sm text-gray-500">در حال آپلود...</span>}
            <span className="text-xs text-gray-500">حداکثر حجم: ۵ مگابایت • فرمت‌های مجاز: JPG, PNG, GIF</span>
          </div>
        </div>
      </div>

      {/* Company Signature */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border">
        <h2 className="md:col-span-3 font-semibold">امضای شرکت</h2>
        <div className="flex items-center gap-6 md:col-span-3">
          <div className="w-40 h-40 border rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden">
            {/* Use cache-buster to reflect new uploads immediately */}
            <img
              src={`${API_ENDPOINTS.companySignature.download}?v=${signatureVersion}`}
              alt="امضای شرکت"
              className="max-w-full max-h-full object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="block text-sm text-gray-600 mb-1">انتخاب فایل امضا</label>
            <input type="file" accept="image/*" onChange={uploadSignature} className="border rounded-lg px-3 py-2" />
            {uploadingSignature && <span className="text-sm text-gray-500">در حال آپلود...</span>}
            <span className="text-xs text-gray-500">حداکثر حجم: ۵ مگابایت • فرمت‌های مجاز: JPG, PNG, GIF</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border">
        <h2 className="md:col-span-2 font-semibold">مشخصات فروشنده</h2>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">نام شرکت</label>
          <input name="seller_name" value={form.seller_name || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="نام شرکت" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">نام حقوقی</label>
          <input name="seller_legal_name" value={form.seller_legal_name || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="نام حقوقی" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">استان</label>
          <input name="seller_province" value={form.seller_province || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="استان" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">شهر</label>
          <input name="seller_city" value={form.seller_city || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="شهر" />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">نشانی</label>
          <input name="seller_address" value={form.seller_address || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="نشانی" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">شماره ثبت</label>
          <input name="seller_registration_number" value={form.seller_registration_number || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="شماره ثبت" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">کد پستی</label>
          <input name="seller_postal_code" value={form.seller_postal_code || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="کد پستی" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">شماره اقتصادی</label>
          <input name="seller_economic_code" value={form.seller_economic_code || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="شماره اقتصادی" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">تلفن</label>
          <input name="seller_phone" value={form.seller_phone || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="تلفن" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-xl border">
        <h2 className="md:col-span-2 font-semibold">شماره‌گذاری فاکتور/پیش‌فاکتور</h2>
        
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">سال شماره‌گذاری</label>
            <input name="file_number_prefix" value={form.file_number_prefix || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="1404" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">شروع شماره پیش‌فاکتور</label>
            <input name="proforma_start_number" type="number" value={form.proforma_start_number || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="1000" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">شروع شماره فاکتور</label>
            <input name="invoice_start_number" type="number" value={form.invoice_start_number || ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="1000" />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <input id="file_number_include_customer_id" name="file_number_include_customer_id" type="checkbox" checked={!!form.file_number_include_customer_id} onChange={onChangeBool} />
          <label htmlFor="file_number_include_customer_id" className="text-sm">افزودن شناسه مشتری در شماره</label>
        </div>
        
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">آخرین ایندکس شماره</label>
            <input name="file_number_last_index" type="number" value={form.file_number_last_index ?? ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="0" />
          </div>
          <div className="md:col-span-2 text-xs text-gray-500 flex items-end">
            <div>
              <div>مثال: 1404-123-1</div>
              <div className="text-red-500 mt-1">فرمت: سال-شناسه مشتری-شماره فاکتور</div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <button 
            type="button"
            onClick={async () => {
              if (confirm('آیا مطمئن هستید که می‌خواهید شماره‌گذاری را صفر کنید؟ این کار برای شروع سال جدید است.')) {
                try {
                  const res = await fetch('/api/accounting/settings/reset-numbering', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                  });
                  const data = await res.json();
                  if (res.ok && data.success) {
                    setForm(prev => ({ ...prev, file_number_last_index: 0, proforma_start_number: 1000, invoice_start_number: 1000 }));
                    alert('شماره‌گذاری صفر شد');
                  } else {
                    alert(data.message || 'خطا در صفر کردن شماره‌گذاری');
                  }
                } catch (e) {
                  alert('خطا در صفر کردن شماره‌گذاری');
                }
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            صفر کردن شماره‌گذاری (شروع سال جدید)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-6 rounded-xl border">
        <h2 className="md:col-span-3 font-semibold">مالیات و عوارض</h2>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">درصد مالیات (%)</label>
          <input name="tax_percent" type="number" step="0.01" value={form.tax_percent ?? ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="مثلاً 9" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">درصد عوارض (%)</label>
          <input name="duties_percent" type="number" step="0.01" value={form.duties_percent ?? ''} onChange={onChange} className="border rounded-lg px-3 py-2 w-full" placeholder="مثلاً 3" />
        </div>
        
        <div className="md:col-span-3">
          <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="font-semibold mb-1">راهنما:</div>
            <div>• درصد مالیات: معمولاً 9% برای ارزش افزوده</div>
            <div>• درصد عوارض: معمولاً 3% برای عوارض شهرداری</div>
            <div>• این مقادیر به صورت پیش‌فرض در فاکتورها استفاده می‌شوند</div>
          </div>
        </div>
      </div>

      {/* Services Management */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">خدمات/کالاها</h2>
          <Button onClick={() => setServices(prev => [...prev, { id: `tmp_${Date.now()}`, row_no: (prev.at(-1)?.row_no || 0) + 1, code: '', name: '', description: '', responsible_user_id: null }])}>افزودن رکورد</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right">ردیف</th>
                <th className="p-2 text-right">کد خدمت</th>
                <th className="p-2 text-right">نام خدمت</th>
                <th className="p-2 text-right">شرح خدمت</th>
                <th className="p-2 text-right">خانم مسئول (ستادی)</th>
                <th className="p-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s, idx) => (
                <tr key={s.id || `row_${idx}`} className="border-t">
                  <td className="p-2 w-20">
                    <input className="border rounded px-2 py-1 w-20" value={s.row_no||''} onChange={e=>editService(idx, { row_no: Number(e.target.value||0) })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-40" value={s.code||''} onChange={e=>editService(idx, { code: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-56" value={s.name||''} onChange={e=>editService(idx, { name: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-[28rem]" value={s.description||''} onChange={e=>editService(idx, { description: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <select className="border rounded px-2 py-1 w-56" value={s.responsible_user_id || ''} onChange={e=>editService(idx, { responsible_user_id: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">— انتخاب —</option>
                      {users.filter(u=>Array.isArray(u.roles) && u.roles.some(r => r.name === 'staff')).map(u => (
                        <option key={u.id} value={u.id}>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || u.email}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button onClick={()=>saveService(idx)} className="bg-blue-600 hover:bg-blue-700">ذخیره</Button>
                      <Button onClick={()=>deleteService(idx)} className="bg-red-600 hover:bg-red-700">حذف</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">رکوردی یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bank Accounts Management */}
      <div className="bg-white p-6 rounded-xl border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">حساب‌های بانکی</h2>
          <Button onClick={() => setBankAccounts(prev => [...prev, { id: `tmp_${Date.now()}`, bank_name: '', account_number: '', iban: '', holder_name: '', is_active: true }])}>افزودن حساب</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-right">نام بانک</th>
                <th className="p-2 text-right">شماره حساب</th>
                <th className="p-2 text-right">شبا</th>
                <th className="p-2 text-right">صاحب حساب</th>
                <th className="p-2 text-right">فعال</th>
                <th className="p-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {bankAccounts.map((b, idx) => (
                <tr key={b.id || `bank_${idx}`} className="border-t">
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-40" value={b.bank_name||''} onChange={e=>editBank(idx, { bank_name: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-48" value={b.account_number||''} onChange={e=>editBank(idx, { account_number: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-[24rem]" value={b.iban||''} onChange={e=>editBank(idx, { iban: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input className="border rounded px-2 py-1 w-48" value={b.holder_name||''} onChange={e=>editBank(idx, { holder_name: e.target.value })} />
                  </td>
                  <td className="p-2">
                    <input type="checkbox" checked={!!b.is_active} onChange={e=>editBank(idx, { is_active: e.target.checked })} />
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <Button onClick={()=>saveBank(idx)} className="bg-blue-600 hover:bg-blue-700">ذخیره</Button>
                      <Button onClick={()=>deleteBank(idx)} className="bg-red-600 hover:bg-red-700">حذف</Button>
                    </div>
                  </td>
                </tr>
              ))}
              {bankAccounts.length === 0 && (
                <tr><td colSpan={6} className="p-4 text-center text-gray-500">رکوردی یافت نشد</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700">{saving ? 'در حال ذخیره...' : 'ذخیره تنظیمات'}</Button>
      </div>
    </div>
  );
}


