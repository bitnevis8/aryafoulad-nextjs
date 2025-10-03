"use client";
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { API_ENDPOINTS } from '@/app/config/api';

export default function InvoiceViewPage({ params }) {
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [invoice, setInvoice] = useState(null);
  const [seller, setSeller] = useState(null);
  const [error, setError] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [invoiceRes, sellerRes] = await Promise.all([
          fetch(`/api/accounting/invoices/getOne/${id}`, { credentials: 'include' }),
          fetch('/api/accounting/settings', { credentials: 'include' })
        ]);
        
        const invoiceData = await invoiceRes.json();
        const sellerData = await sellerRes.json();
        
        if (invoiceData?.success) {
          setInvoice(invoiceData.data);
          
          // Load selected bank account if exists
          if (invoiceData.data.selected_account_id) {
            try {
              const accountRes = await fetch(`/api/accounting/bank-accounts/${invoiceData.data.selected_account_id}`, { credentials: 'include' });
              const accountData = await accountRes.json();
              if (accountData?.success) setSelectedAccount(accountData.data);
            } catch {}
          }
        } else {
          setError(invoiceData?.message || 'خطا در دریافت فاکتور');
        }
        
        if (sellerData?.success) setSeller(sellerData.data);
      } catch (e) {
        setError('خطا در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toPersianDate = (iso) => {
    try { return iso ? new Date(iso).toLocaleDateString('fa-IR') : ''; } catch { return ''; }
  };

  // تابع تبدیل اعداد انگلیسی به فارسی
  const toPersianNumbers = (str) => {
    if (!str) return '';
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return str.toString().replace(/[0-9]/g, (digit) => persianDigits[parseInt(digit)]);
  };

  // تابع برای تغییر ترتیب شماره فاکتور
  const formatInvoiceNumber = (invoiceNumber) => {
    if (!invoiceNumber) return invoiceNumber;
    
    // اگر شماره فاکتور به فرمت year-customerId-invoiceNumber است
    const parts = invoiceNumber.toString().split('-');
    if (parts.length === 3) {
      // تغییر ترتیب به invoiceNumber-customerId-year
      const [year, customerId, invoiceNum] = parts;
      return `${invoiceNum}-${customerId}-${year}`;
    }
    
    return invoiceNumber;
  };

  const computeTotals = (items, travelCost, taxPercent, dutiesPercent) => {
    const numeric = (v) => Number(v || 0);
    let subtotal = 0;
    let totalDiscount = 0;
    for (const it of items || []) {
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
  };

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!invoice) return <div className="p-6">یافت نشد</div>;

  const totals = computeTotals(
    invoice.items || [], 
    invoice.travel_cost || 0, 
    invoice.tax_percent || 0, 
    invoice.duties_percent || 0
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مشاهده {invoice.type === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور'} #{invoice.id}</h1>
        <div className="flex gap-2">
          <Link className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white" href={`/dashboard/accounting/invoices/${invoice.id}/edit`}>ویرایش</Link>
           <button 
             className="px-3 py-1 rounded bg-green-600 hover:bg-green-700 text-white cursor-pointer" 
             onClick={() => {
               const timestamp = Date.now();
               const randomId = Math.random().toString(36).substring(7);
               // Auto-detect environment
               const isDevelopment = window.location.hostname === 'localhost';
               const baseUrl = isDevelopment 
                 ? 'http://localhost:3000' 
                 : 'https://aryafoulad-api.pourdian.com';
               const url = `${baseUrl}/accounting/invoices/download-word-test/${invoice.id}?v=${timestamp}&r=${randomId}`;
               
               // Open in new window to download file
               window.open(url, '_blank');
             }}
           >
             دانلود ورد
           </button>
        </div>
      </div>

      {/* Invoice Document - A4 Landscape */}
      <div className="bg-white border rounded-lg p-6 mx-auto" style={{ width: '297mm', minHeight: '210mm', maxWidth: '100%' }}>
        {/* Header Row - All Centered */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Logo */}
          <div className="flex-shrink-0 mr-2">
            <img 
              src={`${API_ENDPOINTS.logo.download}?v=${Date.now()}`}
              alt="لوگوی شرکت"
              className="max-w-28 max-h-28 object-contain"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
          
          {/* Main Content - Centered */}
          <div className="text-center flex-1">
            <div className="text-base font-bold mb-1">بسمه تعالی</div>
            <div className="text-lg font-bold mb-1">{seller?.seller_name || 'شرکت آریا فولاد قرن'}</div>
            <div className="text-base font-semibold">صورتحساب فروش کالا و خدمات</div>
          </div>
          
          {/* Invoice Info - Left */}
          <div className="text-left flex-shrink-0 ml-4">
            <div className="text-sm mb-1">شماره: {toPersianNumbers(formatInvoiceNumber(invoice.number || invoice.id))}</div>
            <div className="text-sm mb-1">تاریخ: {toPersianDate(invoice.invoice_date)}</div>
          </div>
        </div>

        {/* Seller & Buyer Info */}
        <div className="space-y-4 mb-4">
          {/* Seller Info - Full Row */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold mb-3 text-center text-sm text-gray-800 bg-white py-2 rounded border">مشخصات فروشنده</h3>
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-gray-700">نام شرکت:</span> <span className="mr-2">{seller?.seller_name || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> تلفن:</span> <span className="mr-2">{toPersianNumbers(seller?.seller_phone || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> فکس:</span> <span className="mr-2">{toPersianNumbers(seller?.seller_fax || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شماره ثبت:</span> <span className="mr-2">{toPersianNumbers(seller?.seller_registration_number || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شماره اقتصادی:</span> <span className="mr-2">{toPersianNumbers(seller?.seller_economic_code || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شناسه ملی:</span> <span className="mr-2">{toPersianNumbers(seller?.seller_national_identifier || '-')}</span>
            </div>
            <div className="text-xs leading-relaxed mt-2 pt-2 border-t border-gray-300">
              <span className="font-semibold text-gray-700">نشانی:</span> <span className="mr-2">{seller?.seller_address || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> استان:</span> <span className="mr-2">{seller?.seller_province || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شهرستان:</span> <span className="mr-2">{seller?.seller_city || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> کد پستی:</span> <span className="mr-2">{toPersianNumbers(seller?.seller_postal_code || '-')}</span>
            </div>
          </div>

          {/* Buyer Info - Full Row */}
          <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
            <h3 className="font-bold mb-3 text-center text-sm text-gray-800 bg-white py-2 rounded border">مشخصات خریدار</h3>
            <div className="text-xs leading-relaxed">
              <span className="font-semibold text-gray-700">نام/عنوان:</span> <span className="mr-2">{invoice.buyer_legal_name || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> تلفن:</span> <span className="mr-2">{toPersianNumbers(invoice.buyer_phone || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> فکس:</span> <span className="mr-2">{toPersianNumbers(invoice.buyer_fax || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شماره ثبت:</span> <span className="mr-2">{toPersianNumbers(invoice.buyer_registration_number || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شماره اقتصادی:</span> <span className="mr-2">{toPersianNumbers(invoice.buyer_economic_code || '-')}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شناسه ملی:</span> <span className="mr-2">{toPersianNumbers(invoice.buyer_national_identifier || '-')}</span>
            </div>
            <div className="text-xs leading-relaxed mt-2 pt-2 border-t border-gray-300">
              <span className="font-semibold text-gray-700">نشانی:</span> <span className="mr-2">{invoice.buyer_address || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> استان:</span> <span className="mr-2">{invoice.buyer_province || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> شهرستان:</span> <span className="mr-2">{invoice.buyer_city || '-'}</span> | 
              <span className="font-semibold text-gray-700 mr-1"> کد پستی:</span> <span className="mr-2">{toPersianNumbers(invoice.buyer_postal_code || '-')}</span>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-4">
          <h3 className="font-bold mb-3 text-center text-sm text-gray-800 bg-gray-100 py-2 rounded border">مشخصات کالا یا خدمات</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border-2 border-gray-400 text-xs">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">ردیف</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">شرح کالا یا خدمات</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">مقدار</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">واحد</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">مبلغ واحد (ریال)</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">مبلغ کل (ریال)</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">مبلغ تخفیف</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">مبلغ کل پس از تخفیف</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">ایاب و ذهاب</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">جمع مالیات و عوارض (ریال)</th>
                  <th className="border-2 border-gray-400 p-2 text-right font-bold">جمع مبلغ کل (ریال)</th>
                </tr>
              </thead>
              <tbody>
                {(invoice.items || []).map((item, index) => {
                  const qty = Number(item.quantity || 0);
                  const unitPrice = Number(item.unitPrice || 0);
                  const total = qty * unitPrice;
                  const discountValue = item.discountType === 'percent'
                    ? Math.round((Number(item.discount || 0) / 100) * total)
                    : Number(item.discount || 0);
                  const afterDiscount = Math.max(total - discountValue, 0);
                  
                  // محاسبه مالیات و عوارض برای هر آیتم
                  const itemTaxAmount = Math.round((afterDiscount * (invoice.tax_percent || 0)) / 100);
                  const itemDutiesAmount = Math.round((afterDiscount * (invoice.duties_percent || 0)) / 100);
                  
                  // ایاب و ذهاب برای هر آیتم (تقسیم مساوی)
                  const itemTravelCost = invoice.items && invoice.items.length > 0 
                    ? Math.round((Number(invoice.travel_cost || 0)) / invoice.items.length)
                    : 0;
                  
                  // جمع مالیات و عوارض
                  const totalTaxAndDuties = itemTaxAmount + itemDutiesAmount;
                  
                  // جمع کل برای هر آیتم
                  const itemGrandTotal = afterDiscount + itemTravelCost + totalTaxAndDuties;

                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border-2 border-gray-400 p-2 text-center font-medium">{toPersianNumbers(index + 1)}</td>
                      <td className="border-2 border-gray-400 p-2 pr-3">{item.description || '-'}</td>
                      <td className="border-2 border-gray-400 p-2 text-center font-medium">{toPersianNumbers(qty)}</td>
                      <td className="border-2 border-gray-400 p-2 text-center">{item.unit || '-'}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-medium">{unitPrice.toLocaleString('fa-IR')}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-medium">{total.toLocaleString('fa-IR')}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-medium text-red-600">{discountValue.toLocaleString('fa-IR')}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-medium">{afterDiscount.toLocaleString('fa-IR')}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-medium">{itemTravelCost.toLocaleString('fa-IR')}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-medium">{totalTaxAndDuties.toLocaleString('fa-IR')}</td>
                      <td className="border-2 border-gray-400 p-2 text-left font-bold text-green-700">{itemGrandTotal.toLocaleString('fa-IR')}</td>
                    </tr>
                  );
                })}
                {(!invoice.items || invoice.items.length === 0) && (
                  <tr>
                    <td colSpan={11} className="border-2 border-gray-400 p-3 text-center text-gray-500 font-medium">
                      آیتمی ثبت نشده است
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Left (Description & Payment) + Right (Totals) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Left Side: Description and Payment Info */}
          <div className="space-y-4">
            {/* Description Box */}
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-2 text-center text-sm">توضیحات</h3>
              <div className="text-xs leading-relaxed">
                {invoice.description || 'توضیحاتی ثبت نشده است'}
              </div>
            </div>
            
            {/* Payment Info Box */}
            <div className="border rounded p-3">
              <h3 className="font-semibold mb-2 text-center text-sm">اطلاعات پرداخت</h3>
              <div className="text-xs leading-relaxed">
                {selectedAccount ? (
                  <>
                    لطفا مبلغ فوق را به شماره حساب جاری {toPersianNumbers(selectedAccount.account_number)} بانک {selectedAccount.bank_name} به کد {toPersianNumbers(selectedAccount.bank_code || '***')} بنام شرکت {seller?.seller_name || 'آریا فولاد قرن'} و یا با شماره شبا {toPersianNumbers(selectedAccount.iban || '****')} واریز نمایید.
                  </>
                ) : (
                  'حساب بانکی انتخاب نشده است'
                )}
              </div>
            </div>
          </div>

          {/* Right Side: Totals */}
          <div>
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded border">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">جمع جزء:</span>
                <span className="font-medium mr-2">{totals.subtotal.toLocaleString('fa-IR')} ریال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">تخفیف کل:</span>
                <span className="font-medium mr-2 text-red-600">{totals.totalDiscount.toLocaleString('fa-IR')} ریال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">پس از تخفیف:</span>
                <span className="font-medium mr-2">{totals.afterDiscount.toLocaleString('fa-IR')} ریال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">ایاب و ذهاب:</span>
                <span className="font-medium mr-2">{totals.travelCost.toLocaleString('fa-IR')} ریال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">مالیات ({toPersianNumbers(invoice.tax_percent || 0)}%):</span>
                <span className="font-medium mr-2">{totals.taxAmount.toLocaleString('fa-IR')} ریال</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-700">عوارض ({toPersianNumbers(invoice.duties_percent || 0)}%):</span>
                <span className="font-medium mr-2">{totals.dutiesAmount.toLocaleString('fa-IR')} ریال</span>
              </div>
            </div>
            <div className="text-center mt-4">
              <div className="text-base font-bold border-3 border-blue-500 bg-blue-50 p-4 rounded-lg shadow-md">
                <div className="text-gray-800 mb-2">جمع کل قابل پرداخت:</div>
                <div className="text-xl mt-1 text-blue-700 font-extrabold">{totals.grandTotal.toLocaleString('fa-IR')} ریال</div>
              </div>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="text-center">
            <div className="flex flex-col items-center">
              <div className="w-32 h-16 mb-2 flex items-center justify-center">
                <img
                  src={`/api/company-signature/download?v=${Date.now()}`}
                  alt="امضای شرکت"
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div className="border-t border-gray-400 pt-2 w-full">
                <div className="text-xs font-medium">امضا و مهر شرکت</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="border-t border-gray-400 pt-2 mt-16">
              <div className="text-xs font-medium">امضا مشتری</div>
            </div>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link className="inline-block px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white" href="/dashboard/accounting/invoices">
          بازگشت به لیست
        </Link>
      </div>
    </div>
  );
}



