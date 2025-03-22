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

  // Fetch mission order details and unit locations
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        
        // Log the API endpoints being called
        console.log('Fetching mission order from:', API_ENDPOINTS.missionOrders.getById(missionOrderId));
        
        // Fetch mission order
        const orderResponse = await fetch(API_ENDPOINTS.missionOrders.getById(missionOrderId));
        if (!orderResponse.ok) {
          throw new Error(`Failed to fetch mission order: ${orderResponse.status}`);
        }
        const orderData = await orderResponse.json();
        const missionOrder = orderData.data;
        
        console.log('Received mission order:', missionOrder);
        
        // Fetch unit locations first
        const locationsResponse = await fetch(API_ENDPOINTS.unitLocations.getAll);
        if (!locationsResponse.ok) {
          throw new Error(`Failed to fetch unit locations: ${locationsResponse.status}`);
        }
        const locationsData = await locationsResponse.json();
        const units = locationsData.data || [];
        setUnitLocations(units);
        
        // Find the selected unit
        const unit = units.find(u => u.name === missionOrder.fromUnit);
        console.log('Found unit:', unit);
        if (!unit) {
          console.warn('No matching unit found for:', missionOrder.fromUnit);
          throw new Error('واحد مبدا یافت نشد');
        }
        
        // Set selected unit first
        setSelectedUnit(unit);
        
        // Process destinations
        let processedDestinations = [];
        if (missionOrder.destinations) {
          try {
            // If destinations is a string, try to parse it
            if (typeof missionOrder.destinations === 'string') {
              processedDestinations = JSON.parse(missionOrder.destinations);
            } else {
              processedDestinations = missionOrder.destinations;
            }
            
            // Ensure destinations is an array
            if (!Array.isArray(processedDestinations)) {
              processedDestinations = [processedDestinations];
            }
            
            // Ensure each destination has the correct format
            processedDestinations = processedDestinations.map(dest => ({
              lat: parseFloat(dest.lat),
              lng: parseFloat(dest.lng),
              title: dest.title || ''
            }));
            
            console.log('Processed destinations:', processedDestinations);
          } catch (e) {
            console.error('Error processing destinations:', e);
            processedDestinations = [];
          }
        }
        
        // Set destinations in state
        setDestinations(processedDestinations);
        
        // Reset form with mission order data
        reset({
          ...missionOrder,
          destinations: processedDestinations,
          fromUnit: unit.name
        });
        
        // Calculate route if we have both unit and destinations
        if (processedDestinations.length > 0) {
          console.log('Calculating initial route with unit:', unit);
          console.log('And destinations:', processedDestinations);
          
          // Wait a bit to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          await calculateCompleteRoute(processedDestinations, unit);
        }
        
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
      } finally {
        setInitialLoading(false);
      }
    };
    
    if (missionOrderId) {
      fetchData();
    }
  }, [missionOrderId, reset]);

  const calculateCompleteRoute = async (points, unitOverride = null) => {
    const unit = unitOverride || selectedUnit;
    
    if (!unit) {
      console.error('No unit selected for route calculation');
      setError('لطفا واحد مبدا را انتخاب کنید');
      return;
    }
    
    if (!points || points.length < 1) {
      console.error('No destinations for route calculation');
      return;
    }
    
    try {
      console.log('Calculating route with unit:', unit);
      console.log('And points:', points);
      
      // Ensure all coordinates are numbers
      const waypoints = [
        [parseFloat(unit.longitude), parseFloat(unit.latitude)], // مبدا
        ...points.map(dest => [parseFloat(dest.lng), parseFloat(dest.lat)])     // مقصدها
      ];
      
      console.log('Waypoints array:', waypoints);
      
      // Validate coordinates
      if (waypoints.some(point => point.some(coord => isNaN(coord)))) {
        throw new Error('Invalid coordinates found');
      }
      
      // تبدیل نقاط به رشته با فرمت مورد نیاز OSRM
      const waypointsStr = waypoints
        .map(point => `${point[0]},${point[1]}`)
        .join(';');
      
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${waypointsStr}?overview=full&geometries=geojson`;
      console.log('OSRM API request:', osrmUrl);
      
      const response = await fetch(osrmUrl);
      
      if (!response.ok) {
        throw new Error(`Error fetching route: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('OSRM Response:', data);

      if (data.routes && data.routes[0]) {
        // تنظیم مسیر برای نمایش روی نقشه
        const routeCoordinates = data.routes[0].geometry.coordinates.map((coord) => [
          coord[1], // latitude
          coord[0]  // longitude
        ]);
        
        console.log('Setting route with coordinates:', routeCoordinates);
        setRoute(routeCoordinates);
        
        // محاسبه و ذخیره مسافت و زمان
        const distance = (data.routes[0].distance / 1000).toFixed(2); // تبدیل به کیلومتر
        const duration = (data.routes[0].duration / 3600).toFixed(2); // تبدیل به ساعت
        
        console.log('Calculated values:', {
          distance,
          roundTripDistance: (distance * 2).toFixed(2),
          duration,
          roundTripDuration: (duration * 2).toFixed(2)
        });
        
        // به‌روزرسانی فیلدهای فرم
        setValue('distance', distance);
        setValue('roundTripDistance', (distance * 2).toFixed(2));
        setValue('estimatedTime', duration);
        setValue('estimatedReturnTime', (duration * 2).toFixed(2));
      } else {
        console.error('No route found in response');
        setRoute(null);
      }
    } catch (error) {
      console.error('Error calculating route:', error);
      setRoute(null);
      setError(`خطا در محاسبه مسیر: ${error.message}`);
    }
  };

  const handleUnitChange = async (e) => {
    const unitId = parseInt(e.target.value);
    const unit = unitLocations.find(u => u.id === unitId);
    setSelectedUnit(unit);
    setValue('fromUnit', unit.name);
    
    // Recalculate route with new origin
    if (destinations.length > 0) {
      await calculateCompleteRoute(destinations);
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
      await calculateCompleteRoute(updatedDestinations);
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
      await calculateCompleteRoute(updatedDestinations);
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

  const handleDateChange = (date) => {
    if (date) {
      try {
        const gregorianDate = jalaali.toGregorian(date.year, date.month, date.day);
        const formattedDate = `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, '0')}-${String(gregorianDate.gd).padStart(2, '0')}`;
        setValue('day', formattedDate);
      } catch (error) {
        console.error('Error converting date:', error);
        const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        setValue('day', formattedDate);
      }
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
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">ویرایش حکم ماموریت</h1>
        
        <div className="w-full h-[300px] sm:h-[400px] border rounded-lg mb-4 sm:mb-6 relative">
          <MapContainer
            center={selectedUnit ? [selectedUnit.latitude, selectedUnit.longitude] : [31.348808655624506, 48.72288275224326]}
            zoom={13}
            style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              zIndex: 1,
            }}
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
            {route && <Polyline positions={route} color="blue" weight={3} />}
            <MapEvents onLocationSelect={handleLocationSelect} />
          </MapContainer>
          {watch('distance') && (
            <div className="absolute bottom-4 right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg text-sm sm:text-base">
              <span className="font-medium">فاصله: </span>
              <span className="text-blue-600">{watch('distance')} کیلومتر</span>
            </div>
          )}
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
                  value={watch('day') ? new Date(watch('day')) : null}
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
