"use client";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";

export default function Navbar() {
  const { user } = useAuth();
  return (
    <nav className="bg-sky-950  border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between" dir="rtl">
        {/* Brand on the right */}
        <Link href="/" className="text-xl sm:text-2xl font-bold text-sky-50">
          شرکت بازرسی مهندسی آریا فولاد قرن
        </Link>
        {/* Auth buttons on the left */}
        <div className="flex items-center gap-3">
          {/* از همان دکمه‌های احراز هویت موجود استفاده می‌شود */}
          <AuthButtonsWrapper />
        </div>
      </div>
    </nav>
  );
}

function AuthButtonsWrapper() {
  // تا از درخت وابستگی جلوگیری شود، اینجا ایمپورت داینامیک نکنیم
  const AuthButtons = require("@/app/components/AuthButtons").default;
  return <AuthButtons />;
}

