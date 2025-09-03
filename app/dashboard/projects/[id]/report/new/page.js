"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Button from "@/app/components/ui/Button";
import UserSelect from "@/app/components/projects/UserSelect";

export default function NewReportPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState(null);
  const [payload, setPayload] = useState(null);
  const [project, setProject] = useState(null);

  useEffect(() => {
    (async () => {
      // گزارش استاندارد این پروژه: AFG-RP-PLAYGROUND-EARTH-WELD-R0
      const res = await fetch('/api/projects/forms/template/AFG-RP-PLAYGROUND-EARTH-WELD-R0', { credentials: 'include' });
      const data = await res.json();
      if (data.success) setTemplate(data.data);
      // دریافت پروژه برای پرکردن خودکار فیلدها
      const resProj = await fetch(`/api/projects/requests/getOne/${id}`, { credentials: 'include' });
      const dataProj = await resProj.json();
      if (dataProj.success) setProject(dataProj.data);
    })();
  }, [id]);

  const submit = async () => {
    const res = await fetch('/api/projects/forms/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: Number(id), template_code: 'AFG-RP-PLAYGROUND-EARTH-WELD-R0', data: payload }),
      credentials: 'include'
    });
    const data = await res.json();
    if (data.success) router.push(`/dashboard/projects/${id}`);
    else alert(data.message || 'خطا در ثبت گزارش');
  };

  if (!template) return <div className="p-6 animate-pulse text-gray-500">Loading...</div>;
  const FormRenderer = require('@/app/components/projects/ReportRenderer').default;
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">New Report</h1>
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <AutoFilledReport template={template} project={project} onChange={setPayload} />
      </div>
      <div className="flex justify-end">
        <Button onClick={submit}>Submit Report</Button>
      </div>
    </div>
  );
}

function AutoFilledReport({ template, project, onChange }) {
  const ReportRenderer = require('@/app/components/projects/ReportRenderer').default;
  // پرکردن پیش‌فرض از اطلاعات درخواست/پروژه در صورت وجود
  const base = template.schema;
  if (project) {
    base.client = project.client_name || base.client;
    base.project = `#${project.id} - ${project.type?.name || ''}`.trim();
    base.location = project.request_payload?.fields?.['آدرس'] || base.location;
  }
  return <ReportRenderer template={template} value={base} onChange={onChange} />;
}

