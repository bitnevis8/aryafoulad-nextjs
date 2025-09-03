"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import PersianDatePicker from '@/app/components/ui/PersianDatePicker';

export default function ProjectPaymentsPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payAmount, setPayAmount] = useState("");
  const [payPayer, setPayPayer] = useState("");
  const [payInvoice, setPayInvoice] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payDesc, setPayDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // دریافت اطلاعات پروژه
      const projectRes = await fetch(`/api/projects/requests/getOne/${id}`, { credentials: 'include' });
      const projectData = await projectRes.json();
      if (projectData.success) {
        setProject(projectData.data);
        setPayments(projectData.data.payments || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async () => {
    if (!payAmount || !payPayer) {
      alert("لطفاً مبلغ و نام پرداخت‌کننده را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project_id: Number(id),
          payer_name: payPayer,
          amount: Number(payAmount),
          paid_at: payDate || new Date().toISOString(),
          invoice_no: payInvoice,
          description: payDesc
        })
      });
      const data = await res.json();
      if (data.success) {
        setPayments(prev => [...prev, data.data]);
        setPayAmount('');
        setPayPayer('');
        setPayInvoice('');
        setPayDate('');
        setPayDesc('');
        // به‌روزرسانی اطلاعات پروژه
        loadData();
      } else {
        alert(data.message || 'خطا در ثبت پرداخت');
      }
    } catch (error) {
      console.error("Error adding payment:", error);
      alert('خطا در ثبت پرداخت');
    } finally {
      setSubmitting(false);
    }
  };

  const deletePayment = async (paymentId) => {
    if (!confirm("آیا از حذف این پرداخت اطمینان دارید؟")) return;
    
    try {
      const res = await fetch(`/api/projects/payments/delete/${paymentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setPayments(prev => prev.filter(p => p.id !== paymentId));
        loadData(); // به‌روزرسانی اطلاعات پروژه
      } else {
        alert(data.message || 'خطا در حذف پرداخت');
      }
    } catch (error) {
      console.error("Error deleting payment:", error);
      alert('خطا در حذف پرداخت');
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!project) return <div className="p-6">پروژه یافت نشد</div>;

  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت پرداختی‌های پروژه #{project.id}</h1>
          <p className="text-gray-600 text-sm mt-1">{project.type?.name} - {project.client_name}</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">تعداد پرداختی‌ها</div>
            <div className="text-2xl font-bold text-blue-600">{payments.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">مجموع پرداختی‌ها</div>
            <div className="text-2xl font-bold text-green-600">{totalPayments.toLocaleString('fa-IR')} تومان</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">میانگین پرداخت</div>
            <div className="text-2xl font-bold text-purple-600">
              {payments.length > 0 ? (totalPayments / payments.length).toLocaleString('fa-IR') : 0} تومان
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Form */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">افزودن پرداخت جدید</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="نام پرداخت‌کننده"
            value={payPayer}
            onChange={(e) => setPayPayer(e.target.value)}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="مبلغ (تومان)"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="شماره فاکتور (اختیاری)"
            value={payInvoice}
            onChange={(e) => setPayInvoice(e.target.value)}
          />
          <PersianDatePicker
            value={payDate}
            onChange={setPayDate}
            placeholder="تاریخ پرداخت"
          />
          <input
            className="md:col-span-2 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="توضیحات (اختیاری)"
            value={payDesc}
            onChange={(e) => setPayDesc(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={addPayment} 
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? 'در حال ثبت...' : 'افزودن پرداخت'}
          </Button>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">لیست پرداختی‌ها</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">شناسه</th>
                <th className="p-3 text-right">پرداخت‌کننده</th>
                <th className="p-3 text-right">مبلغ</th>
                <th className="p-3 text-right">تاریخ پرداخت</th>
                <th className="p-3 text-right">شماره فاکتور</th>
                <th className="p-3 text-right">توضیحات</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{payment.id}</td>
                  <td className="p-3 font-medium">{payment.payer_name}</td>
                  <td className="p-3 text-green-600 font-semibold">
                    {Number(payment.amount).toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(payment.paid_at).toLocaleDateString('fa-IR')}
                  </td>
                  <td className="p-3 text-gray-600">{payment.invoice_no || '-'}</td>
                  <td className="p-3 text-gray-600">{payment.description || '-'}</td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => deletePayment(payment.id)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={7}>
                    هیچ پرداختی ثبت نشده است
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
