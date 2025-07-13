"use client";

import Sidebar from '../components/ui/Sidebar';
import { useState } from "react";
import { API_ENDPOINTS } from "@/app/config/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardLayout({ children }) {
  const [emailVerificationCode, setEmailVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccess, setVerificationSuccess] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user, loading, setUser } = useAuth ? useAuth() : { user: null, loading: false, setUser: undefined };

  const handleVerifyEmail = async () => {
    setVerificationError(null);
    setVerificationSuccess(null);
    if (!user || !user.email) {
      setVerificationError("اطلاعات کاربر یا ایمیل در دسترس نیست.");
      return;
    }
    if (!emailVerificationCode) {
      setVerificationError("لطفا کد تایید را وارد کنید.");
      return;
    }

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, code: emailVerificationCode }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationSuccess(data.message);
        if (setUser) setUser({ ...user, isEmailVerified: true });
      } else {
        setVerificationError(data.message || "خطا در تایید ایمیل.");
      }
    } catch (error) {
      console.error("Error verifying email:", error);
      setVerificationError("خطا در ارتباط با سرور.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleResendCode = async () => {
    setResendLoading(true);
    setVerificationError(null);
    setVerificationSuccess(null);
    if (!user || !user.email) {
      setVerificationError("اطلاعات کاربر یا ایمیل در دسترس نیست.");
      setResendLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/resend-email-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await response.json();
      if (data.success) {
        setVerificationSuccess(data.message);
      } else {
        setVerificationError(data.message || "خطا در ارسال مجدد کد.");
      }
    } catch (error) {
      console.error("Error resending code:", error);
      setVerificationError("خطا در ارتباط با سرور.");
    } finally {
      setResendLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    if (setUser) setUser(null);
    if (typeof window !== 'undefined') localStorage.clear();
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100">
      {/* Mobile Sidebar Toggle Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 rounded-md bg-gray-800 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} 
          fixed top-0 right-0 h-full w-64 bg-gray-800 text-white z-50 md:relative md:translate-x-0 md:w-64 md:flex-shrink-0`}
      >
        <Sidebar onLinkClick={() => setIsSidebarOpen(false)} />
      </aside>
      
      {/* Main content */}
      <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'md:mr-64' : 'md:mr-0'}`}
      >
        {/* Header with company name */}

        
        {user && user.email && !user.isEmailVerified && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
            <p className="font-bold">ایمیل شما تایید نشده است!</p>
            <p className="text-sm">لطفا کد تایید ارسال شده به ایمیل خود ({user.email}) را وارد کنید تا حساب کاربری شما فعال شود.</p>
            
            {verificationError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-3">
                {verificationError}
              </div>
            )}
            {verificationSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-3">
                {verificationSuccess}
              </div>
            )}

            <div className="mt-4 flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 rtl:space-x-reverse">
              <input
                type="text"
                placeholder="کد تایید را وارد کنید"
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={emailVerificationCode || ""}
                onChange={(e) => setEmailVerificationCode(e.target.value)}
              />
              <button
                onClick={handleVerifyEmail}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                تایید ایمیل
              </button>
              <button
                onClick={handleResendCode}
                disabled={resendLoading}
                className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out"
              >
                {resendLoading ? "در حال ارسال..." : "ارسال مجدد کد"}
              </button>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
