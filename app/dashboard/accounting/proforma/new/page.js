"use client";
import { useEffect, useState } from 'react';
import UserSelect from '@/app/components/projects/UserSelect';
import PersianDatePicker from '@/app/components/ui/PersianDatePicker';
import Button from '@/app/components/ui/Button';

export default function NewProformaPage() {
  const [customerId, setCustomerId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [buyer, setBuyer] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [seller, setSeller] = useState(null);
  const [loadingSeller, setLoadingSeller] = useState(true);
  const [items, setItems] = useState([]);
  const [taxPercentOverride, setTaxPercentOverride] = useState('');
  const [dutiesPercentOverride, setDutiesPercentOverride] = useState('');
  const [travelCost, setTravelCost] = useState('');
  const [services, setServices] = useState([]);
  const [description, setDescription] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [bankAccounts, setBankAccounts] = useState([]);

  const updateItem = (index, updates) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...updates } : it));
  };
  const removeItem = (index) => setItems(prev => prev.filter((_, i) => i !== index));
  const exportCSV = () => {
    const header = ['ItemDescription','Quantity','Unit','UnitPrice','TotalItemPrice','Discount','DiscountType','AfterDiscount'];
    const rows = items.map(it => {
      const qty = Number(it.quantity || 0);
      const unitPrice = Number(it.unitPrice || 0);
      const total = qty * unitPrice;
      const discountValue = it.discountType === 'percent' ? Math.round((Number(it.discount || 0)/100)*total) : Number(it.discount || 0);
      const afterDiscount = Math.max(total - discountValue, 0);
      return [
        (it.description||'').replace(/\n/g,' '),
        qty,
        it.unit||'',
        unitPrice,
        total,
        it.discount||0,
        it.discountType||'fixed',
        afterDiscount
      ];
    });
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'items.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/settings', { credentials: 'include' });
        const data = await res.json();
        if (data?.success) {
          setSeller(data.data);
        }
      } finally {
        setLoadingSeller(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/services/getAll', { credentials: 'include' });
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) setServices(data.data);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/bank-accounts', { credentials: 'include' });
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setBankAccounts(data.data);
        }
      } catch (error) {
        console.error('Error fetching bank accounts:', error);
      }
    })();
  }, []);

  const onCustomerChange = async (id) => {
    setCustomerId(id);
    
    
    if (!id) return;
    try {
      console.log('Fetching customer data for ID:', id);
      const res = await fetch(`/api/user/getOne?id=${id}`, { credentials: 'include' });
      const data = await res.json();
      console.log('Customer data response:', data);
      
      const u = data?.data || data?.user || data;
      if (u) {
        console.log('Setting buyer data:', u);
        // تعیین نام بر اساس نوع مشتری
        let customerName = '';
        if (u.type === 'company' && u.companyName) {
          // مشتری حقوقی: نام شرکت
          customerName = u.companyName;
        } else if (u.type === 'person') {
          // مشتری حقیقی: نام + نام خانوادگی
          customerName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
        } else {
          // fallback: اگر نوع مشخص نیست، هر کدام که موجود باشد
          customerName = u.companyName || `${u.firstName || ''} ${u.lastName || ''}`.trim();
        }

        setBuyer(prev => ({
          ...prev,
          buyer_legal_name: customerName,
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
      } else {
        console.error('No user data found in response:', data);
        alert('خطا در دریافت اطلاعات مشتری');
      }
    } catch (error) {
      console.error('Error fetching customer data:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch('/api/accounting/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          type: 'proforma',
          customer_id: customerId || null,
          invoice_date: invoiceDate || null,
          buyer_fields: Object.keys(buyer).length ? buyer : undefined,
          items,
          tax_percent: taxPercentOverride !== '' ? Number(taxPercentOverride) : (seller?.tax_percent ?? 0),
          duties_percent: dutiesPercentOverride !== '' ? Number(dutiesPercentOverride) : (seller?.duties_percent ?? 0),
          travel_cost: travelCost !== '' ? Number(travelCost) : 0,
          description: description || null,
          selected_account_id: selectedAccountId || null,
        })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard/accounting/invoices';
      } else {
        alert(data.message || 'خطا در ثبت پیش‌فاکتور');
      }
    } finally { setSubmitting(false); }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">صدور پیش‌فاکتور</h1>

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

      <div className="bg-white p-6 rounded-xl border grid grid-cols-1 md:grid-cols-3 gap-4">
        <h2 className="md:col-span-3 font-semibold">مشخصات خریدار</h2>
        
        <div className="md:col-span-3">
          <label className="block text-sm mb-2">انتخاب مشتری (اختیاری)</label>
          <UserSelect value={customerId} onChange={onCustomerChange} placeholder="انتخاب مشتری" filterRole="customer" />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">نام/عنوان</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="نام/عنوان" value={buyer.buyer_legal_name||''} onChange={e=>setBuyer({ ...buyer, buyer_legal_name: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">استان</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="استان" value={buyer.buyer_province||''} onChange={e=>setBuyer({ ...buyer, buyer_province: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">شهر</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="شهر" value={buyer.buyer_city||''} onChange={e=>setBuyer({ ...buyer, buyer_city: e.target.value })} />
        </div>
        <div className="md:col-span-3">
          <label className="block text-sm text-gray-600 mb-1">نشانی</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="نشانی" value={buyer.buyer_address||''} onChange={e=>setBuyer({ ...buyer, buyer_address: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">شماره ثبت</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="شماره ثبت" value={buyer.buyer_registration_number||''} onChange={e=>setBuyer({ ...buyer, buyer_registration_number: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">کد اقتصادی</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="کد اقتصادی" value={buyer.buyer_economic_code||''} onChange={e=>setBuyer({ ...buyer, buyer_economic_code: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">کد پستی</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="کد پستی" value={buyer.buyer_postal_code||''} onChange={e=>setBuyer({ ...buyer, buyer_postal_code: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">شناسه ملی</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="شناسه ملی" value={buyer.buyer_national_identifier||''} onChange={e=>setBuyer({ ...buyer, buyer_national_identifier: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">تلفن</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="تلفن" value={buyer.buyer_phone||''} onChange={e=>setBuyer({ ...buyer, buyer_phone: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">نمابر</label>
          <input className="border rounded-lg px-3 py-2 w-full" placeholder="نمابر" value={buyer.buyer_fax||''} onChange={e=>setBuyer({ ...buyer, buyer_fax: e.target.value })} />
        </div>
        
        <div className="md:col-span-3 border-t pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-2">انتخاب حساب بانکی</label>
              <select 
                className="border rounded-lg px-3 py-2 w-full" 
                value={selectedAccountId} 
                onChange={e => setSelectedAccountId(e.target.value)}
              >
                <option value="">انتخاب حساب بانکی</option>
                {bankAccounts.length > 0 ? (
                  bankAccounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.bank_name} - {account.account_number} - کد {account.bank_code}
                    </option>
                  ))
                ) : (
                  <option disabled>در حال بارگذاری...</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-2">تاریخ</label>
              <PersianDatePicker value={invoiceDate} onChange={setInvoiceDate} />
            </div>
          </div>
        </div>
      </div>

      {/* Goods/Services Items */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-lg font-semibold mb-4">مشخصات کالا یا خدمات</h2>
        <div className="space-y-4">
          {items.map((it, idx) => {
            const qty = Number(it.quantity || 0);
            const unitPrice = Number(it.unitPrice || 0);
            const total = qty * unitPrice;
            const discountValue = it.discountType === 'percent'
              ? Math.round((Number(it.discount || 0) / 100) * total)
              : Number(it.discount || 0);
            const afterDiscount = Math.max(total - discountValue, 0);
            return (
              <div key={idx} className="border rounded-lg p-3">
                <div className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-12 md:col-span-3">
                    <label className="block text-sm mb-1">انتخاب از لیست خدمات</label>
                    <select
                      className="border rounded px-3 py-2 w-full"
                      value={''}
                      onChange={e=>{
                        const svcId = Number(e.target.value || 0);
                        const svc = services.find(s => s.id === svcId);
                        if (svc) {
                          const text = `${svc.code || ''} - ${svc.description || svc.name || ''}`.trim();
                          updateItem(idx, { description: text });
                        }
                      }}
                    >
                      <option value="">انتخاب از لیست خدمات…</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{`${s.code || ''} - ${s.name || ''}`}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-12 md:col-span-9">
                    <label className="block text-sm mb-1">شرح</label>
                    <input className="border rounded px-3 py-2 w-full" placeholder="شرح کالا/خدمات" value={it.description||''} onChange={e=>updateItem(idx, { description: e.target.value })} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm mb-1">مقدار</label>
                    <input type="number" className="border rounded px-3 py-2 w-full" placeholder="مثال: 1" value={it.quantity||''} onChange={e=>updateItem(idx, { quantity: e.target.value })} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm mb-1">واحد</label>
                    <input className="border rounded px-3 py-2 w-full" placeholder="مثال: عدد، متر" value={it.unit||''} onChange={e=>updateItem(idx, { unit: e.target.value })} />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm mb-1">مبلغ واحد (ریال)</label>
                    <input type="number" className="border rounded px-3 py-2 w-full" placeholder="0" value={it.unitPrice||''} onChange={e=>updateItem(idx, { unitPrice: e.target.value })} />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm mb-1">مبلغ کل (ریال)</label>
                    <div className="border rounded px-3 py-2 bg-gray-50">{total.toLocaleString('fa-IR')}</div>
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm mb-1">تخفیف</label>
                    <input type="number" className="border rounded px-3 py-2 w-full" placeholder="0" value={it.discount||''} onChange={e=>updateItem(idx, { discount: e.target.value })} />
                  </div>
                  <div className="col-span-6 md:col-span-2">
                    <label className="block text-sm mb-1">نوع تخفیف</label>
                    <select className="border rounded px-3 py-2 w-full" value={it.discountType||'fixed'} onChange={e=>updateItem(idx, { discountType: e.target.value })}>
                      <option value="fixed">ریال</option>
                      <option value="percent">%</option>
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label className="block text-sm mb-1">پس از تخفیف</label>
                    <div className="border rounded px-3 py-2 bg-gray-50">{afterDiscount.toLocaleString('fa-IR')}</div>
                  </div>
                  <div className="col-span-6 md:col-span-2 md:col-start-12 text-left md:text-right">
                    <button className="text-red-600" onClick={()=>removeItem(idx)}>حذف</button>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="p-4 text-center text-gray-500">رکوردی اضافه نشده است</div>
          )}
        </div>
        <div className="mt-3">
          <button className="px-3 py-2 rounded bg-blue-600 text-white" onClick={()=>setItems(prev=>[...prev, { description:'', quantity:'', unit:'', unitPrice:'', discount:'', discountType:'fixed' }])}>افزودن ردیف</button>
          <button className="ml-2 px-3 py-2 rounded border" onClick={exportCSV}>Export to Sheets</button>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-6">
          <div>
            <label className="block text-sm text-gray-600 mb-1">ایاب و ذهاب</label>
            <input type="number" className="border rounded px-3 py-2 w-full" value={travelCost} onChange={e=>setTravelCost(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">مالیات (%)</label>
            <input type="number" step="0.01" className="border rounded px-3 py-2 w-full" value={taxPercentOverride} onChange={e=>setTaxPercentOverride(e.target.value)} placeholder={seller?.tax_percent?.toString()||''} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">عوارض (%)</label>
            <input type="number" step="0.01" className="border rounded px-3 py-2 w-full" value={dutiesPercentOverride} onChange={e=>setDutiesPercentOverride(e.target.value)} placeholder={seller?.duties_percent?.toString()||''} />
          </div>

          {(() => {
            const totals = computeTotals(items, travelCost, taxPercentOverride !== '' ? Number(taxPercentOverride) : (seller?.tax_percent ?? 0), dutiesPercentOverride !== '' ? Number(dutiesPercentOverride) : (seller?.duties_percent ?? 0));
            return (
              <div className="bg-gray-50 border rounded p-3 text-sm">
                <div className="flex justify-between"><span>جمع جزء:</span><span>{totals.subtotal.toLocaleString('fa-IR')}</span></div>
                <div className="flex justify-between"><span>تخفیف کل:</span><span>{totals.totalDiscount.toLocaleString('fa-IR')}</span></div>
                <div className="flex justify-between"><span>پس از تخفیف:</span><span>{totals.afterDiscount.toLocaleString('fa-IR')}</span></div>
                <div className="flex justify-between"><span>ایاب و ذهاب:</span><span>{totals.travelCost.toLocaleString('fa-IR')}</span></div>
                <div className="flex justify-between"><span>مالیات:</span><span>{totals.taxAmount.toLocaleString('fa-IR')}</span></div>
                <div className="flex justify-between"><span>عوارض:</span><span>{totals.dutiesAmount.toLocaleString('fa-IR')}</span></div>
                <div className="flex justify-between font-semibold"><span>جمع کل:</span><span>{totals.grandTotal.toLocaleString('fa-IR')}</span></div>
              </div>
            );
          })()}
        </div>
      </div>



      {/* Description Section */}
      <div className="bg-white p-6 rounded-xl border">
        <h2 className="text-lg font-semibold mb-4">توضیحات</h2>
        <div>
          <label className="block text-sm text-gray-600 mb-1">توضیحات اضافی</label>
          <textarea 
            className="border rounded-lg px-3 py-2 w-full h-24" 
            placeholder="توضیحات اضافی برای این پیش‌فاکتور..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={submitting} className="bg-blue-600 hover:bg-blue-700">{submitting ? 'در حال ثبت...' : 'ثبت پیش‌فاکتور'}</Button>
      </div>
    </div>
  );
}

function updateItemFactory(items, setItems) {
  return (index, updates) => {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, ...updates } : it));
  };
}

function removeItemFactory(items, setItems) {
  return (index) => setItems(prev => prev.filter((_, i) => i !== index));
}

function computeTotals(items, travelCost, taxPercent, dutiesPercent) {
  const numeric = (v) => Number(v || 0);
  let subtotal = 0;
  let totalDiscount = 0;
  for (const it of items) {
    const rowTotal = numeric(it.quantity) * numeric(it.unitPrice);
    const disc = (it.discountType === 'percent') ? Math.round((numeric(it.discount) / 100) * rowTotal) : numeric(it.discount);
    subtotal += rowTotal;
    totalDiscount += disc;
  }
  const afterDiscount = Math.max(subtotal - totalDiscount, 0);
  const travel = numeric(travelCost);
  const taxAmount = Math.round((taxPercent / 100) * afterDiscount);
  const dutiesAmount = Math.round((dutiesPercent / 100) * afterDiscount);
  const grandTotal = afterDiscount + travel + taxAmount + dutiesAmount;
  return { subtotal, totalDiscount, afterDiscount, travelCost: travel, taxAmount, dutiesAmount, grandTotal };
}

function exportCSVFactory(items) {
  return () => {
    const header = ['ItemDescription','Quantity','Unit','UnitPrice','TotalItemPrice','Discount','DiscountType','AfterDiscount'];
    const rows = items.map(it => {
      const qty = Number(it.quantity || 0);
      const unitPrice = Number(it.unitPrice || 0);
      const total = qty * unitPrice;
      const discountValue = it.discountType === 'percent' ? Math.round((Number(it.discount || 0)/100)*total) : Number(it.discount || 0);
      const afterDiscount = Math.max(total - discountValue, 0);
      return [
        (it.description||'').replace(/\n/g,' '),
        qty,
        it.unit||'',
        unitPrice,
        total,
        it.discount||0,
        it.discountType||'fixed',
        afterDiscount
      ];
    });
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'items.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
}



