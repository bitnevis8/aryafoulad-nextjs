"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';

// تنظیم آیکون‌های پیش‌فرض لیفلت در سطح ماژول
if (typeof window !== 'undefined') {
  const L = require('leaflet');
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

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
  const [missionOrder, setMissionOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [route, setRoute] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [originCoords, setOriginCoords] = useState(null);

  useEffect(() => {
    const fetchMissionOrder = async () => {
      try {
        setLoading(true);
        
        // Log the API endpoint being called
        console.log('Fetching mission order from:', API_ENDPOINTS.missionOrders.getById(missionOrderId));
        
        // Fetch mission order data
        const response = await fetch(API_ENDPOINTS.missionOrders.getById(missionOrderId));
        
        if (!response.ok) {
          throw new Error(`خطا در دریافت اطلاعات: ${response.status}`);
        }
        
        const data = await response.json();
        
        // دیباگ: نمایش نوع و محتوای destinations
        console.log('Destinations before processing:', 
          data.data.destinations, 
          'Type:', typeof data.data.destinations,
          'Is Array:', Array.isArray(data.data.destinations)
        );
        
        // اطمینان از اینکه destinations یک آرایه است
        if (data.data && data.data.destinations && !Array.isArray(data.data.destinations)) {
          console.log('Destinations is not an array, converting:', data.data.destinations);
          // تبدیل به آرایه اگر نیست (ممکن است یک آبجکت باشد)
          try {
            // اگر JSON باشد که به صورت رشته ذخیره شده
            if (typeof data.data.destinations === 'string') {
              data.data.destinations = JSON.parse(data.data.destinations);
              console.log('After parsing JSON string:', data.data.destinations);
            }
            
            // اطمینان از اینکه بعد از پارس، یک آرایه است
            if (!Array.isArray(data.data.destinations)) {
              data.data.destinations = [data.data.destinations];
              console.log('After converting to array:', data.data.destinations);
            }
          } catch (e) {
            console.error('Error parsing destinations:', e);
            data.data.destinations = []; // در صورت خطا، آرایه خالی قرار می‌دهیم
          }
        }
        
        // دیباگ: نمایش نوع و محتوای نهایی destinations
        console.log('Destinations after processing:', 
          data.data.destinations, 
          'Type:', typeof data.data.destinations,
          'Is Array:', Array.isArray(data.data.destinations)
        );
        
        setMissionOrder(data.data);
        
        // If we have destinations, fetch unit location data to get origin coordinates
        if (data.data.fromUnit) {
          const unitResponse = await fetch(API_ENDPOINTS.unitLocations.getAll);
          
          if (unitResponse.ok) {
            const unitData = await unitResponse.json();
            const origin = unitData.data.find(unit => unit.name === data.data.fromUnit);
            
            if (origin) {
              setOriginCoords([origin.latitude, origin.longitude]);
              
              // If we have destinations, calculate route
              if (data.data.destinations && data.data.destinations.length > 0) {
                calculateRoute(origin, data.data.destinations);
              }
            }
          }
        }

        setError(null);
      } catch (err) {
        console.error("Error fetching mission order details:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (missionOrderId) {
      fetchMissionOrder();
    }
  }, [missionOrderId]);

  const calculateRoute = async (origin, destinations) => {
    try {
      // اطمینان از اینکه destinations یک آرایه است
      if (!Array.isArray(destinations)) {
        console.log('Destinations is not an array in calculateRoute, converting:', destinations);
        destinations = Array.isArray(destinations) ? destinations : [];
      }
      
      // بررسی میکنیم که آیا آرایه destinations خالی نیست
      if (destinations.length === 0) {
        console.log('No destinations to calculate route');
        return;
      }
      
      // ساخت آرایه نقاط مسیر با فرمت صحیح
      const waypoints = [
        [origin.longitude, origin.latitude],
        ...destinations.map(dest => [dest.lng, dest.lat])
      ];
      
      // تبدیل نقاط به رشته با فرمت مورد نیاز OSRM
      const waypointsStr = waypoints
        .map(point => `${point[0]},${point[1]}`)
        .join(';');
      
      console.log('Waypoints for route calculation:', waypointsStr);
      
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching route: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.routes && data.routes[0]) {
        // تنظیم مسیر برای نمایش روی نقشه
        setRoute(
          data.routes[0].geometry.coordinates.map((coord) => [
            coord[1], // latitude
            coord[0]  // longitude
          ])
        );
        
        // محاسبه و ذخیره مسافت و زمان
        const distance = (data.routes[0].distance / 1000).toFixed(2); // تبدیل به کیلومتر
        const duration = (data.routes[0].duration / 3600).toFixed(2); // تبدیل به ساعت
        
        // به‌روزرسانی مقادیر در state
        setMissionOrder(prev => ({
          ...prev,
          distance: distance,
          roundTripDistance: (distance * 2).toFixed(2),
          estimatedTime: duration,
          estimatedReturnTime: (duration * 2).toFixed(2)
        }));
      } else {
        console.error('No route found in response');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.missionOrders.delete(missionOrderId), {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`خطا در حذف حکم ماموریت: ${response.status}`);
      }

      router.push('/dashboard/missionOrder');
    } catch (err) {
      console.error("Error deleting mission order:", err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-100 text-rose-700 p-4 rounded-lg my-4">
        <p className="font-medium">خطا در بارگیری اطلاعات</p>
        <p>{error}</p>
        <Button 
          variant="secondary" 
          className="mt-4"
          onClick={() => router.push('/dashboard/missionOrder')}
        >
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  if (!missionOrder) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-lg my-4">
        <p>حکم ماموریت مورد نظر یافت نشد.</p>
        <Button 
          variant="secondary" 
          className="mt-4"
          onClick={() => router.push('/dashboard/missionOrder')}
        >
          بازگشت به لیست
        </Button>
      </div>
    );
  }

  const mapCenter = missionOrder.destinations && missionOrder.destinations.length > 0 
    ? [missionOrder.destinations[0].lat, missionOrder.destinations[0].lng]
    : originCoords || [31.348808655624506, 48.72288275224326]; // Default coordinates if none available

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">
              {missionOrder.missionSubject || 'حکم ماموریت'}
            </h1>
            <div className="flex space-x-2 space-x-reverse">
              <Link href={`/dashboard/missionOrder/edit/${missionOrderId}`}>
                <Button variant="secondary">
                  ویرایش
                </Button>
              </Link>
              <Button 
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">مسیر ماموریت</h2>
          <div className="w-full h-[400px] border rounded-lg relative">
            <MapContainer
              center={mapCenter}
              zoom={12}
              style={{
                height: '100%',
                width: '100%',
              }}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {/* Origin Marker */}
              {originCoords && (
                <Marker position={originCoords} />
              )}
              {/* Destination Markers */}
              {missionOrder.destinations && Array.isArray(missionOrder.destinations) && missionOrder.destinations.map((dest, index) => (
                <Marker key={index} position={[dest.lat, dest.lng]} />
              ))}
              {/* Route Line */}
              {route && <Polyline positions={route} color="blue" weight={3} />}
            </MapContainer>
          </div>

          {/* Destinations List */}
          {missionOrder.destinations && Array.isArray(missionOrder.destinations) && missionOrder.destinations.length > 0 && (
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-2">مقاصد</h3>
              <div className="space-y-2">
                {missionOrder.destinations.map((dest, index) => (
                  <div key={index} className="bg-white p-3 rounded-lg border border-gray-200">
                    <span className="font-medium">{index + 1}. </span>
                    <span>{dest.title}</span>
                    <span className="text-sm text-gray-500 mr-2">({dest.lat.toFixed(4)}, {dest.lng.toFixed(4)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mission Info */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold mb-4">اطلاعات ماموریت</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">نام و نام خانوادگی</p>
              <p className="font-medium">{`${missionOrder.firstName || ''} ${missionOrder.lastName || ''}`}</p>
            </div>
            {missionOrder.personnelNumber && (
              <div>
                <p className="text-sm text-gray-500">کد پرسنلی</p>
                <p className="font-medium">{missionOrder.personnelNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">تاریخ</p>
              <p className="font-medium">{missionOrder.day || '-'}</p>
            </div>
            {missionOrder.time && (
              <div>
                <p className="text-sm text-gray-500">ساعت</p>
                <p className="font-medium">{missionOrder.time}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">واحد مبدا</p>
              <p className="font-medium">{missionOrder.fromUnit || '-'}</p>
            </div>
            {missionOrder.companions && (
              <div>
                <p className="text-sm text-gray-500">همراهان</p>
                <p className="font-medium">{missionOrder.companions}</p>
              </div>
            )}
            {missionOrder.transport && (
              <div>
                <p className="text-sm text-gray-500">وسیله نقلیه</p>
                <p className="font-medium">{missionOrder.transport}</p>
              </div>
            )}
            {missionOrder.totalWeightKg && (
              <div>
                <p className="text-sm text-gray-500">وزن کل (کیلوگرم)</p>
                <p className="font-medium">{missionOrder.totalWeightKg}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500">مسافت (کیلومتر)</p>
              <p className="font-medium">{missionOrder.distance || '0'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">مسافت رفت و برگشت (کیلومتر)</p>
              <p className="font-medium">{missionOrder.roundTripDistance || '0'}</p>
            </div>
          </div>

          {missionOrder.missionDescription && (
            <div className="mt-4">
              <p className="text-sm text-gray-500">توضیحات ماموریت</p>
              <p className="mt-1 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">{missionOrder.missionDescription}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6">
          <div className="flex justify-between">
            <Button
              variant="secondary"
              onClick={() => router.push('/dashboard/missionOrder')}
            >
              بازگشت به لیست
            </Button>
            <Link href={`/dashboard/missionOrder/edit/${missionOrderId}`}>
              <Button variant="primary">
                ویرایش
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">حذف حکم ماموریت</h3>
            <p className="mb-6">آیا از حذف این حکم ماموریت اطمینان دارید؟ این عملیات غیرقابل بازگشت است.</p>
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                انصراف
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
              >
                حذف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MissionOrderDetails; 