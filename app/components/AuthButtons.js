"use client";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function AuthButtons() {
  const { user, loading } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  if (loading) return null;

  if (user) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          className="flex items-center space-x-1 text-white hover:text-gray-200 font-semibold py-2.5 px-4 rounded-lg text-sm sm:text-base transition-all duration-300 bg-gray-700 hover:bg-gray-600 shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md">
            {user.firstName ? user.firstName.charAt(0) : user.email.charAt(0).toUpperCase()}
          </div>
          <span className="ml-2">
            {user.firstName && user.lastName 
              ? `${user.firstName} ${user.lastName}`
              : user.email
            }
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isUserMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsUserMenuOpen(false)}
            ></div>
            <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-xl shadow-2xl border border-gray-200 z-40 overflow-hidden">
              <div className="py-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block w-full text-right px-5 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 transition-all duration-200 font-medium"
                >
                  🏠 داشبورد
                </Link>
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await fetch("/api/auth/logout", {
                      method: "POST",
                      credentials: "include",
                    });
                    if (typeof window !== 'undefined') {
                      localStorage.clear();
                      window.location.href = "/";
                    }
                  }}
                  className="w-full text-right px-5 py-3 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 transition-all duration-200 font-medium"
                >
                  🚪 خروج
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 rtl:space-x-reverse">
      <Link 
        href="/auth/register" 
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm sm:text-base text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        ثبت نام
      </Link>
      <Link 
        href="/auth/login" 
        className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2.5 px-6 rounded-lg text-sm sm:text-base text-center transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        ورود
      </Link>
    </div>
  );
} 