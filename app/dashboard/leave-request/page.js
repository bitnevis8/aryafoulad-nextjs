import LeaveRequestList from "@/app/components/leaveRequest/LeaveRequestList";

export default function LeaveRequestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">سیستم مرخصی</h1>
        <p className="text-gray-600 mt-2">مدیریت درخواست‌های مرخصی</p>
      </div>
      
      <LeaveRequestList />
    </div>
  );
} 