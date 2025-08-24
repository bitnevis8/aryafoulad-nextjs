"use client"

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import 'leaflet/dist/leaflet.css';
import { useMapEvents } from 'react-leaflet';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import jalaali from 'jalaali-js';
import { API_ENDPOINTS } from "@/app/config/api";
import LeafletConfig from '@/app/components/map/LeafletConfig';
import SearchBox from '@/app/components/ui/Map/SearchBox';
import { calculateRouteDetails, calculateFinalCost } from '@/app/utils/routeCalculations';
import { useRouter } from 'next/navigation';
import Select from 'react-select';
import Button from '@/app/components/ui/Button/Button';

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

const ARYAFOULAD_COORDS = [31.348808655624506, 48.72288275224326];

const MapEvents = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng);
    },
  });
  return null;
};

const MissionOrderCreateFromCustomers = () => {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, reset, getValues } = useForm({
    defaultValues: {
      personnelNumber: '',
      fromUnit: '',
      day: '',
      time: '',
      missionLocation: '',
      missionCoordinates: '',
      missionSubject: '',
      missionDescription: '',
      companions: '',
      transport: '',
      totalWeightKg: '',
      destinations: [],
      distance: '',
      roundTripDistance: '',
      estimatedTime: '',
      estimatedReturnTime: '',
      sessionCode: '',
      finalCost: 0,
      userId: null,
      companionIds: []
    }
  });

  const [destinations, setDestinations] = useState([]);
  const [route, setRoute] = useState(null);
  const [unitLocations, setUnitLocations] = useState([]);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [defaultRate, setDefaultRate] = useState(null);
  const [rateLoading, setRateLoading] = useState(true);
  const [selectedRateInfo, setSelectedRateInfo] = useState(null);
  const [mapCenter, setMapCenter] = useState(ARYAFOULAD_COORDS);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearchSelect = (coords) => {
    setMapCenter(coords);
  };

  useEffect(() => {
    const fetchUnitLocations = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.unitLocations.getAll);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUnitLocations(data.data || []);
        const defaultUnit = data.data.find(unit => unit.isDefault);
        if (defaultUnit) {
          setSelectedUnit(defaultUnit);
          setValue('fromUnit', defaultUnit.name);
          setMapCenter([defaultUnit.latitude, defaultUnit.longitude]);
        }
      } catch (error) {
        console.error("Error fetching unit locations:", error);
      }
    };
    fetchUnitLocations();
  }, [setValue]);

  useEffect(() => {
    const fetchDefaultRate = async () => {
      setRateLoading(true);
      try {
        const today = new Date().toISOString().slice(0, 10);
        const response = await fetch(API_ENDPOINTS.rateSettings.getRateByDate(today));
        if (response.ok) {
          const data = await response.json();
          if (data && data.data && data.data.ratePerKm) {
            setDefaultRate(parseFloat(data.data.ratePerKm));
            setSelectedRateInfo(data.data);
          } else {
            setDefaultRate(0);
            setSelectedRateInfo(null);
          }
        } else if (response.status === 404) {
          setDefaultRate(0);
          setSelectedRateInfo(null);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching default rate:", error);
        setDefaultRate(0);
        setSelectedRateInfo(null);
      } finally {
        setRateLoading(false);
      }
    };
    fetchDefaultRate();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.users.getAll, { credentials: 'include' });
        if (!response.ok) throw new Error('خطا در دریافت لیست کاربران');
        const data = await response.json();
        const userList = data?.data?.users ?? data?.data ?? data?.users ?? [];
        setUsers(userList.map(user => ({ value: user.id, label: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'کاربر بدون نام' })));
        const onlyCustomers = userList.filter(u => (u.roles||[]).some(r => r.nameEn === 'Customer' || r.nameFa === 'مشتری'));
        setCustomers(onlyCustomers.map(u => ({ value: u.id, label: `${u.firstName} ${u.lastName} - ${u.mobile || ''}`, latitude: u.latitude, longitude: u.longitude })));
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('خطا در دریافت لیست کاربران');
      }
    };
    fetchUsers();
  }, []);

  const calculateRoute = async (origin, dests) => {
    if (rateLoading || defaultRate === null) return;
    try {
      const routeDetails = await calculateRouteDetails(origin, dests);
      setRoute({ forward: routeDetails.forwardRoute, return: routeDetails.returnRoute });
      setValue('forwardDistance', routeDetails.forwardDistance);
      setValue('returnDistance', routeDetails.returnDistance);
      setValue('totalDistance', routeDetails.totalDistance);
      setValue('forwardTime', routeDetails.forwardTime);
      setValue('returnTime', routeDetails.returnTime);
      setValue('totalTime', routeDetails.totalTime);
      const finalCost = calculateFinalCost(routeDetails.totalDistance, defaultRate);
      setValue('finalCost', finalCost);
    } catch (error) {
      console.error('Error calculating route:', error);
    }
  };

  const handleUnitChange = async (e) => {
    const unitId = parseInt(e.target.value);
    const unit = unitLocations.find(u => u.id === unitId);
    setSelectedUnit(unit);
    setValue('fromUnit', unit.name);
    setMapCenter([unit.latitude, unit.longitude]);
    if (destinations.length > 0) await calculateRoute(unit, destinations);
  };

  const handleLocationSelect = async (newDestination) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${newDestination.lat}&lon=${newDestination.lng}`);
      const data = await response.json();
      const locationTitle = data.display_name || '';
      const newDestinationObj = { lat: newDestination.lat, lng: newDestination.lng, title: locationTitle };
      const updatedDestinations = [...destinations, newDestinationObj];
      setDestinations(updatedDestinations);
      setValue('destinations', updatedDestinations);
      setValue('missionCoordinates', `${newDestination.lat}, ${newDestination.lng}`);
      setValue('missionLocation', locationTitle);
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
    if (updatedDestinations.length > 0) await calculateRoute(selectedUnit, updatedDestinations);
  };

  // هنگامی که مشتری‌ها انتخاب/تغییر می‌کنند، مقاصد را به همان ترتیب تنظیم کن
  useEffect(() => {
    const newDests = selectedCustomers
      .map(c => ({ lat: c.latitude, lng: c.longitude, title: c.label }))
      .filter(d => typeof d.lat === 'number' && typeof d.lng === 'number');
    setDestinations(newDests);
    setValue('destinations', newDests);
    if (newDests.length > 0) {
      const last = newDests[newDests.length - 1];
      setValue('missionCoordinates', `${last.lat}, ${last.lng}`);
      setValue('missionLocation', last.title);
      calculateRoute(selectedUnit, newDests);
    }
  }, [selectedCustomers]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const processedData = {
        ...data,
        userId: data.userId?.value,
        companionIds: data.companionIds?.map(c => c.value) || []
      };
      const response = await fetch(API_ENDPOINTS.missionOrders.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ایجاد ماموریت');
      }
      const result = await response.json();
      if (result.success) {
        router.push('/dashboard/missionOrder');
      } else {
        throw new Error(result.message || 'خطا در ایجاد ماموریت');
      }
    } catch (err) {
      console.error('Error creating mission order:', err);
      setError(err.message || 'خطا در ایجاد ماموریت');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = async (date) => {
    if (date) {
      try {
        const gregorianDate = jalaali.toGregorian(date.year, date.month, date.day);
        const formattedDate = `${gregorianDate.gy}-${String(gregorianDate.gm).padStart(2, '0')}-${String(gregorianDate.gd).padStart(2, '0')}`;
        setValue('day', formattedDate);
        try {
          const response = await fetch(API_ENDPOINTS.rateSettings.getRateByDate(formattedDate));
          if (response.ok) {
            const data = await response.json();
            if (data && data.data && data.data.ratePerKm) {
              const missionRate = parseFloat(data.data.ratePerKm);
              setDefaultRate(missionRate);
              setSelectedRateInfo(data.data);
              if (route && route.forward) {
                const finalCost = calculateFinalCost(getValues('totalDistance'), missionRate);
                setValue('finalCost', finalCost);
              }
            } else {
              setDefaultRate(0);
              setSelectedRateInfo(null);
            }
          } else if (response.status === 404) {
            setDefaultRate(0);
            setSelectedRateInfo(null);
          } else {
            setDefaultRate(0);
            setSelectedRateInfo(null);
          }
        } catch (error) {
          setDefaultRate(0);
          setSelectedRateInfo(null);
        }
      } catch (error) {
        const formattedDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
        setValue('day', formattedDate);
      }
    }
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 max-w-full sm:max-w-7xl">
      <LeafletConfig />
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">ابلاغ ماموریت جدید (بر اساس مشتری)</h1>

        <div className="mb-4 max-w-lg mx-auto">
          <SearchBox onSearchSelect={handleSearchSelect} />
        </div>

        <div className="w-full h-[400px] border rounded-lg mb-6 relative">
          <MapContainer
            center={mapCenter}
            key={mapCenter.toString()}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {selectedUnit && (
              <Marker position={[selectedUnit.latitude, selectedUnit.longitude]} />
            )}
            {destinations.map((dest, index) => (
              <Marker key={index} position={[dest.lat, dest.lng]} />
            ))}
            {route && route.forward && <Polyline positions={route.forward} color="blue" weight={3} />}
            {route && route.return && <Polyline positions={route.return} color="red" weight={3} />}
            <MapEvents onLocationSelect={handleLocationSelect} />
          </MapContainer>
          {watch('totalDistance') && (
            <div className="absolute bottom-4 right-4 bg-white p-2 sm:p-3 rounded-lg shadow-lg text-sm sm:text-base">
              <span className="font-medium">مسافت کل: </span>
              <span className="text-blue-600">{watch('totalDistance') || '0'} کیلومتر</span>
            </div>
          )}
        </div>

        {/* انتخاب مشتری‌ها */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">انتخاب مشتری‌ها (مقاصد به ترتیب انتخاب)</label>
          <Select
            options={customers}
            value={selectedCustomers}
            onChange={setSelectedCustomers}
            isMulti
            isSearchable
            placeholder="انتخاب مشتری‌ها..."
            classNamePrefix="react-select"
          />
        </div>

        {/* فهرست مقاصد */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">مقاصد انتخاب شده</h2>
          {destinations.length === 0 ? (
            <p className="text-gray-500">هنوز مقصدی انتخاب نشده است. مشتری انتخاب کنید یا روی نقشه کلیک کنید.</p>
          ) : (
            <div className="space-y-3">
              {destinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-gray-200">
                  <span className="font-medium">مقصد {index + 1}:</span>
                  <span className="flex-1">{dest.title}</span>
                  <span className="text-sm text-gray-500">({dest.lat.toFixed(4)}, {dest.lng.toFixed(4)})</span>
                  <button onClick={() => removeDestination(index)} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors">حذف</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {/* اطلاعات محاسباتی */}
          <div className="bg-gray-50 p-2 sm:p-4 rounded-lg border border-gray-200 mb-4 sm:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت رفت (کیلومتر)</label>
                <input type="text" value={watch('forwardDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت برگشت (کیلومتر)</label>
                <input type="text" value={watch('returnDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مسافت کل (کیلومتر)</label>
                <input type="text" value={watch('totalDistance') || '0'} readOnly className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان رفت (ساعت)</label>
                <input type="text" value={watch('forwardTime') ? `${watch('forwardTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان برگشت (ساعت)</label>
                <input type="text" value={watch('returnTime') ? `${watch('returnTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">مدت زمان کل (ساعت)</label>
                <input type="text" value={watch('totalTime') ? `${watch('totalTime')} ساعت` : '0 ساعت'} readOnly className="w-full px-2 sm:px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
              </div>
            </div>
          </div>

          {/* تاریخ و واحد مبدا */}
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
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">واحد مبدا <span className="text-red-500">*</span></label>
              <select value={selectedUnit?.id || ''} onChange={handleUnitChange} className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" required>
                {unitLocations.map(unit => (
                  <option key={unit.id} value={unit.id}>{unit.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* سایر فیلدها */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد پرسنلی</label>
              <input {...register('personnelNumber')} type="text" placeholder="کد پرسنلی مسئول ماموریت" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ساعت</label>
              <input {...register('time')} type="time" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text_sm font-medium text-gray-700 mb-1">موضوع ماموریت</label>
              <input {...register('missionSubject')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">همراهان</label>
              <input {...register('companions')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نوع وسیله نقلیه</label>
              <input {...register('transport')} type="text" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">وزن کل (کیلوگرم)</label>
              <input {...register('totalWeightKg')} type="number" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">کد شماره صورت جلسه</label>
              <input type="text" {...register('sessionCode')} className="w-full px-2 sm:px-3 py-2 bg_white border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">هزینه نهایی (تومان)</label>
              <input type="text" value={parseFloat(watch('finalCost') || '0').toLocaleString('fa-IR')} readOnly className="w-full px-2 sm:px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 text-sm sm:text-base text-left" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نرخ انتخاب شده</label>
              <div className="w-full px-2 sm:px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm sm:text-base">
                {selectedRateInfo ? (
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">{selectedRateInfo.title}</span>
                    <span className="text-blue-600">{selectedRateInfo.ratePerKm.toLocaleString('fa-IR')} تومان</span>
                  </div>
                ) : rateLoading ? (
                  <span className="text-gray-500">در حال بارگذاری...</span>
                ) : (
                  <div className="flex items-center justify_between">
                    <span className="text-red-500">نرخ فعال یافت نشد</span>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">نیاز به تنظیم نرخ</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات ماموریت</label>
            <textarea {...register('missionDescription')} rows="4" className="w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base" />
          </div>

          {/* مسئول و همراهان */}
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">مسئول ماموریت</label>
            <Select options={users} onChange={(selected) => setValue('userId', selected)} placeholder="انتخاب مسئول ماموریت..." isClearable className="react-select" />
          </div>
          <div className="form-group">
            <label className="block text-sm font-medium text-gray-700 mb-2">همراهان ماموریت</label>
            <Select options={users} onChange={(selected) => setValue('companionIds', selected)} placeholder="انتخاب همراهان..." isMulti className="react-select" />
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="secondary" onClick={() => router.back()}>انصراف</Button>
            <Button type="submit" variant="primary" loading={loading}>ایجاد ماموریت</Button>
          </div>

          {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
};

const MissionOrderCreateFromCustomersComponent = MissionOrderCreateFromCustomers;
const MissionOrderCreateFromCustomersDynamic = dynamic(() => Promise.resolve(MissionOrderCreateFromCustomersComponent), { ssr: false });
export default MissionOrderCreateFromCustomersDynamic;


