"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";

export default function EditReportPage({ params }) {
  const { id, reportId } = use(params);
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [template, setTemplate] = useState(null);
  const [project, setProject] = useState(null);
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
        setPayload(reportData.data.data);
        
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

  const submit = async () => {
    if (!payload) {
      alert("لطفاً اطلاعات گزارش را تکمیل کنید");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/forms/update/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: payload }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('گزارش با موفقیت به‌روزرسانی شد');
        router.push(`/dashboard/projects/${id}/report/${reportId}`);
      } else {
        alert(data.message || 'خطا در به‌روزرسانی گزارش');
      }
    } catch (error) {
      console.error("Error updating report:", error);
      alert('خطا در به‌روزرسانی گزارش');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!report || !template) return <div className="p-6">گزارش یا تمپلیت یافت نشد</div>;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ویرایش گزارش #{report.id}</h1>
          <p className="text-gray-600 text-sm mt-1">
            پروژه #{id} - {project?.type?.name} - {project?.client_name}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${id}/report/${reportId}`}>
            <Button variant="outline">انصراف</Button>
          </Link>
        </div>
      </div>

      {/* Report Info */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

      {/* Report Form */}
      <div className="bg-white border rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">ویرایش محتوای گزارش</h2>
        {template && (
          <div className="space-y-4">
            <ReportEditor 
              template={template} 
              data={payload} 
              onChange={setPayload}
              project={project}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button 
          onClick={submit} 
          disabled={submitting}
          className="bg-green-600 hover:bg-green-700"
        >
          {submitting ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
        </Button>
      </div>
    </div>
  );
}

function ReportEditor({ template, data, onChange, project }) {
  const ReportRenderer = require('@/app/components/projects/ReportRenderer').default;
  
  // پرکردن پیش‌فرض از اطلاعات پروژه در صورت وجود
  const baseData = data || template.schema;
  if (project && baseData) {
    baseData.client = project.client_name || baseData.client;
    baseData.project = `#${project.id} - ${project.type?.name || ''}`.trim();
    baseData.location = project.request_payload?.fields?.['آدرس'] || baseData.location;
  }
  
  return (
    <ReportRenderer 
      template={template} 
      value={baseData} 
      onChange={onChange} 
    />
  );
}
