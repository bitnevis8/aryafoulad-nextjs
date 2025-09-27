"use client";
import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Button from "@/app/components/ui/Button";
import { useRouter } from "next/navigation";

export default function InspectionRequestDetailsPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();
  const [inspectionRequest, setInspectionRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadInspectionRequest();
  }, [id]);

  const loadInspectionRequest = async () => {
    try {
      const res = await fetch(`/api/inspection-requests/get/${id}`, { credentials: 'include' });
      const data = await res.json();
      console.log('Inspection request data:', data); // Debug
      if (data.success) {
        setInspectionRequest(data.data);
      } else {
        alert(data.message || 'خطا در دریافت جزئیات درخواست');
        router.push('/dashboard/projects');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
      router.push('/dashboard/projects');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (!confirm(`آیا می‌خواهید وضعیت را به "${newStatus}" تغییر دهید؟`)) return;
    
    setUpdating(true);
    try {
      const res = await fetch(`/api/inspection-requests/updateStatus/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('وضعیت با موفقیت به‌روزرسانی شد');
        loadInspectionRequest(); // بارگذاری مجدد
      } else {
        alert(data.message || 'خطا در تغییر وضعیت');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    } finally {
      setUpdating(false);
    }
  };

  const convertToProject = async () => {
    if (!confirm('آیا می‌خواهید این درخواست بازرسی را به پروژه تبدیل کنید؟')) return;
    
    try {
      const res = await fetch(`/api/inspection-requests/convertToProject/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        alert('درخواست با موفقیت به پروژه تبدیل شد');
        router.push('/dashboard/projects');
      } else {
        alert(data.message || 'خطا در تبدیل درخواست به پروژه');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    }
  };

  const statusFa = {
    pending: "در انتظار بررسی",
    reviewed: "بررسی شده", 
    approved: "تایید شده",
    rejected: "رد شده",
    archived: "آرشیو شده"
  };

  if (loading) return <div className="p-6 animate-pulse text-gray-500">در حال بارگذاری...</div>;
  if (!inspectionRequest) return <div className="p-6">درخواست یافت نشد</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* هدر */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">جزئیات درخواست بازرسی #{inspectionRequest.id}</h1>
          <p className="text-gray-600 text-sm mt-1">
            نوع: {inspectionRequest.projectType?.name || 'نامشخص'}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm">بازگشت</Button>
          </Link>
          {inspectionRequest.status === 'pending' && (
            <Button 
              onClick={convertToProject}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              تبدیل به پروژه
            </Button>
          )}
        </div>
      </div>

      {/* اطلاعات کلی */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">اطلاعات کلی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شناسه درخواست</label>
            <p className="text-gray-900">{inspectionRequest.id}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع بازرسی</label>
            <p className="text-gray-900">{inspectionRequest.projectType?.name || 'نامشخص'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                inspectionRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                inspectionRequest.status === 'approved' ? 'bg-green-100 text-green-800' :
                inspectionRequest.status === 'rejected' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {statusFa[inspectionRequest.status] || inspectionRequest.status}
              </span>
              <select 
                disabled={updating}
                className="border rounded px-2 py-1 text-sm"
                value={inspectionRequest.status}
                onChange={(e) => updateStatus(e.target.value)}
              >
                {Object.entries(statusFa).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ ثبت</label>
            <p className="text-gray-900">
              {new Date(inspectionRequest.createdAt).toLocaleDateString('fa-IR')}
            </p>
          </div>
        </div>
      </div>

      {/* اطلاعات متقاضی */}
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">اطلاعات متقاضی</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
            <p className="text-gray-900">{inspectionRequest.firstName || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
            <p className="text-gray-900">{inspectionRequest.lastName || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
            <p className="text-gray-900">{inspectionRequest.mobile || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">کد ملی</label>
            <p className="text-gray-900">{inspectionRequest.nationalId || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل</label>
            <p className="text-gray-900">{inspectionRequest.email || '-'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">آدرس</label>
            <p className="text-gray-900">{inspectionRequest.address || '-'}</p>
          </div>
        </div>
      </div>

      {/* جزئیات درخواست */}
      {inspectionRequest.request_payload && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">جزئیات درخواست</h2>
          
          {/* نمایش فیلدهای فرم */}
          {inspectionRequest.request_payload.fields && (
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-800">اطلاعات فرم</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(inspectionRequest.request_payload.fields).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{key}</label>
                    <p className="text-gray-900 bg-gray-50 p-2 rounded">{value || '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمایش استانداردها */}
          {inspectionRequest.request_payload.standards && (
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-800">استانداردها</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(inspectionRequest.request_payload.standards).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمایش انواع بازرسی */}
          {inspectionRequest.request_payload.inspectionTypes && (
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-800">انواع بازرسی</h3>
              <div className="space-y-2">
                {inspectionRequest.request_payload.inspectionTypes.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-600">نوع</label>
                        <p className="text-sm">{item.type}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">تعداد</label>
                        <p className="text-sm">{item.تعداد || 0}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600">بخش دستگاه</label>
                        <p className="text-sm">{item.بخش_دستگاه || '-'}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمایش مراحل بازرسی */}
          {inspectionRequest.request_payload.inspectionStages && (
            <div className="mb-6">
              <h3 className="text-md font-medium mb-3 text-gray-800">مراحل بازرسی</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(inspectionRequest.request_payload.inspectionStages).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${value ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-sm">{key}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمایش JSON کامل برای debug */}
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-600 hover:text-gray-800">
              نمایش JSON کامل
            </summary>
            <div className="bg-gray-50 rounded-lg p-4 mt-2">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(inspectionRequest.request_payload, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}

      {/* اطلاعات بررسی */}
      {inspectionRequest.reviewed_by && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">اطلاعات بررسی</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">بررسی کننده</label>
              <p className="text-gray-900">
                {inspectionRequest.reviewer?.firstName} {inspectionRequest.reviewer?.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ بررسی</label>
              <p className="text-gray-900">
                {inspectionRequest.reviewed_at ? 
                  new Date(inspectionRequest.reviewed_at).toLocaleDateString('fa-IR') : 
                  '-'
                }
              </p>
            </div>
            {inspectionRequest.review_notes && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت بررسی</label>
                <p className="text-gray-900">{inspectionRequest.review_notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
