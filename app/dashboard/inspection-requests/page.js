"use client";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import Button from "@/app/components/ui/Button";

export default function InspectionRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: '',
    project_type_id: ''
  });
  const [projectTypes, setProjectTypes] = useState([]);

  const statusOptions = [
    { value: '', label: 'همه وضعیت‌ها' },
    { value: 'pending', label: 'در انتظار بررسی' },
    { value: 'reviewed', label: 'بررسی شده' },
    { value: 'approved', label: 'تایید شده' },
    { value: 'rejected', label: 'رد شده' },
    { value: 'archived', label: 'آرشیو شده' }
  ];

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    pending: 'در انتظار بررسی',
    reviewed: 'بررسی شده',
    approved: 'تایید شده',
    rejected: 'رد شده',
    archived: 'آرشیو شده'
  };

  useEffect(() => {
    fetchData();
    fetchProjectTypes();
  }, [filter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set('status', filter.status);
      if (filter.project_type_id) params.set('project_type_id', filter.project_type_id);
      
      const url = `${API_ENDPOINTS.inspectionRequests.getAll}?${params.toString()}`;
      const res = await fetch(url, { credentials: "include" });
      const data = await res.json();
      
      if (data.success) {
        setRequests(data.data.requests || []);
      } else {
        console.error('Error fetching requests:', data.message);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTypes = async () => {
    try {
      const res = await fetch("/api/projects/types", { credentials: "include" });
      const data = await res.json();
      if (data.success) {
        setProjectTypes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching project types:', error);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const res = await fetch(API_ENDPOINTS.inspectionRequests.updateStatus(requestId), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await res.json();
      if (data.success) {
        fetchData(); // Refresh the list
        alert('وضعیت درخواست با موفقیت به‌روزرسانی شد');
      } else {
        alert(data.message || 'خطا در به‌روزرسانی وضعیت');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    }
  };



  const handleDelete = async (requestId) => {
    if (!confirm('آیا از حذف این درخواست اطمینان دارید؟')) return;

    try {
      const res = await fetch(API_ENDPOINTS.inspectionRequests.delete(requestId), {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await res.json();
      if (data.success) {
        fetchData(); // Refresh the list
        alert('درخواست با موفقیت حذف شد');
      } else {
        alert(data.message || 'خطا در حذف درخواست');
      }
    } catch (error) {
      alert('خطا در ارتباط با سرور');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت درخواست‌های بازرسی</h1>
      </div>

      {/* فیلترها */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
            <select
              value={filter.status}
              onChange={e => setFilter(f => ({ ...f, status: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نوع پروژه</label>
            <select
              value={filter.project_type_id}
              onChange={e => setFilter(f => ({ ...f, project_type_id: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">همه انواع</option>
              {projectTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilter({ status: '', project_type_id: '' })}
              className="w-full"
            >
              پاک کردن فیلترها
            </Button>
          </div>
        </div>
      </div>

      {/* لیست درخواست‌ها */}
      <div className="bg-white border rounded-lg overflow-hidden">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>هیچ درخواستی یافت نشد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">ردیف</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام و نام خانوادگی</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">موبایل</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نوع پروژه</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">وضعیت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تاریخ درخواست</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map((request, index) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.firstName} {request.lastName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {request.projectType?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[request.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[request.status] || request.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(request.createdAt).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2 items-center">
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusUpdate(request.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="pending">در انتظار بررسی</option>
                          <option value="reviewed">بررسی شده</option>
                          <option value="approved">تایید شده</option>
                          <option value="rejected">رد شده</option>
                          <option value="archived">آرشیو شده</option>
                        </select>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
