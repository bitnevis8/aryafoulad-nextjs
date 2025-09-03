"use client";
import { useEffect, useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/app/components/ui/Map/Map"), { ssr: false });

export default function CreateCustomerPage() {
  const [form, setForm] = useState({
    type: "person", // person | company (حقیقی | حقوقی)
    firstName: "",
    lastName: "",
    nationalId: "",
    phone: "",
    mobile: "",
    email: "",
    username: "",
    password: "123456", // پیشفرض، بعداً می‌توان به OTP تغییر داد
  });
  
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [entityForm, setEntityForm] = useState({
    companyName: "",
    entityType: "company",
    companyType: "other",
    registrationNumber: "",
    nationalId: "",
    economicCode: "",
    phone: "",
    email: "",
    address: "",
    latitude: null,
    longitude: null,
    description: ""
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [customerRoleId, setCustomerRoleId] = useState(null);

  useEffect(() => {
    // یافتن نقش مشتری برای اختصاص هنگام ایجاد
    const loadRoles = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.roles.getAll, { credentials: "include" });
        const data = await res.json();
        const roles = Array.isArray(data?.data?.roles) ? data.data.roles : (Array.isArray(data?.data) ? data.data : []);
        const customer = roles.find(r => r.nameEn === 'Customer' || r.nameFa === 'مشتری');
        if (customer) setCustomerRoleId(customer.id);
      } catch (e) {
        // ignore
      }
    };
    loadRoles();
  }, []);

  // تنظیم entityType بر اساس نوع مشتری
  useEffect(() => {
    setEntityForm(prev => ({
      ...prev,
      entityType: form.type === 'company' ? 'branch' : 'company'
    }));
  }, [form.type]);

  const addEntity = () => {
    if (!entityForm.companyName) {
      const entityTypeText = form.type === 'company' ? 'شعبه' : 'شرکت';
      alert(`لطفاً نام ${entityTypeText} را وارد کنید`);
      return;
    }
    
    setCompanies(prev => [...prev, { ...entityForm, id: Date.now() }]);
    setEntityForm({
      companyName: "",
      entityType: form.type === 'company' ? 'branch' : 'company',
      companyType: "other",
      registrationNumber: "",
      nationalId: "",
      economicCode: "",
      phone: "",
      email: "",
      address: "",
      latitude: null,
      longitude: null,
      description: ""
    });
    setShowCompanyForm(false);
  };

  const removeCompany = (id) => {
    setCompanies(prev => prev.filter(company => company.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      // ساخت کاربر و تخصیص نقش "Customer"
      const res = await fetch("/api/user/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName || "-",
          lastName: form.lastName || "-",
          email: form.email || `${Date.now()}@example.com`,
          mobile: form.mobile || null,
          phone: form.phone || null,
          username: form.username || form.mobile || form.nationalId || undefined,
          password: form.password,
          roleIds: customerRoleId ? [customerRoleId] : undefined,
          // فیلدهای پروفایل مشتری
          nationalId: form.nationalId || null,
          type: form.type,
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "خطا");
      
      // ایجاد شرکت‌ها اگر وجود داشته باشند
      if (companies.length > 0) {
        for (const company of companies) {
          await fetch(API_ENDPOINTS.customerCompanies.create, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              customerId: data.data.id,
              ...company
            })
          });
        }
      }
      
      setMessage("مشتری و شرکت‌هایش با موفقیت ایجاد شد.");
    } catch (err) {
      setMessage(err.message || "خطا در ذخیره سازی");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6 lg:p-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800">افزودن مشتری</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* نوع مشتری */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block mb-2 text-sm font-medium text-gray-700">نوع مشتری</label>
              <select 
                value={form.type} 
                onChange={e=>setForm(f=>({...f, type: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="person">حقیقی</option>
                <option value="company">حقوقی</option>
              </select>
            </div>

            {/* نام و نام خانوادگی */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">نام</label>
              <input 
                value={form.firstName} 
                onChange={e=>setForm(f=>({...f, firstName: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="نام"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">نام خانوادگی</label>
              <input 
                value={form.lastName} 
                onChange={e=>setForm(f=>({...f, lastName: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="نام خانوادگی"
              />
            </div>

            {/* کد ملی */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">کد ملی</label>
              <input 
                value={form.nationalId} 
                onChange={e=>setForm(f=>({...f, nationalId: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="کد ملی"
              />
            </div>

            {/* ایمیل */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                ایمیل <span className="text-gray-500 text-xs">(اختیاری)</span>
              </label>
              <input 
                type="email" 
                value={form.email} 
                onChange={e=>setForm(f=>({...f, email: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="ایمیل (اختیاری)"
              />
            </div>

            {/* تلفن */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">تلفن</label>
              <input 
                value={form.phone} 
                onChange={e=>setForm(f=>({...f, phone: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="تلفن"
              />
            </div>

            {/* موبایل */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">موبایل</label>
              <input 
                value={form.mobile} 
                onChange={e=>setForm(f=>({...f, mobile: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="موبایل"
              />
            </div>

            {/* نام کاربری */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">نام کاربری</label>
              <input 
                value={form.username} 
                onChange={e=>setForm(f=>({...f, username: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="نام کاربری"
              />
            </div>

            {/* رمز عبور */}
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">رمز عبور</label>
              <input 
                type="password" 
                value={form.password} 
                onChange={e=>setForm(f=>({...f, password: e.target.value}))} 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="رمز عبور"
              />
            </div>
          </div>

          {/* مدیریت شرکت‌ها/شعبه‌ها */}
          <div className="col-span-full">
            <div className="border-t pt-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>راهنما:</strong> 
                  {form.type === 'company' 
                    ? ' مشتری حقوقی می‌تواند چندین شعبه داشته باشد. هر شعبه لوکیشن مخصوص خودش را دارد که باید روی نقشه مشخص شود.'
                    : ' مشتری حقیقی می‌تواند چندین شرکت داشته باشد. هر شرکت لوکیشن مخصوص خودش را دارد که باید روی نقشه مشخص شود.'
                  }
                </p>
              </div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {form.type === 'company' ? 'شعبه‌های مشتری حقوقی' : 'شرکت‌های مشتری حقیقی'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowCompanyForm(!showCompanyForm)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {showCompanyForm ? 'لغو' : (form.type === 'company' ? 'افزودن شعبه' : 'افزودن شرکت')}
                </button>
              </div>

              {/* فرم افزودن شرکت/شعبه */}
              {showCompanyForm && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-medium text-gray-700 mb-4">
                    اطلاعات {form.type === 'company' ? 'شعبه جدید (مشتری حقوقی)' : 'شرکت جدید (مشتری حقیقی)'}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">
                        نام {form.type === 'company' ? 'شعبه' : 'شرکت'} *
                      </label>
                      <input
                        value={entityForm.companyName}
                        onChange={e => setEntityForm(f => ({ ...f, companyName: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={form.type === 'company' ? 'نام شعبه' : 'نام شرکت'}
                      />
                    </div>
                    {form.type === 'person' && (
                      <div>
                        <label className="block mb-2 text-sm font-medium text-gray-700">نوع شرکت</label>
                        <select
                          value={entityForm.companyType}
                          onChange={e => setEntityForm(f => ({ ...f, companyType: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                          <option value="manufacturing">تولیدی</option>
                          <option value="trading">بازرگانی</option>
                          <option value="service">خدماتی</option>
                          <option value="construction">ساختمانی</option>
                          <option value="other">سایر</option>
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">شماره ثبت</label>
                      <input
                        value={entityForm.registrationNumber}
                        onChange={e => setEntityForm(f => ({ ...f, registrationNumber: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="شماره ثبت"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">شناسه ملی</label>
                      <input
                        value={entityForm.nationalId}
                        onChange={e => setEntityForm(f => ({ ...f, nationalId: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="شناسه ملی"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">کد اقتصادی</label>
                      <input
                        value={entityForm.economicCode}
                        onChange={e => setEntityForm(f => ({ ...f, economicCode: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="کد اقتصادی"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">تلفن</label>
                      <input
                        value={entityForm.phone}
                        onChange={e => setEntityForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="تلفن"
                      />
                    </div>
                    <div>
                      <label className="block mb-2 text-sm font-medium text-gray-700">ایمیل</label>
                      <input
                        type="email"
                        value={entityForm.email}
                        onChange={e => setEntityForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder="ایمیل"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block mb-2 text-sm font-medium text-gray-700">آدرس</label>
                      <textarea
                        value={entityForm.address}
                        onChange={e => setEntityForm(f => ({ ...f, address: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={form.type === 'company' ? 'آدرس شعبه' : 'آدرس شرکت'}
                        rows="2"
                      />
                    </div>
                  </div>
                  
                  {/* نقشه برای شرکت/شعبه */}
                  <div className="mt-4">
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      موقعیت {form.type === 'company' ? 'شعبه' : 'شرکت'} روی نقشه
                    </label>
                    <div className="h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-300 relative">
                      <Map 
                        showSearch
                        onLocationSelect={({ latitude, longitude }) => setEntityForm(f => ({ ...f, latitude, longitude }))}
                        onMapClick={({ latitude, longitude }) => setEntityForm(f => ({ ...f, latitude, longitude }))}
                        markers={entityForm.latitude && entityForm.longitude ? [{ 
                          latitude: entityForm.latitude, 
                          longitude: entityForm.longitude, 
                          name: form.type === 'company' ? 'موقعیت شعبه' : 'موقعیت شرکت'
                        }] : []}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      type="button"
                      onClick={() => setShowCompanyForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      لغو
                    </button>
                    <button
                      type="button"
                      onClick={addEntity}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      افزودن {form.type === 'company' ? 'شعبه' : 'شرکت'}
                    </button>
                  </div>
                </div>
              )}

              {/* لیست شرکت‌ها/شعبه‌های اضافه شده */}
              {companies.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-md font-medium text-gray-700">
                    {form.type === 'company' ? 'شعبه‌های اضافه شده (مشتری حقوقی):' : 'شرکت‌های اضافه شده (مشتری حقیقی):'}
                  </h4>
                  {companies.map((entity, index) => (
                    <div key={entity.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-800">{entity.companyName}</h5>
                          <p className="text-sm text-gray-600">
                            {entity.registrationNumber && `شماره ثبت: ${entity.registrationNumber}`}
                            {entity.nationalId && ` | شناسه ملی: ${entity.nationalId}`}
                            {entity.entityType === 'branch' && ' | نوع: شعبه'}
                          </p>
                          {entity.latitude && entity.longitude && (
                            <p className="text-xs text-green-600 mt-1">
                              📍 موقعیت: {entity.latitude.toFixed(6)}, {entity.longitude.toFixed(6)}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCompany(entity.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>



        {/* پیام */}
        {message && (
          <div className={`text-sm rounded-lg px-4 py-3 ${
            message.includes('موفقیت') 
              ? 'text-green-800 bg-green-100 border border-green-200' 
              : 'text-red-800 bg-red-100 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* دکمه‌ها */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button 
            type="submit" 
            disabled={saving} 
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {saving ? "در حال ذخیره..." : "ثبت مشتری"}
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}


