"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ViewUser({ params }) {
  const router = useRouter();
  const { id: userId } = use(params);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(API_ENDPOINTS.users.getById(userId));
        const data = await response.json();

        if (data.success) {
          setUserData(data.data);
        } else {
          throw new Error(data.message || "خطا در دریافت اطلاعات کاربر");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message || "خطا در ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserData();
    }
  }, [userId]);

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

  if (!userData) {
    return (
      <div className="p-4 text-center">
        <p>اطلاعات کاربری یافت نشد.</p>
        <button
          onClick={() => router.back()}
          className="mt-4 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
        >
          بازگشت
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-4 md:p-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">مشاهده جزئیات کاربر</h1>

        <div className="space-y-4 text-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">نام:</p>
              <p>{userData.firstName}</p>
            </div>
            <div>
              <p className="font-semibold">نام خانوادگی:</p>
              <p>{userData.lastName}</p>
            </div>
            <div>
              <p className="font-semibold">نام کاربری:</p>
              <p>{userData.username}</p>
            </div>
            <div>
              <p className="font-semibold">ایمیل:</p>
              <p>{userData.email}</p>
            </div>
            <div>
              <p className="font-semibold">موبایل:</p>
              <p>{userData.mobile || '-'}</p>
            </div>
            <div>
              <p className="font-semibold">نام کسب و کار:</p>
              <p>{userData.businessName || '-'}</p>
            </div>
            <div>
              <p className="font-semibold">اطلاعات تماس کسب و کار:</p>
              <p>{userData.businessContactInfo || '-'}</p>
            </div>
            <div>
              <p className="font-semibold">نقش‌ها:</p>
              <p>
                {userData.roles && userData.roles.length > 0
                  ? userData.roles.map((role) => role.nameFa).join(", ")
                  : '-'}
              </p>
            </div>
            <div>
              <p className="font-semibold">تاریخ ایجاد:</p>
              <p>{new Date(userData.createdAt).toLocaleDateString("fa-IR")}</p>
            </div>
            <div>
              <p className="font-semibold">تاریخ آخرین به‌روزرسانی:</p>
              <p>{new Date(userData.updatedAt).toLocaleDateString("fa-IR")}</p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => router.push("/dashboard/user-management/users")}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              بازگشت به لیست کاربران
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 