"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useForm } from 'react-hook-form';
import 'leaflet/dist/leaflet.css';
import { useMapEvents } from 'react-leaflet';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import jalaali from 'jalaali-js';
import { API_ENDPOINTS } from "@/app/config/api";
import Button from '@/app/components/ui/Button/Button';
import LeafletConfig from '@/app/components/map/LeafletConfig';

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

// کامپوننت برای هندل کردن رویداد کلیک روی نقشه
const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      console.log('Map clicked:', e.latlng);
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MissionOrderEdit = ({ missionOrderId }) => {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, reset } = useForm();
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [route, setRoute] = useState(null);
  const [unitLocations, setUnitLocations] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const handleDateChange = (date) => {
    if (date) {
      try {
        // اگر تاریخ به صورت Date object باشد
        if (date instanceof Date) {
          const persianDate = {
            year: date.getFullYear(),
            month: date.getMonth() + 1,
            day: date.getDate()
          };
          setValue('day', persianDate);
        } else {
          // اگر تاریخ به صورت object باشد
          setValue('day', date);
        }
      } catch (error) {
        console.error('Error handling date:', error);
        setValue('day', null);
      }
    }
  };

  // Fetch mission order details and unit locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);
        
        // Fetch mission order
        const orderResponse = await fetch(API_ENDPOINTS.missionOrders.getById(missionOrderId));
        if (!orderResponse.ok) {
          throw new Error(`خطا در دریافت اطلاعات ماموریت: ${orderResponse.status}`);
        }
        const orderData = await orderResponse.json();
        const missionOrder = orderData.data;
        
        // Fetch unit locations
        const locationsResponse = await fetch(API_ENDPOINTS.unitLocations.getAll);
        if (!locationsResponse.ok) {
          throw new Error(`خطا در دریافت اطلاعات واحدها: ${locationsResponse.status}`);
        }
        const locationsData = await locationsResponse.json();
        const units = locationsData.data || [];
        setUnitLocations(units);
        
        // Find the selected unit
        const unit = units.find(u => u.name === missionOrder.fromUnit);
        if (!unit) {
          throw new Error('واحد مبدا یافت نشد');
        }
        setSelectedUnit(unit);
        
        // Process destinations
        let processedDestinations = [];
        if (missionOrder.destinations) {
          try {
            processedDestinations = typeof missionOrder.destinations === 'string' 
              ? JSON.parse(missionOrder.destinations) 
              : missionOrder.destinations;
            
            if (!Array.isArray(processedDestinations)) {
              processedDestinations = [processedDestinations];
            }
            
            processedDestinations = processedDestinations.map(dest => ({
              lat: parseFloat(dest.lat),
              lng: parseFloat(dest.lng),
              title: dest.title || ''
            }));
          } catch (e) {
            console.error('Error processing destinations:', e);
            processedDestinations = [];
          }
        }
        
        setDestinations(processedDestinations);
        
        // Reset form with mission order data
        reset({
          ...missionOrder,
          destinations: processedDestinations,
          fromUnit: unit.name,
          day: missionOrder.day ? new Date(missionOrder.day) : null
        });
        
        // Calculate route if we have both unit and destinations
        if (processedDestinations.length > 0) {
          await calculateRoute(unit, processedDestinations);
        }
        
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || 'خطا در بارگیری اطلاعات');
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (missionOrderId) {
      fetchData();
    }
  }, [missionOrderId, reset]);

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
      
      // ساخت آرایه نقاط مسیر رفت با فرمت صحیح
      const waypoints = [
        [origin.longitude, origin.latitude],
        ...destinations.map(dest => [dest.lng, dest.lat])
      ];
      
      // تبدیل نقاط به رشته با فرمت مورد نیاز OSRM
      const waypointsStr = waypoints
        .map(point => `${point[0]},${point[1]}`)
        .join(';');
      
      console.log('Waypoints for route calculation:', waypointsStr);
      
      // محاسبه مسیر رفت
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`
      );
      
      if (!response.ok) {
        throw new Error(`Error fetching route: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.routes && data.routes[0]) {
        // تنظیم مسیر رفت برای نمایش روی نقشه
        const forwardRoute = data.routes[0].geometry.coordinates.map((coord) => [
          coord[1], // latitude
          coord[0]  // longitude
        ]);
        
        // محاسبه مسافت و زمان رفت
        const forwardDistance = data.routes[0].distance / 1000; // تبدیل به کیلومتر
        const forwardDuration = data.routes[0].duration / 3600; // تبدیل به ساعت

        // محاسبه مسیر برگشت از آخرین مقصد به مبدا
        const lastDestination = destinations[destinations.length - 1];
        const returnWaypointsStr = `${lastDestination.lng},${lastDestination.lat};${origin.longitude},${origin.latitude}`;
        
        const returnResponse = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${returnWaypointsStr}?overview=full&geometries=geojson`
        );

        if (!returnResponse.ok) {
          throw new Error(`Error fetching return route: ${returnResponse.status}`);
        }

        const returnData = await returnResponse.json();
        
        if (returnData.routes && returnData.routes[0]) {
          // تنظیم مسیر برگشت برای نمایش روی نقشه
          const returnRoute = returnData.routes[0].geometry.coordinates.map((coord) => [
            coord[1], // latitude
            coord[0]  // longitude
          ]);

          // محاسبه مسافت و زمان برگشت
          const returnDistance = returnData.routes[0].distance / 1000; // تبدیل به کیلومتر
          const returnDuration = returnData.routes[0].duration / 3600; // تبدیل به ساعت

          // به‌روزرسانی state با مسیرها و محاسبات جدید
          setRoute({
            forward: forwardRoute,
            return: returnRoute
          });
          
          // به‌روزرسانی مقادیر در state
          setValue('distance', forwardDistance.toFixed(2));
          setValue('roundTripDistance', (forwardDistance + returnDistance).toFixed(2));
          setValue('estimatedTime', forwardDuration.toFixed(2));
          setValue('estimatedReturnTime', (forwardDuration + returnDuration).toFixed(2));
        }
      } else {
        console.error('No route found in response');
      }
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleUnitChange = async (e) => {
    const unitId = parseInt(e.target.value);
    const unit = unitLocations.find(u => u.id === unitId);
    setSelectedUnit(unit);
    setValue('fromUnit', unit.name);
    
    // Recalculate route with new origin
    if (destinations.length > 0) {
      await calculateRoute(unit, destinations);
    }
  };

  const handleLocationSelect = async (newDestination) => {
    console.log('Location selected:', newDestination);
    try {
      // Get location title from OpenStreetMap Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newDestination.lat}&lon=${newDestination.lng}`
      );
      const data = await response.json();
      const locationTitle = data.display_name || '';

      const newDestinationObj = {
        lat: newDestination.lat,
        lng: newDestination.lng,
        title: locationTitle
      };

      const updatedDestinations = [...destinations, newDestinationObj];
      setDestinations(updatedDestinations);
      setValue('destinations', updatedDestinations);
      
      // Update coordinates display for the last destination
      setValue('missionCoordinates', `${newDestination.lat}, ${newDestination.lng}`);
      setValue('missionLocation', locationTitle);

      // Calculate new route with all destinations
      await calculateRoute(selectedUnit, updatedDestinations);
    } catch (error) {
      console.error('Error getting location details:', error);
    }
  };

  const removeDestination = async (index) => {
    const updatedDestinations = destinations.filter((_, i) => i !== index);
    setDestinations(updatedDestinations);
    setValue('destinations', updatedDestinations);
    
    if (updatedDestinations.length > 0) {
      const lastDest = updatedDestinations[updatedDestinations.length - 1];
      setValue('missionCoordinates', `${lastDest.lat}, ${lastDest.lng}`);
      setValue('missionLocation', lastDest.title);
    } else {
      setValue('missionCoordinates', '');
      setValue('missionLocation', '');
      setRoute(null);
      setValue('distance', '0');
      setValue('roundTripDistance', '0');
      setValue('estimatedTime', '0');
      setValue('estimatedReturnTime', '0');
    }

    if (updatedDestinations.length > 0) {
      await calculateRoute(selectedUnit, updatedDestinations);
    }
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.missionOrders.update(missionOrderId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          destinations: destinations
        }),
      });

      if (response.ok) {
        alert('حکم ماموریت با موفقیت به‌روز شد');
        router.push('/dashboard/missionOrder');
      } else {
        const errorData = await response.json();
        alert('خطا در به‌روزرسانی حکم ماموریت: ' + (errorData.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error updating mission order:', error);
      alert('خطا در به‌روزرسانی حکم ماموریت. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
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

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full sm:max-w-7xl">
      <LeafletConfig />
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">ویرایش حکم ماموریت</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p className="font-medium">خطا</p>
            <p>{error}</p>
          </div>
        )}

        <div className="w-full h-[400px] border rounded-lg mb-6">
          <MapContainer
            center={selectedUnit ? [selectedUnit.latitude, selectedUnit.longitude] : [31.348808655624506, 48.72288275224326]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {selectedUnit && (
              <Marker position={[selectedUnit.latitude, selectedUnit.longitude]} />
            )}
            {destinations.map((dest, index) => (
              <Marker key={index} position={[dest.lat, dest.lng]} />
            ))}
            {route?.forward && <Polyline positions={route.forward} color="blue" weight={3} />}
            {route?.return && <Polyline positions={route.return} color="red" weight={3} />}
            <MapEvents onLocationSelect={handleLocationSelect} />
          </MapContainer>
        </div>

        {/* Destinations List */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">مقاصد انتخاب شده</h2>
          {destinations.length === 0 ? (
            <p className="text-gray-500">هنوز مقصدی انتخاب نشده است. روی نقشه کلیک کنید تا مقصد اضافه شود.</p>
          ) : (
            <div className="space-y-3">
              {destinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-medium">مقصد {index + 1}:</span>
                  <span className="flex-1">{dest.title}</span>
                  <span className="text-sm text-gray-500">
                    ({dest.lat.toFixed(4)}, {dest.lng.toFixed(4)})
                  </span>
                  <button
                    onClick={() => removeDestination(index)}
                    className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    حذف
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* Read-only information box */}
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت کل مسیر (کیلومتر)</label>
                <input
                  type="text"
                  value={watch('distance') || '0'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت رفت و برگشت (کیلومتر)</label>
                <input
                  type="text"
                  value={watch('roundTripDistance') || '0'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت (ساعت)</label>
                <input
                  type="text"
                  value={watch('estimatedTime') ? `${watch('estimatedTime')} ساعت` : '0 ساعت'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت و برگشت (ساعت)</label>
                <input
                  type="text"
                  value={watch('estimatedReturnTime') ? `${watch('estimatedReturnTime')} ساعت` : '0 ساعت'}
                  readOnly
                  className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base"
                />
              </div>
            </div>
          </div>

          {/* First row - Date and Origin Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ <span className="text-red-500">*</span></label>
              <div className="w-full relative">
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={watch('day')}
                  onChange={handleDateChange}
                  calendarPosition="bottom-right"
                  format="YYYY/MM/DD"
                  inputClass="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  containerClass="w-full"
                  required
                  plugins={[
                    {
                      type: 'toolbar',
                      position: 'top',
                      options: {
                        today: 'امروز',
                        clear: 'پاک کردن',
                        save: 'ذخیره',
                      }
                    }
                  ]}
                  calendarClass="bg-white border border-gray-300 rounded-lg shadow-lg"
                  headerClass="bg-gray-100 p-2 rounded-t-lg"
                  daysClass="text-gray-700"
                  selectedDayClass="bg-blue-500 text-white"
                  todayClass="bg-gray-100"
                  disabledClass="text-gray-400"
                  weekDaysClass="text-gray-600 font-medium"
                  weekDayClass="text-gray-600"
                  weekDays={['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج']}
                  placeholder="تاریخ را انتخاب کنید"
                  style={{ width: '100%' }}
                  renderValue={(value, format) => {
                    if (!value) return '';
                    const date = new Date(value);
                    const persianDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
                    return `${persianDate.jy}/${String(persianDate.jm).padStart(2, '0')}/${String(persianDate.jd).padStart(2, '0')}`;
                  }}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">واحد مبدا <span className="text-red-500">*</span></label>
              <select
                value={selectedUnit?.id || ''}
                onChange={handleUnitChange}
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              >
                {unitLocations.map(unit => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Other form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
              <input
                {...register('firstName')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
              <input
                {...register('lastName')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
              <input
                {...register('personnelNumber')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
              <input
                {...register('time')}
                type="time"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">موضوع ماموریت</label>
              <input
                {...register('missionSubject')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">همراهان</label>
              <input
                {...register('companions')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع وسیله نقلیه</label>
              <input
                {...register('transport')}
                type="text"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وزن کل (کیلوگرم)</label>
              <input
                {...register('totalWeightKg')}
                type="number"
                className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات ماموریت</label>
            <textarea
              {...register('missionDescription')}
              rows="4"
              className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
          </div>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/missionOrder')}
            >
              انصراف
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? 'در حال به‌روزرسانی...' : 'به‌روزرسانی حکم ماموریت'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MissionOrderEdit; 
