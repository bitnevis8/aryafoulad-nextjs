"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";

export default function EditUser({ params }) {
  const router = useRouter();
  const userId = use(params).id;
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    phone: "",
    username: "",
    password: "",
    roleIds: [],
    type: "person"
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    // دریافت اطلاعات کاربر و لیست نقش‌ها
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [userResponse, rolesResponse] = await Promise.all([
          fetch(API_ENDPOINTS.users.getById(userId)),
          fetch(API_ENDPOINTS.roles.getAll)
        ]);

        if (!userResponse.ok || !rolesResponse.ok) {
          throw new Error("خطا در دریافت اطلاعات");
        }

        const [userData, rolesData] = await Promise.all([
          userResponse.json(),
          rolesResponse.json()
        ]);

        if (userData.success) {
          const { password, ...userInfo } = userData.data;
          // تبدیل مقادیر null به رشته خالی
          const sanitizedUserInfo = Object.fromEntries(
            Object.entries(userInfo).map(([key, value]) => [key, value ?? ""])
          );
          // Map roles to roleIds array
          setFormData({
            ...sanitizedUserInfo,
            roleIds: userData.data.roles ? userData.data.roles.map(role => role.id) : [],
            type: userData.data.type || "person"
          });
        } else {
          throw new Error(userData.message || "خطا در دریافت اطلاعات کاربر");
        }
        
        // بارگذاری شرکت‌ها/شعبه‌ها
        try {
          const companiesResponse = await fetch(API_ENDPOINTS.customerCompanies.getByCustomerId(userId));
          const companiesData = await companiesResponse.json();
          if (companiesData.success) {
            setCompanies(companiesData.data || []);
          }
        } catch (err) {
          console.error("Error fetching companies:", err);
        }

        if (rolesData.success) {
          setRoles(rolesData.data || []);
        } else {
          throw new Error(rolesData.message || "خطا در دریافت لیست نقش‌ها");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.message || "خطا در ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, options } = e.target;

    setFormData((prev) => {
      if (name === "roleIds") {
        // Handle multiple selections for roleIds
        const selectedRoles = Array.from(options)
          .filter(option => option.selected)
          .map(option => parseInt(option.value, 10));
        return {
          ...prev,
          [name]: selectedRoles,
        };
      } else {
        return {
          ...prev,
          [name]: value,
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(API_ENDPOINTS.users.update(userId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("خطا در ارسال درخواست");
      }

      const data = await response.json();

      if (data.success) {
        router.push("/dashboard/user-management/users");
      } else {
        throw new Error(data.message || "خطا در ویرایش کاربر");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError(error.message || "خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
          >
            بازگشت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">ویرایش کاربر</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام خانوادگی
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ایمیل
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                موبایل
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                تلفن ثابت
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نام کاربری
              </label>
              <input
                type="text"
                name="username"
                value={formData.username || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                رمز عبور (خالی بگذارید اگر نمی‌خواهید تغییر کند)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password || ""}
                onChange={handleChange}
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
              {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </button>
          </div>
        </form>

        {/* نمایش شرکت‌ها/شعبه‌ها */}
        <div className="mt-8 border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {formData.type === 'company' ? 'شعبه‌های مشتری حقوقی' : 'شرکت‌های مشتری حقیقی'}
          </h3>
          
          {companies.length > 0 ? (
            <div className="space-y-3">
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
                      {entity.address && (
                        <p className="text-xs text-gray-500 mt-1">
                          📍 آدرس: {entity.address}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>هیچ {formData.type === 'company' ? 'شعبه' : 'شرکت'}‌ای ثبت نشده است.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 