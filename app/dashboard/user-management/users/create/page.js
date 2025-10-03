"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";

export default function CreateUser() {
  const router = useRouter();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    type: "person", // پیش‌فرض: حقیقی
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    phone: "",
    fax: "",
    username: "",
    password: "",
    roleIds: [],
    signature: null,
    // فیلدهای مخصوص کاربر حقوقی
    companyName: "",
    nationalId: "",
    economicCode: "",
    registrationNumber: "",
    // آدرس
    address: "",
    province: "",
    city: "",
    postalCode: "",
  });

  useEffect(() => {
    // دریافت لیست نقش‌ها
    fetch(API_ENDPOINTS.roles.getAll)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setRoles(data.data || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, options } = e.target;

    setFormData((prev) => {
      if (name === "roleIds") {
        const selectedRoles = Array.from(options)
          .filter(option => option.selected)
          .map(option => parseInt(option.value, 10));
        return {
          ...prev,
          [name]: selectedRoles,
        };
      } else if (name === "type") {
        // وقتی نوع کاربر تغییر می‌کند، فیلدهای مربوطه را پاک کن
        return {
          ...prev,
          [name]: value,
          // پاک کردن فیلدهای مربوط به نوع قبلی
          firstName: value === "person" ? prev.firstName : "",
          lastName: value === "person" ? prev.lastName : "",
          companyName: value === "company" ? prev.companyName : "",
          nationalId: "",
          economicCode: "",
          registrationNumber: "",
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  const handleSignatureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      setError('لطفاً یک فایل تصویری انتخاب کنید');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('حجم فایل نباید بیشتر از 5 مگابایت باشد');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('signature', file);

      const response = await fetch(API_ENDPOINTS.signatures.upload, {
        method: 'POST',
        body: formData,
        credentials: 'include', // برای ارسال کوکی‌های احراز هویت
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          signature: data.data.filename // ذخیره نام فایل به جای URL کامل
        }));
        setError(null); // پاک کردن خطاهای قبلی
        console.log('Signature uploaded successfully:', data.data.filename);
      } else {
        setError(data.message || 'خطا در آپلود امضا');
      }
    } catch (error) {
      setError('خطا در آپلود فایل');
      console.error('Signature upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureDelete = async () => {
    if (!formData.signature) return;

    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.signatures.delete(formData.signature), {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({
          ...prev,
          signature: null
        }));
        setError(null);
        console.log('Signature deleted successfully');
      } else {
        setError(data.message || 'خطا در حذف امضا');
      }
    } catch (error) {
      setError('خطا در حذف فایل');
      console.error('Signature delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // اعتبارسنجی فیلدهای اجباری
    if (!formData.mobile) {
      setError("لطفاً شماره موبایل را وارد کنید");
      setLoading(false);
      return;
    }
    
    if (formData.type === "person" && !formData.firstName) {
      setError("لطفاً نام را وارد کنید");
      setLoading(false);
      return;
    }
    
    if (formData.type === "person" && !formData.lastName) {
      setError("لطفاً نام خانوادگی را وارد کنید");
      setLoading(false);
      return;
    }
    
    if (formData.type === "company" && !formData.companyName) {
      setError("لطفاً نام شرکت را وارد کنید");
      setLoading(false);
      return;
    }

    try {
      // آماده‌سازی داده‌ها بر اساس نوع کاربر
      const submitData = {
        ...formData,
        // برای کاربر حقیقی
        ...(formData.type === "person" && {
          firstName: formData.firstName,
          lastName: formData.lastName,
        }),
        // برای کاربر حقوقی
        ...(formData.type === "company" && {
          companyName: formData.companyName,
          nationalId: formData.nationalId,
          economicCode: formData.economicCode,
          registrationNumber: formData.registrationNumber,
        }),
        // آدرس و تماس
        address: formData.address || null,
        province: formData.province || null,
        city: formData.city || null,
        postalCode: formData.postalCode || null,
        fax: formData.fax || null,
      };

      const response = await fetch(API_ENDPOINTS.users.create, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard/user-management/users");
      } else {
        setError(data.message || "خطا در ایجاد کاربر");
      }
    } catch (error) {
      setError("خطا در ارتباط با سرور");
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">افزودن کاربر جدید</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* انتخاب نوع کاربر */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              نوع کاربر
            </label>
            <div className="flex space-x-4 rtl:space-x-reverse">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="person"
                  checked={formData.type === "person"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">حقیقی</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="company"
                  checked={formData.type === "company"}
                  onChange={handleChange}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">حقوقی</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* فیلدهای کاربر حقیقی */}
            {formData.type === "person" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام خانوادگی <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {/* فیلدهای کاربر حقوقی */}
            {formData.type === "company" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نام شرکت <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    کد ملی شرکت
                  </label>
                  <input
                    type="text"
                    name="nationalId"
                    value={formData.nationalId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    کد اقتصادی
                  </label>
                  <input
                    type="text"
                    name="economicCode"
                    value={formData.economicCode}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    شماره ثبت
                  </label>
                  <input
                    type="text"
                    name="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل (اختیاری)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                موبایل <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تلفن ثابت (اختیاری)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نمابر (اختیاری)</label>
              <input
                type="text"
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام کاربری (اختیاری)
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">استان (اختیاری)</label>
              <input
                type="text"
                name="province"
                value={formData.province}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">شهر (اختیاری)</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پستی ۱۰ رقمی (اختیاری)</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                inputMode="numeric"
                pattern="\d{10}"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">نشانی (اختیاری)</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نقش‌ها
              </label>
              <select
                name="roleIds"
                value={formData.roleIds.map(String)}
                onChange={handleChange}
                multiple
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.nameFa || role.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                امضا (اختیاری)
              </label>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSignatureUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {formData.signature && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-green-600">امضا با موفقیت آپلود شد</p>
                      <button
                        type="button"
                        onClick={handleSignatureDelete}
                        disabled={loading}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        حذف امضا
                      </button>
                    </div>
                    <img 
                      src={API_ENDPOINTS.signatures.download(formData.signature)} 
                      alt="امضا" 
                      className="max-w-xs max-h-32 border border-gray-300 rounded"
                      onError={(e) => {
                        console.error('Error loading signature image:', e);
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {
                        console.log('Signature image loaded successfully');
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "در حال ثبت..." : "ثبت کاربر"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 