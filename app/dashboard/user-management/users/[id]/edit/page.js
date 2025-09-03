"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";
import dynamic from "next/dynamic";
const Map = dynamic(() => import("@/app/components/ui/Map/Map"), { ssr: false });

const EditUserPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    mobile: "",
    phone: "",
    businessName: "",
    businessContactInfo: "",
    roleIds: [],
    type: "person"
  });
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // مدیریت شرکت‌ها/شعبه‌ها
  const [companies, setCompanies] = useState([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch user data
        const userResponse = await fetch(API_ENDPOINTS.users.getById(id));
        const userData = await userResponse.json();
        if (userData.success) {
          setFormData({
            firstName: userData.data.firstName || "",
            lastName: userData.data.lastName || "",
            username: userData.data.username || "",
            email: userData.data.email || "",
            mobile: userData.data.mobile || "",
            phone: userData.data.phone || "",
            businessName: userData.data.businessName || "",
            businessContactInfo: userData.data.businessContactInfo || "",
            roleIds: userData.data.roles ? userData.data.roles.map(role => role.id) : [],
            type: userData.data.type || "person"
          });
        } else {
          setError(userData.message || "خطا در دریافت اطلاعات کاربر");
        }
        
        // بارگذاری شرکت‌ها/شعبه‌ها
        try {
          const companiesResponse = await fetch(API_ENDPOINTS.customerCompanies.getByCustomerId(id));
          const companiesData = await companiesResponse.json();
          if (companiesData.success) {
            setCompanies(companiesData.data || []);
          }
        } catch (err) {
          console.error("Error fetching companies:", err);
        }
      } catch (err) {
        setError(err.message || "خطا در ارتباط با سرور هنگام دریافت کاربر");
        console.error("Error fetching user:", err);
      } finally {
        setLoadingUser(false);
      }

      try {
        // Fetch roles data
        const rolesResponse = await fetch(API_ENDPOINTS.roles.getAll);
        const rolesData = await rolesResponse.json();
        if (rolesData.success) {
          setRoles(rolesData.data || []);
        } else {
          setError(rolesData.message || "خطا در دریافت لیست نقش‌ها");
        }
      } catch (err) {
        setError(err.message || "خطا در ارتباط با سرور هنگام دریافت نقش‌ها");
        console.error("Error fetching roles:", err);
      } finally {
        setLoadingRoles(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRoleChange = (e) => {
    const { options } = e.target;
    const selectedRoleIds = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => parseInt(option.value, 10));
    setFormData({ ...formData, roleIds: selectedRoleIds });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(API_ENDPOINTS.users.update(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("کاربر با موفقیت بروزرسانی شد.");
        router.push("/dashboard/user-management/users");
      } else {
        setError(data.message || "خطا در بروزرسانی کاربر");
      }
    } catch (err) {
      setError(err.message || "خطا در ارتباط با سرور");
      console.error("Error updating user:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // تنظیم entityType بر اساس نوع مشتری
  useEffect(() => {
    setEntityForm(prev => ({
      ...prev,
      entityType: formData.type === 'company' ? 'branch' : 'company'
    }));
  }, [formData.type]);

  const addEntity = async () => {
    if (!entityForm.companyName) {
      const entityTypeText = formData.type === 'company' ? 'شعبه' : 'شرکت';
      alert(`لطفاً نام ${entityTypeText} را وارد کنید`);
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.customerCompanies.create, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          customerId: id,
          ...entityForm
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setCompanies(prev => [...prev, data.data]);
        resetEntityForm();
        setShowCompanyForm(false);
      } else {
        alert(data.message || 'خطا در ایجاد شرکت/شعبه');
      }
    } catch (err) {
      alert('خطا در ایجاد شرکت/شعبه');
    }
  };

  const editEntity = (company) => {
    setEditingCompany(company);
    setEntityForm({
      companyName: company.companyName,
      entityType: company.entityType,
      companyType: company.companyType,
      registrationNumber: company.registrationNumber,
      nationalId: company.nationalId,
      economicCode: company.economicCode,
      phone: company.phone,
      email: company.email,
      address: company.address,
      latitude: company.latitude,
      longitude: company.longitude,
      description: company.description
    });
    setShowCompanyForm(true);
  };

  const updateEntity = async () => {
    if (!entityForm.companyName) {
      const entityTypeText = formData.type === 'company' ? 'شعبه' : 'شرکت';
      alert(`لطفاً نام ${entityTypeText} را وارد کنید`);
      return;
    }
    
    try {
      const response = await fetch(API_ENDPOINTS.customerCompanies.update(editingCompany.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(entityForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setCompanies(prev => prev.map(c => c.id === editingCompany.id ? data.data : c));
        resetEntityForm();
        setShowCompanyForm(false);
        setEditingCompany(null);
      } else {
        alert(data.message || 'خطا در به‌روزرسانی شرکت/شعبه');
      }
    } catch (err) {
      alert('خطا در به‌روزرسانی شرکت/شعبه');
    }
  };

  const deleteEntity = async (companyId) => {
    if (!confirm('آیا از حذف این شرکت/شعبه اطمینان دارید؟')) return;
    
    try {
      const response = await fetch(API_ENDPOINTS.customerCompanies.delete(companyId), {
        method: "DELETE",
        credentials: "include"
      });
      
      const data = await response.json();
      if (data.success) {
        setCompanies(prev => prev.filter(c => c.id !== companyId));
      } else {
        alert(data.message || 'خطا در حذف شرکت/شعبه');
      }
    } catch (err) {
      alert('خطا در حذف شرکت/شعبه');
    }
  };

  const resetEntityForm = () => {
    setEntityForm({
      companyName: "",
      entityType: formData.type === 'company' ? 'branch' : 'company',
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
  };

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">ویرایش کاربر</h1>

        {loadingUser || loadingRoles ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">نام:</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی:</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">نوع مشتری:</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="person">حقیقی</option>
                  <option value="company">حقوقی</option>
                </select>
              </div>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">نام کاربری:</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">ایمیل:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  required
                />
              </div>
              <div>
                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">موبایل:</label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">تلفن:</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">نام کسب و کار (اختیاری):</label>
                <input
                  type="text"
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="businessContactInfo" className="block text-sm font-medium text-gray-700 mb-1">اطلاعات تماس کسب و کار (اختیاری):</label>
                <input
                  type="text"
                  id="businessContactInfo"
                  name="businessContactInfo"
                  value={formData.businessContactInfo}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label htmlFor="roleIds" className="block text-sm font-medium text-gray-700 mb-1">نقش‌ها:</label>
                <select
                  id="roleIds"
                  name="roleIds"
                  multiple
                  value={formData.roleIds}
                  onChange={handleRoleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm h-32"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.nameFa}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">برای انتخاب چندگانه، Ctrl (یا Cmd) را نگه دارید و کلیک کنید.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 rtl:space-x-reverse">
              <button
                type="button"
                onClick={() => router.push("/dashboard/user-management/users")}
                className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                بازگشت
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {submitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </button>
            </div>
          </form>
        )}

        {/* مدیریت شرکت‌ها/شعبه‌ها */}
        {!loadingUser && !error && (
          <div className="mt-8 border-t pt-8">
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>راهنما:</strong> 
                {formData.type === 'company' 
                  ? ' مشتری حقوقی می‌تواند چندین شعبه داشته باشد. هر شعبه لوکیشن مخصوص خودش را دارد که باید روی نقشه مشخص شود.'
                  : ' مشتری حقیقی می‌تواند چندین شرکت داشته باشد. هر شرکت لوکیشن مخصوص خودش را دارد که باید روی نقشه مشخص شود.'
                }
              </p>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {formData.type === 'company' ? 'شعبه‌های مشتری حقوقی' : 'شرکت‌های مشتری حقیقی'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setEditingCompany(null);
                  resetEntityForm();
                  setShowCompanyForm(!showCompanyForm);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {showCompanyForm ? 'لغو' : (formData.type === 'company' ? 'افزودن شعبه' : 'افزودن شرکت')}
              </button>
            </div>

            {/* فرم افزودن/ویرایش شرکت/شعبه */}
            {showCompanyForm && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-md font-medium text-gray-700 mb-4">
                  {editingCompany 
                    ? `ویرایش ${formData.type === 'company' ? 'شعبه' : 'شرکت'}` 
                    : `اطلاعات ${formData.type === 'company' ? 'شعبه جدید (مشتری حقوقی)' : 'شرکت جدید (مشتری حقیقی)'}`
                  }
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      نام {formData.type === 'company' ? 'شعبه' : 'شرکت'} *
                    </label>
                    <input
                      value={entityForm.companyName}
                      onChange={e => setEntityForm(f => ({ ...f, companyName: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder={formData.type === 'company' ? 'نام شعبه' : 'نام شرکت'}
                    />
                  </div>
                  {formData.type === 'person' && (
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
                      placeholder={formData.type === 'company' ? 'آدرس شعبه' : 'آدرس شرکت'}
                      rows="2"
                    />
                  </div>
                </div>
                
                {/* نقشه برای شرکت/شعبه */}
                <div className="mt-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700">
                    موقعیت {formData.type === 'company' ? 'شعبه' : 'شرکت'} روی نقشه
                  </label>
                  <div className="h-64 sm:h-80 rounded-lg overflow-hidden border border-gray-300 relative">
                    <Map 
                      showSearch
                      onLocationSelect={({ latitude, longitude }) => setEntityForm(f => ({ ...f, latitude, longitude }))}
                      onMapClick={({ latitude, longitude }) => setEntityForm(f => ({ ...f, latitude, longitude }))}
                      markers={entityForm.latitude && entityForm.longitude ? [{ 
                        latitude: entityForm.latitude, 
                        longitude: entityForm.longitude, 
                        name: formData.type === 'company' ? 'موقعیت شعبه' : 'موقعیت شرکت'
                      }] : []}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyForm(false);
                      setEditingCompany(null);
                      resetEntityForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    لغو
                  </button>
                  <button
                    type="button"
                    onClick={editingCompany ? updateEntity : addEntity}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCompany ? 'به‌روزرسانی' : 'افزودن'} {formData.type === 'company' ? 'شعبه' : 'شرکت'}
                  </button>
                </div>
              </div>
            )}

            {/* لیست شرکت‌ها/شعبه‌های موجود */}
            {companies.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">
                  {formData.type === 'company' ? 'شعبه‌های موجود:' : 'شرکت‌های موجود:'}
                </h4>
                {companies.map((entity, index) => (
                  <div key={entity.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
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
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editEntity(entity)}
                          className="px-3 py-1 text-blue-600 hover:text-blue-800 transition-colors text-sm"
                        >
                          ویرایش
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEntity(entity.id)}
                          className="px-3 py-1 text-red-600 hover:text-red-800 transition-colors text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUserPage; 