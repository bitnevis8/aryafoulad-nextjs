"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function InvoicesListPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/accounting/invoices/getAll', { credentials: 'include' });
        const data = await res.json();
        if (data?.success) setRows(Array.isArray(data.data) ? data.data : []);
        else setError(data?.message || 'خطا در دریافت فهرست');
      } catch (e) {
        setError('خطا در ارتباط با سرور');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toPersianDate = (iso) => {
    try { return iso ? new Date(iso).toLocaleDateString('fa-IR') : ''; } catch { return ''; }
  };

  const toTypeFa = (type) => type === 'invoice' ? 'فاکتور' : 'پیش‌فاکتور';

  if (loading) return <div className="p-6">در حال بارگذاری...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">فهرست فاکتورها</h1>

      <div className="overflow-x-auto bg-white rounded-xl border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-right">شناسه</th>
              <th className="p-2 text-right">نوع</th>
              <th className="p-2 text-right">شماره</th>
              <th className="p-2 text-right">تاریخ</th>
              <th className="p-2 text-right">خریدار</th>
              <th className="p-2 text-right">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.id}</td>
                <td className="p-2">{toTypeFa(r.type)}</td>
                <td className="p-2">{r.number}</td>
                <td className="p-2">{toPersianDate(r.invoice_date)}</td>
                <td className="p-2">{r.buyer_legal_name || '-'}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    {r.type === 'proforma' && (
                      <form action={`/api/accounting/invoices/convert/${r.id}`} method="POST">
                        <button className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white">تبدیل به فاکتور</button>
                      </form>
                    )}
                    <Link className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white" href={`/dashboard/accounting/invoices/${r.id}`}>مشاهده</Link>
                    <Link className="px-3 py-1 rounded bg-gray-700 hover:bg-gray-800 text-white" href={`/dashboard/accounting/invoices/${r.id}/edit`}>ویرایش</Link>
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
                        const url = `${baseUrl}/accounting/invoices/download-word-test/${r.id}?v=${timestamp}&r=${randomId}`;
                        
                        // Open in new window to download file
                        window.open(url, '_blank');
                      }}
                    >
                      دانلود ورد
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td className="p-4 text-center text-gray-500" colSpan={6}>رکوردی یافت نشد</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


