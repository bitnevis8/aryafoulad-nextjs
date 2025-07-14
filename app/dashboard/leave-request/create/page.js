import LeaveRequestForm from "@/app/components/leaveRequest/LeaveRequestForm";

export default function CreateLeaveRequestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">درخواست مرخصی جدید</h1>
        <p className="text-gray-600 mt-2">فرم ثبت درخواست مرخصی</p>
      </div>
      
      <LeaveRequestForm />
    </div>
  );
} 