import LeaveRequestManagement from "@/app/components/leaveRequest/LeaveRequestManagement";

export default function LeaveRequestManagementPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">مدیریت درخواست‌های مرخصی</h1>
        <p className="text-gray-600 mt-2">تایید و رد درخواست‌های مرخصی</p>
      </div>
      
      <LeaveRequestManagement />
    </div>
  );
} 