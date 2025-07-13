import { Vazirmatn } from "next/font/google";
import "./globals.css";
import Footer from "./components/ui/Footer/Footer";
import Link from "next/link";
import { AuthProvider } from "./context/AuthContext";
import AuthButtons from "./components/AuthButtons";
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
          <nav className="bg-gradient-to-r from-sky-950 to-sky-900 py-4 sm:py-5 px-0 text-white shadow-lg border-b border-gray-700">
            <div className="px-8 mx-auto flex flex-col sm:flex-row-reverse justify-between items-center">
              <AuthButtons />
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-bold mb-3 sm:mb-0 bg-gradient-to-r from-sky-50 to-sky-100 bg-clip-text text-transparent hover:from-sky-50 hover:to-sky-200 transition-all duration-300 transform hover:scale-105"
              >
                آریا فولاد قرن
              </Link>
            </div>
          </nav>
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
