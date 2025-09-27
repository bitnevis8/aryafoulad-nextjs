"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";

export default function ViewReportPage({ params }) {
  const { id, reportId } = use(params);
  const [report, setReport] = useState(null);
  const [template, setTemplate] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id, reportId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // دریافت گزارش
      const reportRes = await fetch(`/api/projects/forms/submission/${reportId}`, { credentials: 'include' });
      const reportData = await reportRes.json();
      if (reportData.success) {
        setReport(reportData.data);
        
        // دریافت تمپلیت
        const templateRes = await fetch(`/api/projects/forms/template/${reportData.data.template_code}`, { credentials: 'include' });
        const templateData = await templateRes.json();
        if (templateData.success) setTemplate(templateData.data);
      }

      // دریافت پروژه
      const projectRes = await fetch(`/api/projects/requests/getOne/${id}`, { credentials: 'include' });
      const projectData = await projectRes.json();
      if (projectData.success) setProject(projectData.data);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async () => {
    if (!confirm("آیا از حذف این گزارش اطمینان دارید؟")) return;
    
    try {
      const res = await fetch(`/api/projects/forms/delete/${reportId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('گزارش با موفقیت حذف شد');
        window.location.href = `/dashboard/projects/${id}/reports`;
      } else {
        alert(data.message || 'خطا در حذف گزارش');
      }
    } catch (error) {
      console.error("Error deleting report:", error);
      alert('خطا در حذف گزارش');
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!report) return <div className="p-6">گزارش یافت نشد</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مشاهده گزارش #{report.id}</h1>
          <p className="text-gray-600 text-sm mt-1">
            پروژه #{id} - {project?.type?.name} - {project?.client_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${id}/report/${reportId}/edit`}>
            <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
              ویرایش گزارش
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={deleteReport}
          >
            حذف گزارش
          </Button>
          <Link href={`/dashboard/projects/${id}/reports`}>
            <Button variant="outline">بازگشت به لیست</Button>
          </Link>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <div className="text-sm text-gray-500">شناسه گزارش</div>
            <div className="text-lg font-semibold">#{report.id}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">کد تمپلیت</div>
            <div className="text-lg font-semibold">{report.template_code}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">نسخه</div>
            <div className="text-lg font-semibold">v{report.version}</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">تاریخ ثبت</div>
            <div className="text-lg">{new Date(report.createdAt).toLocaleString('fa-IR')}</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">آخرین بروزرسانی</div>
            <div className="text-lg">{new Date(report.updatedAt).toLocaleString('fa-IR')}</div>
          </div>
        </div>
      </div>

      {/* Report Content */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">محتوای گزارش</h2>
        {template && (
          <div className="space-y-4">
            <ReportViewer template={template} data={report.data} />
          </div>
        )}
      </div>
    </div>
  );
}

function ReportViewer({ template, data }) {
  if (!data || !template) return <div className="text-gray-500">داده‌ای برای نمایش وجود ندارد</div>;

  const renderField = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      return (
        <div key={key} className="border rounded-lg p-4">
          <h3 className="font-semibold mb-2">{key}</h3>
          <div className="space-y-2">
            {Object.entries(value).map(([subKey, subValue]) => (
              <div key={subKey} className="flex justify-between">
                <span className="text-gray-600">{subKey}:</span>
                <span className="font-medium">{String(subValue)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return (
      <div key={key} className="flex justify-between py-2 border-b border-gray-100">
        <span className="text-gray-600">{key}:</span>
        <span className="font-medium">{String(value)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => renderField(key, value))}
    </div>
  );
}
