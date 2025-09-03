"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function ProjectCostsPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [costs, setCosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [costTitle, setCostTitle] = useState("");
  const [costAmount, setCostAmount] = useState("");
  const [costNote, setCostNote] = useState("");
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
        setCosts(projectData.data.costItems || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const addCost = async () => {
    if (!costTitle || !costAmount) {
      alert("لطفاً عنوان و مبلغ هزینه را وارد کنید");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects/costs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          project_id: Number(id),
          title: costTitle,
          amount: Number(costAmount),
          note: costNote
        })
      });
      const data = await res.json();
      if (data.success) {
        setCosts(prev => [...prev, data.data]);
        setCostTitle('');
        setCostAmount('');
        setCostNote('');
        // به‌روزرسانی اطلاعات پروژه
        loadData();
      } else {
        alert(data.message || 'خطا در ثبت هزینه');
      }
    } catch (error) {
      console.error("Error adding cost:", error);
      alert('خطا در ثبت هزینه');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteCost = async (costId) => {
    if (!confirm("آیا از حذف این هزینه اطمینان دارید؟")) return;
    
    try {
      const res = await fetch(`/api/projects/costs/delete/${costId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setCosts(prev => prev.filter(c => c.id !== costId));
        loadData(); // به‌روزرسانی اطلاعات پروژه
      } else {
        alert(data.message || 'خطا در حذف هزینه');
      }
    } catch (error) {
      console.error("Error deleting cost:", error);
      alert('خطا در حذف هزینه');
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!project) return <div className="p-6">پروژه یافت نشد</div>;

  const totalCosts = costs.reduce((sum, cost) => sum + Number(cost.amount || 0), 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت هزینه‌های پروژه #{project.id}</h1>
          <p className="text-gray-600 text-sm mt-1">{project.type?.name} - {project.client_name}</p>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">تعداد هزینه‌ها</div>
            <div className="text-2xl font-bold text-blue-600">{costs.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">مجموع هزینه‌ها</div>
            <div className="text-2xl font-bold text-green-600">{totalCosts.toLocaleString('fa-IR')} تومان</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">میانگین هزینه</div>
            <div className="text-2xl font-bold text-purple-600">
              {costs.length > 0 ? (totalCosts / costs.length).toLocaleString('fa-IR') : 0} تومان
            </div>
          </div>
        </div>
      </div>

      {/* Add Cost Form */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">افزودن هزینه جدید</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            placeholder="عنوان هزینه"
            value={costTitle}
            onChange={(e) => setCostTitle(e.target.value)}
          />
          <input
            type="number"
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            placeholder="مبلغ (تومان)"
            value={costAmount}
            onChange={(e) => setCostAmount(e.target.value)}
          />
          <input
            className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500"
            placeholder="توضیحات (اختیاری)"
            value={costNote}
            onChange={(e) => setCostNote(e.target.value)}
          />
        </div>
        <div className="flex justify-end mt-4">
          <Button 
            onClick={addCost} 
            disabled={submitting}
            className="bg-green-600 hover:bg-green-700"
          >
            {submitting ? 'در حال ثبت...' : 'افزودن هزینه'}
          </Button>
        </div>
      </div>

      {/* Costs List */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">لیست هزینه‌ها</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">شناسه</th>
                <th className="p-3 text-right">عنوان</th>
                <th className="p-3 text-right">مبلغ</th>
                <th className="p-3 text-right">توضیحات</th>
                <th className="p-3 text-right">تاریخ ثبت</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <tr key={cost.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{cost.id}</td>
                  <td className="p-3 font-medium">{cost.title}</td>
                  <td className="p-3 text-green-600 font-semibold">
                    {Number(cost.amount).toLocaleString('fa-IR')} تومان
                  </td>
                  <td className="p-3 text-gray-600">{cost.note || '-'}</td>
                  <td className="p-3 text-gray-500">
                    {new Date(cost.createdAt).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => deleteCost(cost.id)}
                    >
                      حذف
                    </Button>
                  </td>
                </tr>
              ))}
              {costs.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    هیچ هزینه‌ای ثبت نشده است
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
