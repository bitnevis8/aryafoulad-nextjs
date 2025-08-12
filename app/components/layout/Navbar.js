"use client";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-sky-950 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* We are in RTL globally; render buttons first so they sit on the visual right, and the brand second to sit on the visual left */}
        <div className="flex flex-row-reverse items-center justify-between">
          {/* Actions (visual right in RTL) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!user && (
              <>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium bg-sky-100 text-sky-900 hover:bg-sky-200 transition"
                >
                  ورود
                </Link>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition"
                >
                  ثبت نام
                </Link>
              </>
            )}
            {user && (
              <>
                <Link
                  href="/dashboard"
                  className="text-sky-50 text-xs sm:text-sm hover:underline"
                  title="ورود به داشبورد"
                >
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : (user?.fullName || user?.name || user?.username || "کاربر")}
                </Link>
              </>
            )}
          </div>

          {/* Brand (visual left in RTL) */}
          <Link href="/" className="text-sky-50 text-base sm:text-lg font-semibold hover:opacity-90">
            آریا فولاد قرن
          </Link>
        </div>
      </div>
    </header>
  );
}

