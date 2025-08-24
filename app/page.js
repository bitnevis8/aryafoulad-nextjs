"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import Map from '@/app/components/ui/Map/Map';

export default function Home() {
  const companyLat = 31.348808655624506;
  const companyLng = 48.72288275224326;
  const googleMapsUrl = `https://www.google.com/maps?q=${companyLat},${companyLng}`;
  const wazeUrl = `https://waze.com/ul?ll=${companyLat}%2C${companyLng}&navigate=yes`;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Background Image */}
      <div className="relative h-[70vh] md:h-[80vh]">
        <Image
          src="/images/background.webp"
          alt="Arya Foulad Gharn Background"
          fill
          className="object-cover brightness-75"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-950/70 to-sky-900/30 flex items-center">
          <div className="container mx-auto px-4 md:px-6 lg:px-8 text-white">
            <div className="max-w-3xl backdrop-blur-sm/0">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 ring-1 ring-white/20 text-xs sm:text-sm">کیفیت، ایمنی، استاندارد</span>
              <h1 className="mt-4 text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight">
                شرکت بازرسی مهندسی آریا فولاد قرن
              </h1>
              <p className="mt-4 text-base sm:text-xl md:text-2xl text-sky-100">
                راهکارهای حرفه‌ای برای بازرسی فنی، کنترل کیفیت و صدور گواهی‌نامه‌های استاندارد
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/projects/request" className="px-5 py-3 rounded-lg bg-sky-500 hover:bg-sky-600 text-white shadow-lg hover:shadow-xl transition">ثبت درخواست بازرسی</Link>
                <Link href="/dashboard" className="px-5 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white ring-1 ring-white/20 transition">ورود به داشبورد</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="py-8 sm:py-10 md:py-12 bg-gradient-to-b from-white to-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-900">10+<span className="text-sky-600"> سال</span></div>
            <div className="text-gray-600 text-sm mt-1">تجربه بازرسی</div>
          </div>
          <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-900">1500+</div>
            <div className="text-gray-600 text-sm mt-1">پروژه بازرسی شده</div>
          </div>
          <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-900">120+</div>
            <div className="text-gray-600 text-sm mt-1">مشتری شرکتی</div>
          </div>
          <div className="p-5 rounded-xl bg-white shadow-sm border border-gray-100 text-center">
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-900">AWS, ASME, EN</div>
            <div className="text-gray-600 text-sm mt-1">پوشش استانداردها</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-10 md:mb-12 text-gray-800">
            حوزه‌های تخصصی
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-5 sm:p-6 rounded-2xl text-right shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="text-sky-700 text-3xl sm:text-4xl mb-3 sm:mb-4">📦</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">بازرسی کالای صادراتی و وارداتی</h3>
              <p className="text-sm sm:text-base text-gray-600">بازرسی کمی و کیفی کالا پیش از گشایش اعتبار و پیش از حمل برای اطمینان از کیفیت و تحویل به‌موقع</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-5 sm:p-6 rounded-2xl text-right shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="text-sky-700 text-3xl sm:text-4xl mb-3 sm:mb-4">🏭</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">بازرسی حین ساخت قطعات صنعتی</h3>
              <p className="text-sm sm:text-base text-gray-600">کنترل فرآیند ساخت، جوشکاری، ابعادی و پذیرش نهایی طبق مشخصات فنی</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-5 sm:p-6 rounded-2xl text-right shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="text-sky-700 text-3xl sm:text-4xl mb-3 sm:mb-4">🛗</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">بازرسی آسانسور، بالابر و جرثقیل‌ها</h3>
              <p className="text-sm sm:text-base text-gray-600">مطابق EN81، ASME و استاندارد ملی؛ بازرسی ایمنی، کارکرد و صدور تأییدیه</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-5 sm:p-6 rounded-2xl text-right shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="text-sky-700 text-3xl sm:text-4xl mb-3 sm:mb-4">⚙️</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">بازرسی مواد اولیه صنعتی</h3>
              <p className="text-sm sm:text-base text-gray-600">کنترل مشخصات متالورژیکی و مکانیکی مواد اولیه برای تضمین کیفیت ساخت</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-5 sm:p-6 rounded-2xl text-right shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="text-sky-700 text-3xl sm:text-4xl mb-3 sm:mb-4">🧪</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">بازرسی خوردگی فلزات</h3>
              <p className="text-sm sm:text-base text-gray-600">ارزیابی خوردگی، HIC، NACE و ارائه راهکارهای پیشگیرانه و اصلاحی</p>
            </div>
            <div className="bg-white/70 backdrop-blur-md border border-gray-100 p-5 sm:p-6 rounded-2xl text-right shadow-lg hover:-translate-y-1 hover:shadow-xl transition">
              <div className="text-sky-700 text-3xl sm:text-4xl mb-3 sm:mb-4">🛢️</div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">بازرسی تجهیزات نفت، گاز و پتروشیمی</h3>
              <p className="text-sm sm:text-base text-gray-600">بازرسی خطوط لوله، مخازن تحت فشار، جوش و آزمون‌های مخرب/غیرمخرب</p>
            </div>
          </div>
        </div>
      </div>

      {/* Process */}
      <section className="py-12 sm:py-16 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800">فرآیند همکاری با ما</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { no: 1, title: 'ثبت درخواست', desc: 'ارسال اطلاعات پروژه و نیازمندی‌ها' },
              { no: 2, title: 'بررسی و اعلام هزینه', desc: 'برآورد هزینه و زمان اجرای بازرسی' },
              { no: 3, title: 'انجام بازرسی', desc: 'اعزام تیم متخصص و اجرای آزمون‌ها' },
              { no: 4, title: 'گزارش و گواهی', desc: 'تحویل گزارش نهایی و صدور گواهی‌ها' },
            ].map(step => (
              <div key={step.no} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold mb-3">{step.no}</div>
                <div className="font-semibold text-gray-800 mb-1">{step.title}</div>
                <div className="text-gray-600 text-sm">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Activities as Cards */}
      <section className="py-12 sm:py-16 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-center text-gray-800">زمینه‌های فعالیت</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">1</div>
                <p className="text-gray-700 leading-relaxed">بازرسی آسانسور و بالابرها بر اساس EN81، ASME و استاندارد ملی ۱-۶۳۰۳</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">2</div>
                <p className="text-gray-700 leading-relaxed">بازرسی زمین‌های بازی و تجهیزات بادی در مراحل طراحی، نصب و بهره‌برداری</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">3</div>
                <p className="text-gray-700 leading-relaxed">بازرسی کالای وارداتی و صادراتی پیش از گشایش اعتبار و پیش از حمل</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">4</div>
                <p className="text-gray-700 leading-relaxed">بازرسی حین ساخت قطعات و تجهیزات صنعتی، مواد اولیه، خطوط لوله و مخازن تحت فشار</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">5</div>
                <p className="text-gray-700 leading-relaxed">انجام آزمون‌های مخرب و غیرمخرب، بازرسی جوش و نمونه‌برداری</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">6</div>
                <p className="text-gray-700 leading-relaxed">برنامه‌ریزی و کنترل پروژه‌های صنعتی، نگهداری و تعمیرات، طراحی صنعتی</p>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg transition md:col-span-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">7</div>
                <p className="text-gray-700 leading-relaxed">تدوین دانش فنی و سواخت، مشاوره سیستم‌های مدیریت و بهبود کیفیت</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <div className="py-10 sm:py-16 md:py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 text-center">درباره شرکت</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-lg p-5 sm:p-6 shadow">
              <h3 className="font-semibold text-gray-800 mb-3">مشخصات ثبتی</h3>
              <ul className="text-gray-700 text-sm sm:text-base space-y-2 list-disc pr-5">
                <li>شماره و محل ثبت: ۸۸۴۲۲ – اهواز</li>
                <li>نوع شرکت: سهامی خاص</li>
                <li>نام شرکت: شركت فنی مهندسی آريا فولاد قرن</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-0 sm:p-0 shadow overflow-hidden">
              <div className="h-72">
                <Map center={[companyLat, companyLng]} markers={[{ latitude: companyLat, longitude: companyLng, name: 'دفتر مرکزی' }]} showControls={true} allowSelect={false} />
              </div>
              <div className="p-4 border-t flex items-center justify-between gap-2">
                <span className="text-sm text-gray-700">موقعیت شرکت روی نقشه</span>
                <div className="flex items-center gap-2">
                  <Link href={googleMapsUrl} target="_blank" className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">بازکردن در Google Maps</Link>
                  <Link href={wazeUrl} target="_blank" className="px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm">مسیر با Waze</Link>
                  <button onClick={() => navigator.share && navigator.share({ title: 'موقعیت شرکت', url: googleMapsUrl }).catch(()=>{})}
                    className="px-3 py-1.5 rounded-md bg-sky-100 hover:bg-sky-200 text-sky-800 text-sm">
                    اشتراک‌گذاری
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-r from-sky-950 to-sky-900 text-white text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">نیاز به بازرسی یا صدور گواهی دارید؟</h3>
          <p className="text-sky-100 mb-8">همین حالا درخواست خود را ثبت کنید تا کارشناسان ما با شما تماس بگیرند.</p>
          <Link href="/projects/request" className="inline-block px-6 py-3 bg-white text-sky-900 font-semibold rounded-md hover:bg-sky-100">ثبت درخواست بازرسی</Link>
        </div>
      </div>

      {/* Contact */}
      <div className="py-12 bg-white px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">تماس با ما</h3>
            <p className="text-gray-700">شنبه تا چهارشنبه: ۸ تا ۱۶، پنجشنبه: ۸ تا ۱۲</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">آدرس</h3>
            <p className="text-gray-700">اهواز، زیتون کارمندی، خیابان جهانگیری، بین زیبا و انوشه، پلاک ۳۳</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">راه‌های ارتباطی</h3>
            <p className="text-gray-700">تلفن: ۰۶۱-۳۴۴۳۷۴۳۹</p>
            <p className="text-gray-700">ایمیل: info@afg-insp.ir</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivitiesSlider() {
  const items = [
    'بازرسی آسانسور و بالابرها بر اساس EN81، ASME و استاندارد ملی ۱-۶۳۰۳',
    'بازرسی زمین‌های بازی و تجهیزات بادی در مراحل طراحی، نصب و بهره‌برداری',
    'بازرسی کالای وارداتی و صادراتی پیش از گشایش اعتبار و پیش از حمل',
    'بازرسی حین ساخت قطعات و تجهیزات صنعتی، مواد اولیه، خطوط لوله و مخازن تحت فشار',
    'انجام آزمون‌های مخرب و غیرمخرب، بازرسی جوش و نمونه‌برداری',
    'برنامه‌ریزی و کنترل پروژه‌های صنعتی، نگهداری و تعمیرات، طراحی صنعتی',
    'تدوین دانش فنی و سواخت، مشاوره سیستم‌های مدیریت و بهبود کیفیت',
  ];

  const [page, setPage] = useState(0);
  const pageSize = 3; // هر اسلاید 3 کارت
  const totalPages = Math.ceil(items.length / pageSize);
  const currentItems = useMemo(() => items.slice(page * pageSize, page * pageSize + pageSize), [page]);

  const prev = () => setPage((p) => (p === 0 ? totalPages - 1 : p - 1));
  const next = () => setPage((p) => (p === totalPages - 1 ? 0 : p + 1));

  return (
    <div className="relative">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {currentItems.map((text, idx) => (
          <div key={idx} className="bg-white/80 backdrop-blur rounded-2xl border border-gray-100 p-6 shadow hover:shadow-lg hover:-translate-y-0.5 transition">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-sky-100 text-sky-700 font-bold shrink-0">{page * pageSize + idx + 1}</div>
              <p className="text-gray-700 leading-relaxed">{text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="mt-6 flex items-center justify-between">
        <button onClick={prev} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow">◀</button>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }).map((_, i) => (
            <span key={i} className={`w-2.5 h-2.5 rounded-full ${i === page ? 'bg-sky-600' : 'bg-gray-300'}`}></span>
          ))}
        </div>
        <button onClick={next} className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 shadow">▶</button>
      </div>
    </div>
  );
}
