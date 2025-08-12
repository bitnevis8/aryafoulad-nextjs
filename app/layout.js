import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Footer from "./components/ui/Footer/Footer";
import Link from "next/link";
import { AuthProvider } from "./context/AuthContext";
import AuthButtons from "./components/AuthButtons";
import Navbar from "./components/layout/Navbar";
import DateBar from "./components/DateBar";

const vazirmatn = Vazirmatn({ 
  subsets: ["arabic"],
  display: 'swap',
  variable: '--font-vazirmatn',
});

export const metadata = {
  title: "سیستم حکم ماموریت",
  description: "سیستم مدیریت حکم ماموریت اریا فولاد",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fa" dir="rtl" className={vazirmatn.variable}>
      <body className={`${vazirmatn.className} min-h-screen flex flex-col`}>
        <AuthProvider>
         
          {/* حذف هدر بالایی */}
          <DateBar />
          <div className="min-h-screen w-full">
            {children}
          </div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
