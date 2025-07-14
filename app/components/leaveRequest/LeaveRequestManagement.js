"use client";
import { useState, useEffect } from "react";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { DateObject } from "react-multi-date-picker";

export default function LeaveRequestManagement() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [approvalType, setApprovalType] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log("Fetching leave requests...");
      const response = await fetch("/api/leave-request/all", {
        credentials: "include",
      });
      const data = await response.json();
      console.log("Response:", data);
      if (data.success) {
        setRequests(data.data);
        console.log("Requests set:", data.data.length);
      } else {
        console.error("API error:", data.message);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/leave-request/approve/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "approve",
          reason: reason,
          approvalType: approvalType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("درخواست با موفقیت تایید شد");
        setShowModal(false);
        setSelectedRequest(null);
        setReason("");
        setApprovalType("");
        fetchRequests();
      } else {
        alert(data.message || "خطا در تایید درخواست");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      alert("خطا در ارتباط با سرور");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !reason.trim()) {
      alert("لطفا دلیل رد را وارد کنید");
      return;
    }

    try {
      const response = await fetch(`/api/leave-request/approve/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "reject",
          reason: reason,
          approvalType: approvalType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("درخواست با موفقیت رد شد");
        setShowModal(false);
        setSelectedRequest(null);
        setReason("");
        setApprovalType("");
        fetchRequests();
      } else {
        alert(data.message || "خطا در رد درخواست");
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("خطا در ارتباط با سرور");
    }
  };

  const openModal = (request, actionType, approvalType) => {
    setSelectedRequest(request);
    setAction(actionType);
    setApprovalType(approvalType);
    setShowModal(true);
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "در انتظار بررسی",
      staff_approved: "تایید ستادی",
      staff_rejected: "رد ستادی",
      final_approved: "تایید نهایی",
      final_rejected: "رد نهایی",
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "bg-yellow-100 text-yellow-800",
      staff_approved: "bg-blue-100 text-blue-800",
      staff_rejected: "bg-red-100 text-red-800",
      final_approved: "bg-green-100 text-green-800",
      final_rejected: "bg-red-100 text-red-800",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  const getTypeText = (type) => {
    const typeMap = {
      annual: "استحقاقی",
      sick: "استعلاجی",
      unpaid: "بدون حقوق",
    };
    return typeMap[type] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new DateObject({
      date: new Date(dateString),
      calendar: persian,
      locale: persian_fa
    });
    return date.format("YYYY/MM/DD");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">مدیریت درخواست‌های مرخصی</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نام کاربر
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                نوع مرخصی
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاریخ شروع
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تاریخ پایان
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                تعداد روزها
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                وضعیت
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {requests.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  درخواست مرخصی وجود ندارد
                </td>
              </tr>
            ) : (
              requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.user?.firstName} {request.user?.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getTypeText(request.type)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.startDate)}
                    {request.isHourly && request.startTime && (
                      <div className="text-xs text-gray-500">
                        ساعت: {request.startTime}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(request.endDate)}
                    {request.isHourly && request.endTime && (
                      <div className="text-xs text-gray-500">
                        ساعت: {request.endTime}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {request.isHourly ? `${request.daysCount} روز کاری` : `${request.daysCount} روز`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                      {getStatusText(request.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-col gap-1">
                      {/* دکمه‌های تایید ستادی */}
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(request, "approve", "staff")}
                            className="text-green-600 hover:text-green-900 text-xs"
                          >
                            تایید ستادی
                          </button>
                          <button
                            onClick={() => openModal(request, "reject", "staff")}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            رد ستادی
                          </button>
                        </div>
                      )}
                      
                      {/* دکمه‌های تایید مدیریت */}
                      {(request.status === "pending" || request.status === "staff_approved") && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => openModal(request, "approve", "admin")}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            تایید مدیریت
                          </button>
                          <button
                            onClick={() => openModal(request, "reject", "admin")}
                            className="text-orange-600 hover:text-orange-900 text-xs"
                          >
                            رد مدیریت
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {action === "approve" 
                  ? (approvalType === "staff" ? "تایید ستادی درخواست" : "تایید مدیریت درخواست")
                  : (approvalType === "staff" ? "رد ستادی درخواست" : "رد مدیریت درخواست")
                }
              </h3>
              {action === "reject" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    دلیل رد
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="دلیل رد درخواست را وارد کنید..."
                  />
                </div>
              )}
              <div className="flex gap-4">
                <button
                  onClick={action === "approve" ? handleApprove : handleReject}
                  className={`flex-1 px-4 py-2 rounded-md text-white ${
                    action === "approve" 
                      ? (approvalType === "staff" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700")
                      : (approvalType === "staff" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700")
                  }`}
                >
                  {action === "approve" 
                    ? (approvalType === "staff" ? "تایید ستادی" : "تایید مدیریت")
                    : (approvalType === "staff" ? "رد ستادی" : "رد مدیریت")
                  }
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedRequest(null);
                    setReason("");
                    setApprovalType("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  انصراف
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 