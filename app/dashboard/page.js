export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">داشبورد</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-2 text-gray-700">راهنما</h3>
          <p className="text-gray-600 text-sm">از منوی سایدبار انتخاب کنید</p>
        </div>
        {/* Add more dashboard cards here */}
      </div>
    </div>
  );
} 