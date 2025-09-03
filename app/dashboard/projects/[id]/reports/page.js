"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function ProjectReportsPage({ params }) {
  const { id } = use(params);
  const [project, setProject] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

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
      }

      // دریافت گزارش‌های پروژه
      const reportsRes = await fetch(`/api/projects/forms/by-project/${id}`, { credentials: 'include' });
      const reportsData = await reportsRes.json();
      if (reportsData.success) {
        setReports(reportsData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (reportId) => {
    if (!confirm("آیا از حذف این گزارش اطمینان دارید؟")) return;
    
    try {
      const res = await fetch(`/api/projects/forms/delete/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        setReports(prev => prev.filter(r => r.id !== reportId));
      } else {
        alert(data.message || 'خطا در حذف گزارش');
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert('خطا در حذف گزارش');
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!project) return <div className="p-6">پروژه یافت نشد</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت گزارش‌های پروژه #{project.id}</h1>
          <p className="text-gray-600 text-sm mt-1">{project.type?.name} - {project.client_name}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${id}/report/new`}>
            <Button className="bg-purple-600 hover:bg-purple-700">ثبت گزارش جدید</Button>
          </Link>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-500">تعداد گزارش‌ها</div>
            <div className="text-2xl font-bold text-purple-600">{reports.length}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">آخرین گزارش</div>
            <div className="text-lg font-semibold text-gray-700">
              {reports.length > 0 ? new Date(reports[0].createdAt).toLocaleDateString('fa-IR') : '-'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">وضعیت پروژه</div>
            <div className="text-lg font-semibold text-blue-600">
              {project.status === 'reporting' ? 'در حال گزارش‌گیری' : 
               project.status === 'approved' ? 'تایید شده' : 
               project.status === 'rejected' ? 'رد شده' : 'در انتظار'}
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">لیست گزارش‌ها</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">شناسه</th>
                <th className="p-3 text-right">کد تمپلیت</th>
                <th className="p-3 text-right">نسخه</th>
                <th className="p-3 text-right">تاریخ ثبت</th>
                <th className="p-3 text-right">آخرین بروزرسانی</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{report.id}</td>
                  <td className="p-3 font-medium">{report.template_code}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                      v{report.version}
                    </span>
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(report.createdAt).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3 text-gray-600">
                    {new Date(report.updatedAt).toLocaleString('fa-IR')}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/projects/${id}/report/${report.id}`}>
                        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          مشاهده
                        </Button>
                      </Link>
                      <Link href={`/dashboard/projects/${id}/report/${report.id}/edit`}>
                        <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                          ویرایش
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => deleteReport(report.id)}
                      >
                        حذف
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={6}>
                    هیچ گزارشی ثبت نشده است
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
