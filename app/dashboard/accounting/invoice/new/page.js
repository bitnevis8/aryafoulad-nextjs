"use client";
import { useEffect, useState } from 'react';
import UserSelect from '@/app/components/projects/UserSelect';
import PersianDatePicker from '@/app/components/ui/PersianDatePicker';
import Button from '@/app/components/ui/Button';

export default function NewInvoicePage() {
  const [customerId, setCustomerId] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [buyer, setBuyer] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [seller, setSeller] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/settings', { credentials: 'include' });
        const data = await res.json();
        if (data?.success) setSeller(data.data);
      } finally { setLoadingSeller(false); }
    })();
  }, []);

  const onCustomerChange = async (id) => {
    setCustomerId(id);
    if (!id) return;
    try {
      const res = await fetch(`/api/user/getOne?id=${id}`, { credentials: 'include' });
      const data = await res.json();
      const u = data?.data || data?.user || data;
      if (u) {
        setBuyer(prev => ({
          ...prev,
          buyer_legal_name: u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim(),
          buyer_phone: u.phone || u.mobile || prev.buyer_phone,
          buyer_fax: u.fax || prev.buyer_fax,
          buyer_address: u.address || prev.buyer_address,
          buyer_province: u.province || prev.buyer_province,
          buyer_city: u.city || prev.buyer_city,
          buyer_postal_code: u.postalCode || prev.buyer_postal_code,
          buyer_registration_number: u.registrationNumber || prev.buyer_registration_number,
          buyer_national_identifier: u.nationalId || prev.buyer_national_identifier,
          buyer_economic_code: u.economicCode || prev.buyer_economic_code,
        }));
      }
    } catch {}
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/accounting/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'invoice',
          customer_id: customerId || null,
          file_number: fileNumber || null,
          invoice_date: invoiceDate || null,
          buyer_fields: Object.keys(buyer).length ? buyer : undefined,
        })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard/accounting/invoices';
      } else {
        alert(data.message || 'خطا در ثبت فاکتور');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">صدور فاکتور</h1>

      {/* Seller Info Box */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-lg font-semibold mb-4">مشخصات فروشنده</h2>
        {loadingSeller ? (
          <div className="text-gray-500 text-sm">در حال بارگذاری...</div>
        ) : seller ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-sm"><span className="text-gray-500">نام شرکت:</span> <span className="font-medium">{seller.seller_name || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">نام حقوقی:</span> <span className="font-medium">{seller.seller_legal_name || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">تلفن:</span> <span className="font-medium">{seller.seller_phone || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">استان:</span> <span className="font-medium">{seller.seller_province || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">شهر:</span> <span className="font-medium">{seller.seller_city || '-'}</span></div>
            <div className="text-sm md:col-span-3"><span className="text-gray-500">نشانی:</span> <span className="font-medium">{seller.seller_address || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">شماره ثبت:</span> <span className="font-medium">{seller.seller_registration_number || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">شماره اقتصادی:</span> <span className="font-medium">{seller.seller_economic_code || '-'}</span></div>
            <div className="text-sm"><span className="text-gray-500">کد پستی:</span> <span className="font-medium">{seller.seller_postal_code || '-'}</span></div>
          </div>
        ) : (
          <div className="text-red-600 text-sm">تنظیمات فروشنده یافت نشد. لطفاً در تنظیمات حسابداری تکمیل کنید.</div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm mb-2">انتخاب مشتری (اختیاری)</label>
          <UserSelect value={customerId} onChange={onCustomerChange} placeholder="انتخاب مشتری" filterRole="customer" />
        </div>
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="شماره پرونده" value={fileNumber} onChange={e=>setFileNumber(e.target.value)} />
        <div className="md:max-w-sm">
          <label className="block text-sm mb-2">تاریخ</label>
          <PersianDatePicker value={invoiceDate} onChange={setInvoiceDate} />
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4">
        <h2 className="md:col-span-2 font-semibold">مشخصات خریدار (در صورت عدم انتخاب مشتری)</h2>
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="نام/عنوان" value={buyer.buyer_legal_name||''} onChange={e=>setBuyer({ ...buyer, buyer_legal_name: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="استان" value={buyer.buyer_province||''} onChange={e=>setBuyer({ ...buyer, buyer_province: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="شهر" value={buyer.buyer_city||''} onChange={e=>setBuyer({ ...buyer, buyer_city: e.target.value })} />
        <input className="md:col-span-3 border rounded-lg px-3 py-2" placeholder="نشانی" value={buyer.buyer_address||''} onChange={e=>setBuyer({ ...buyer, buyer_address: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="شماره ثبت" value={buyer.buyer_registration_number||''} onChange={e=>setBuyer({ ...buyer, buyer_registration_number: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="کد اقتصادی" value={buyer.buyer_economic_code||''} onChange={e=>setBuyer({ ...buyer, buyer_economic_code: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="کد پستی" value={buyer.buyer_postal_code||''} onChange={e=>setBuyer({ ...buyer, buyer_postal_code: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="شناسه ملی" value={buyer.buyer_national_identifier||''} onChange={e=>setBuyer({ ...buyer, buyer_national_identifier: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="تلفن" value={buyer.buyer_phone||''} onChange={e=>setBuyer({ ...buyer, buyer_phone: e.target.value })} />
        <input className="border rounded-lg px-3 py-2 md:max-w-sm" placeholder="نمابر" value={buyer.buyer_fax||''} onChange={e=>setBuyer({ ...buyer, buyer_fax: e.target.value })} />
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={submitting} className="bg-green-600 hover:bg-green-700">{submitting ? 'در حال ثبت...' : 'ثبت فاکتور'}</Button>
      </div>
    </div>
  );
}


