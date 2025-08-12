"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";

import React from "react";

export default function ProjectDetailsPage({ params }) {
  const { id } = React.use(params);
  const [project, setProject] = useState(null);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const statusFa = {
    requested: "درخواست شده",
    quoted: "اعلام هزینه",
    scheduled: "زمان‌بندی",
    inspecting: "در حال بازرسی",
    reporting: "ثبت گزارش",
    approved: "تایید نهایی",
    rejected: "رد شده",
  };
  const [costTitle, setCostTitle] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costNote, setCostNote] = useState("");
  const [payAmount, setPayAmount] = useState("");
  const [payPayer, setPayPayer] = useState("");
  const [payInvoice, setPayInvoice] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payDesc, setPayDesc] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`/api/projects/requests/getOne/${id}`, { credentials: 'include' });
        const data = await res.json();
        if (data.success) setProject(data.data);
        const res2 = await fetch(`/api/projects/forms/by-project/${id}`, { credentials: 'include' });
        const data2 = await res2.json();
        if (data2.success) setSubs(data2.data);
      } finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!project) return <div className="p-6">یافت نشد</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">پروژه #{project.id} - {project.type?.name}</h1>
        <Link href={`/dashboard/projects/${id}/report/new`}><Button>ثبت گزارش جدید</Button></Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">اطلاعات متقاضی</div>
          <div>نام: {project.client_name}</div>
          <div>تماس: {project.client_contact || '-'}</div>
          <div>وضعیت: {statusFa[project.status] || project.status}</div>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="font-semibold mb-2">زمان‌ها</div>
          <div>ثبت: {new Date(project.createdAt).toLocaleString('fa-IR')}</div>
          <div>بروزرسانی: {new Date(project.updatedAt).toLocaleString('fa-IR')}</div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="text-sm text-gray-500">جمع هزینه‌ها</div>
          <div className="text-xl font-bold">{Number(project?.totals?.costTotal || 0).toLocaleString('fa-IR')} تومان</div>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="text-sm text-gray-500">جمع پرداختی‌ها</div>
          <div className="text-xl font-bold">{Number(project?.totals?.paidTotal || 0).toLocaleString('fa-IR')} تومان</div>
        </div>
        <div className="border rounded-xl p-4 bg-white shadow-sm">
          <div className="text-sm text-gray-500">بدهکار/بستانکار</div>
          <div className={`text-xl font-bold ${Number(project?.totals?.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {Number(project?.totals?.balance || 0).toLocaleString('fa-IR')} تومان
          </div>
        </div>
      </div>

      <div className="border rounded-xl bg-white shadow-sm">
        <div className="p-3 font-semibold bg-gray-50 rounded-t-xl">گزارش‌ها</div>
        <table className="min-w-full text-sm">
          <thead>
            <tr><th className="p-2 text-right">شناسه</th><th className="p-2 text-right">تمپلیت</th><th className="p-2 text-right">نسخه</th><th className="p-2 text-right">تاریخ</th></tr>
          </thead>
          <tbody>
            {subs.map(s => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.id}</td>
                <td className="p-3">{s.template_code}</td>
                <td className="p-3">{s.version}</td>
                <td className="p-3">{new Date(s.createdAt).toLocaleString('fa-IR')}</td>
              </tr>
            ))}
            {subs.length === 0 && <tr><td className="p-6 text-center text-gray-500" colSpan={4}>گزارشی ثبت نشده</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Costs and Payments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-xl bg-white shadow-sm p-4">
          <div className="font-semibold mb-3">اعلام هزینه‌ها</div>
          <div className="space-y-2">
            <input className="w-full border rounded px-3 py-2" placeholder="عنوان هزینه" value={costTitle} onChange={e=>setCostTitle(e.target.value)} />
            <input className="w-full border rounded px-3 py-2" placeholder="مبلغ" value={costAmount} onChange={e=>setCostAmount(e.target.value)} />
            <input className="w-full border rounded px-3 py-2" placeholder="توضیح" value={costNote} onChange={e=>setCostNote(e.target.value)} />
            <div className="flex justify-end"><Button onClick={async()=>{
              const res = await fetch('/api/projects/costs/create',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({project_id:Number(id), title:costTitle, amount:Number(costAmount||0), note:costNote})});
              const data = await res.json();
              if(data.success){ setProject(p=>({...p, costItems:[...(p.costItems||[]), data.data]})); setCostTitle(''); setCostAmount(''); setCostNote('');}
            }}>افزودن هزینه</Button></div>
          </div>
          <div className="mt-4">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="p-2 text-right">عنوان</th><th className="p-2 text-right">مبلغ</th><th className="p-2 text-right">توضیح</th></tr></thead>
              <tbody>
                {(project.costItems||[]).map(ci=> (
                  <tr key={ci.id} className="border-t"><td className="p-2">{ci.title}</td><td className="p-2">{Number(ci.amount).toLocaleString('fa-IR')}</td><td className="p-2">{ci.note||'-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="border rounded-xl bg-white shadow-sm p-4">
          <div className="font-semibold mb-3">پرداختی‌ها</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <input className="border rounded px-3 py-2" placeholder="نام پرداخت‌کننده" value={payPayer} onChange={e=>setPayPayer(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="مبلغ" value={payAmount} onChange={e=>setPayAmount(e.target.value)} />
            <input className="border rounded px-3 py-2" placeholder="شماره فاکتور" value={payInvoice} onChange={e=>setPayInvoice(e.target.value)} />
            <input type="date" className="border rounded px-3 py-2" placeholder="تاریخ" value={payDate} onChange={e=>setPayDate(e.target.value)} />
            <input className="md:col-span-2 border rounded px-3 py-2" placeholder="توضیحات" value={payDesc} onChange={e=>setPayDesc(e.target.value)} />
          </div>
          <div className="flex justify-end mt-2"><Button onClick={async()=>{
            const res = await fetch('/api/projects/payments/create',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'include',body:JSON.stringify({project_id:Number(id), payer_name:payPayer, amount:Number(payAmount||0), paid_at:payDate||new Date().toISOString(), invoice_no:payInvoice, description:payDesc})});
            const data = await res.json();
            if(data.success){ setProject(p=>({...p, payments:[...(p.payments||[]), data.data]})); setPayPayer(''); setPayAmount(''); setPayInvoice(''); setPayDate(''); setPayDesc('');}
          }}>افزودن پرداخت</Button></div>
          <div className="mt-4">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50"><tr><th className="p-2 text-right">پرداخت‌کننده</th><th className="p-2 text-right">مبلغ</th><th className="p-2 text-right">تاریخ</th><th className="p-2 text-right">فاکتور</th></tr></thead>
              <tbody>
                {(project.payments||[]).map(pm=> (
                  <tr key={pm.id} className="border-t"><td className="p-2">{pm.payer_name}</td><td className="p-2">{Number(pm.amount).toLocaleString('fa-IR')}</td><td className="p-2">{new Date(pm.paid_at).toLocaleDateString('fa-IR')}</td><td className="p-2">{pm.invoice_no||'-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

