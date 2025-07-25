"use client"

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import 'leaflet/dist/leaflet.css';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import jalaali from 'jalaali-js';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';
import { calculateRouteDetails, calculateFinalCost } from '@/app/utils/routeCalculations';
import { QRCodeSVG } from 'qrcode.react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType } from 'docx';

// Dynamic imports for react-leaflet components
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Polyline = dynamic(
  () => import('react-leaflet').then((mod) => mod.Polyline),
  { ssr: false }
);

const MissionOrderDetails = ({ missionOrderId }) => {
  const router = useRouter();
  const { register, watch, reset, setValue } = useForm({
    defaultValues: {
      personnelNumber: '', fromUnit: '', day: '',
      time: '', missionLocation: '', missionCoordinates: '', missionSubject: '',
      missionDescription: '', companions: '', transport: '', totalWeightKg: '',
      destinations: [], distance: '', roundTripDistance: '', estimatedTime: '',
      estimatedReturnTime: '', sessionCode: '', finalCost: 0
    }
  });
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [route, setRoute] = useState(null);
  const [unitLocations, setUnitLocations] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [defaultRate, setDefaultRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchDefaultRate = async () => {
      setRateLoading(true);
      try {
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().slice(0, 10);
        const response = await fetch(API_ENDPOINTS.rateSettings.getRateByDate(today));
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && data.data.ratePerKm) {
            setDefaultRate(parseFloat(data.data.ratePerKm));
          } else {
            console.warn('No valid rate found for current date, using default 0');
            setDefaultRate(0);
          }
        } else if (response.status === 404) {
          console.warn('No active rate found for current date, using default 0');
          setDefaultRate(0);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching default rate:", error);
        setDefaultRate(0);
      } finally {
        setRateLoading(false);
      }
    };
    fetchDefaultRate();
  }, []);

  const calculateRoute = useCallback(async (origin, destinations, currentRate) => {
    if (currentRate === null) { return; }
    try {
      const routeDetails = await calculateRouteDetails(origin, destinations);
      setRoute({ forward: routeDetails.forwardRoute, return: routeDetails.returnRoute });
      setValue('forwardDistance', routeDetails.forwardDistance);
      setValue('returnDistance', routeDetails.returnDistance);
      setValue('totalDistance', routeDetails.totalDistance);
      setValue('forwardTime', routeDetails.forwardTime);
      setValue('returnTime', routeDetails.returnTime);
      setValue('totalTime', routeDetails.totalTime);
      const finalCost = calculateFinalCost(routeDetails.totalDistance, currentRate);
      setValue('finalCost', finalCost);
    } catch (error) { console.error('Error calculating route:', error); }
  }, [setValue]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true); setError(null);
        const orderResponse = await fetch(API_ENDPOINTS.missionOrders.getById(missionOrderId));
        if (!orderResponse.ok) { throw new Error(`خطا در دریافت اطلاعات ماموریت: ${orderResponse.status}`); }
        const orderData = await orderResponse.json();
        const missionOrder = orderData.data;

        console.log('Mission Order Data:', missionOrder);

        const locationsResponse = await fetch(API_ENDPOINTS.unitLocations.getAll);
        if (!locationsResponse.ok) { throw new Error(`خطا در دریافت اطلاعات واحدها: ${locationsResponse.status}`); }
        const locationsData = await locationsResponse.json();
        const units = locationsData.data || [];
        setUnitLocations(units);

        console.log('Companions:', missionOrder.companions);

        const unit = units.find(u => u.name === missionOrder.fromUnit);
        if (!unit) { throw new Error('واحد مبدا یافت نشد'); }
        setSelectedUnit(unit);

        let processedDestinations = [];
        if (missionOrder.destinations) {
          try {
            processedDestinations = typeof missionOrder.destinations === 'string' ? JSON.parse(missionOrder.destinations) : missionOrder.destinations;
            if (!Array.isArray(processedDestinations)) { processedDestinations = [processedDestinations]; }
            processedDestinations = processedDestinations.map(dest => ({ lat: parseFloat(dest.lat), lng: parseFloat(dest.lng), title: dest.title || '' }));
          } catch (e) { processedDestinations = []; }
        }
        setDestinations(processedDestinations);

        const { ratePerKm, ...orderDataToReset } = missionOrder;
        reset({
          ...orderDataToReset,
          destinations: processedDestinations,
          fromUnit: unit.name,
          day: missionOrder.day ? new Date(missionOrder.day) : null
        });

        if (processedDestinations.length > 0 && !rateLoading && defaultRate !== null) {
           await calculateRoute(unit, processedDestinations, defaultRate);
        }

        if (missionOrder?.id) {
            setQrCodeUrl(`${window.location.origin}/mission-order/${missionOrder.id}`);
        }

      } catch (err) { setError(err.message || 'خطا در بارگیری اطلاعات'); }
      finally { setInitialLoading(false); }
    };
    if (missionOrderId) { fetchData(); }
  }, [missionOrderId, reset, rateLoading, defaultRate, setValue, calculateRoute]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.users.getAll);
        if (!response.ok) {
          throw new Error('خطا در دریافت لیست کاربران');
        }
        const data = await response.json();
        // Handle both old and new API response formats
        const users = data.data && data.data.users ? data.data.users : data.data;
        setUsers(users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
      }
    };

    fetchUsers();
  }, []);

  const formatPersianDate = (dateValue) => {
      if (!dateValue) return '';
      try {
          const date = new Date(dateValue);
          if (isNaN(date.getTime())) return '';
          const persianDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
          return `${persianDate.jy}/${String(persianDate.jm).padStart(2, '0')}/${String(persianDate.jd).padStart(2, '0')}`;
      } catch (error) {
          console.error("Error formatting date:", error);
          return '';
      }
  };

  const generateWordDocument = async () => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: "جزئیات حکم ماموریت",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({
            text: `تاریخ: ${formatPersianDate(watch('day'))}`,
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({
            text: `واحد مبدا: ${watch('fromUnit')}`,
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({
            text: "اطلاعات شخصی",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "کد پرسنلی", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('personnelNumber') || '-', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            text: "اطلاعات ماموریت",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "موضوع ماموریت", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('missionSubject') || '-', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "ساعت", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('time') || '-', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "همراهان", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('companions') || '-', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "نوع وسیله نقلیه", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('transport') || '-', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            text: "اطلاعات مسیر",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT
          }),
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "مسافت رفت (کیلومتر)", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('forwardDistance') || '0', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "مسافت برگشت (کیلومتر)", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('returnDistance') || '0', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "مسافت کل (کیلومتر)", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: watch('totalDistance') || '0', alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ text: "هزینه نهایی (تومان)", alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [new Paragraph({ text: parseFloat(watch('finalCost') || '0').toLocaleString('fa-IR'), alignment: AlignmentType.RIGHT })],
                    width: { size: 50, type: WidthType.PERCENTAGE }
                  })
                ]
              })
            ]
          }),
          new Paragraph({
            text: "توضیحات ماموریت",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.RIGHT
          }),
          new Paragraph({
            text: watch('missionDescription') || '-',
            alignment: AlignmentType.RIGHT
          })
        ]
      }]
    });

    const blob = await Packer.toBlob(doc);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mission-order-${missionOrderId}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const getUserNameById = (id) => {
    const user = users.find(user => user.id === id);
    return user ? `${user.firstName} ${user.lastName}` : 'نامشخص';
  };

  if (initialLoading) {
    return ( <div className="flex justify-center items-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div></div> );
  }

  if (error) {
    return ( <div className="bg-rose-100 text-rose-700 p-4 rounded-lg my-4"><p className="font-medium">خطا در بارگیری اطلاعات</p><p>{error}</p><Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard/missionOrder')}>بازگشت به لیست</Button></div> );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full sm:max-w-7xl">
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 text-center">جزئیات حکم ماموریت</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => router.push('/dashboard/missionOrder')}>بازگشت به لیست</Button>
            <Link href={`/dashboard/missionOrder/edit/${missionOrderId}`}>
              <Button variant="primary">ویرایش</Button>
            </Link>
          </div>
        </div>

        {error && ( <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4"><p className="font-medium">خطا</p><p>{error}</p></div> )}

        <div className="w-full h-[400px] border rounded-lg mb-6 relative">
          <MapContainer
            center={selectedUnit ? [selectedUnit.latitude, selectedUnit.longitude] : [31.348808655624506, 48.72288275224326]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
            dragging={true}
            touchZoom={true}
            doubleClickZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'/>
            {selectedUnit && ( <Marker position={[selectedUnit.latitude, selectedUnit.longitude]} /> )}
            {destinations.map((dest, index) => ( <Marker key={index} position={[dest.lat, dest.lng]} /> ))}
            {route && route.forward && <Polyline positions={route.forward} color="blue" weight={3} />}
            {route && route.return && <Polyline positions={route.return} color="red" weight={3} />}
          </MapContainer>
        </div>

        <div className="flex justify-between items-center mb-6">
          {qrCodeUrl && (
            <div className="bg-white p-4 rounded-lg shadow">
              <QRCodeSVG 
                value={qrCodeUrl}
                size={200}
                level="H"
                includeMargin={true}
              />
              <p className="text-center mt-2 text-sm text-gray-600">اسکن کنید تا به جزئیات ماموریت دسترسی پیدا کنید</p>
            </div>
          )}
          <Button 
            variant="primary" 
            onClick={generateWordDocument}
            className="ml-4"
          >
            دانلود جزئیات ماموریت
          </Button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">مقاصد</h2>
          {destinations.length === 0 ? (
            <p className="text-gray-500">مقصدی ثبت نشده است.</p>
          ) : (
            <div className="space-y-3">
              {destinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-medium">مقصد {index + 1}:</span>
                  <span className="flex-1">{dest.title}</span>
                  <span className="text-sm text-gray-500">({dest.lat.toFixed(4)}, {dest.lng.toFixed(4)})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت رفت (کیلومتر)</label>
                <input type="text" value={watch('forwardDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت برگشت (کیلومتر)</label>
                <input type="text" value={watch('returnDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت کل (کیلومتر)</label>
                <input type="text" value={watch('totalDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت (ساعت)</label>
                <input type="text" value={watch('forwardTime') ? `${watch('forwardTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان برگشت (ساعت)</label>
                <input type="text" value={watch('returnTime') ? `${watch('returnTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان کل (ساعت)</label>
                <input type="text" value={watch('totalTime') ? `${watch('totalTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
              </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">هزینه نهایی (تومان)</label>
                 <input type="text" value={parseFloat(watch('finalCost') || '0').toLocaleString('fa-IR')} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base text-left"/>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ</label>
              <div className="w-full relative">
                <input type="text" value={formatPersianDate(watch('day'))} readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">واحد مبدا</label>
              <input type="text" value={watch('fromUnit') || ''} readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
              <input {...register('personnelNumber')} type="text" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
              <input {...register('time')} type="time" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع ماموریت</label>
              <input {...register('missionSubject')} type="text" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">همراهان</label>
              <input {...register('companions')} type="text" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع وسیله نقلیه</label>
              <input {...register('transport')} type="text" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وزن کل (کیلوگرم)</label>
              <input {...register('totalWeightKg')} type="number" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد شماره صورت جلسه</label>
              <input type="text" {...register('sessionCode')} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"/>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات ماموریت</label>
            <textarea {...register('missionDescription')} rows="4" readOnly className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm sm:text-base"/>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">مسئول مأموریت</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><span className="font-medium">نام و نام خانوادگی:</span> {getUserNameById(watch('userId'))}</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">همراهان مأموریت</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {watch('companions') && watch('companions').length > 0 ? (
                watch('companions').map((companionId, index) => (
                  <p key={index}><span className="font-medium">همراه {index + 1}:</span> {getUserNameById(companionId)}</p>
                ))
              ) : (
                <p>همراهی ثبت نشده است.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionOrderDetails; 