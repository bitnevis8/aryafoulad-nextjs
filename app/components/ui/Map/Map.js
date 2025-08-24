"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import SearchBox from './SearchBox';

// Dynamic imports for Leaflet components
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
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

// کامپوننت برای به‌روزرسانی مرکز نقشه
const ChangeView = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMap } = mod;
    return function ChangeView({ center }) {
      const map = useMap();
      useEffect(() => {
        if (map && center) {
          // حفظ سطح زوم کاربر هنگام جابجایی مرکز
          map.panTo(center);
        }
      }, [center, map]);
      return null;
    };
  }),
  { ssr: false }
);

// کامپوننت برای هندل کردن رویداد کلیک روی نقشه
const MapEvents = dynamic(
  () => import('react-leaflet').then((mod) => {
    const { useMapEvents } = mod;
    return function MapEvents({ onMapClick }) {
      useMapEvents({
        click(e) {
          if (onMapClick) {
            onMapClick({ latitude: e.latlng.lat, longitude: e.latlng.lng });
          }
        },
      });
      return null;
    };
  }),
  { ssr: false }
);

const DEFAULT_CENTER = [35.7219, 51.3347];

const Map = ({
  center, // اگر پاس داده نشود، از DEFAULT_CENTER استفاده می‌کنیم
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
  onLocationSelect,
  height = '400px',
  width = '100%',
  className = '',
  showControls = true,
  draggable = true,
  showSearch = false,
  allowSelect = true,
}) => {
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [mapCenter, setMapCenter] = useState(Array.isArray(center) ? center : DEFAULT_CENTER);

  useEffect(() => {
    // همگام‌سازی مرکز داخلی با prop در صورت تغییر بیرونی
    if (Array.isArray(center)) {
      const [lat, lng] = center;
      const [clat, clng] = mapCenter || [];
      if (lat !== clat || lng !== clng) {
        setMapCenter(center);
      }
    }
  }, [center]);

  useEffect(() => {
    // رفع مشکل آیکون‌های پیش‌فرض Leaflet
    const L = require('leaflet');
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }, []);

  const handleMapClick = ({ latitude, longitude }) => {
    if (!allowSelect) return;
    setSelectedPosition([latitude, longitude]);
    setMapCenter([latitude, longitude]);
    onMapClick?.({ latitude, longitude });
    onLocationSelect?.({ latitude, longitude });
  };

  const handleSearchSelect = (coords) => {
    // coords may be [lat, lon]
    const latitude = Array.isArray(coords) ? coords[0] : coords.latitude;
    const longitude = Array.isArray(coords) ? coords[1] : coords.longitude;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      setSelectedPosition([latitude, longitude]);
      setMapCenter([latitude, longitude]);
      onLocationSelect?.({ latitude, longitude });
      onMapClick?.({ latitude, longitude });
    }
  };

  return (
    <div 
      style={{ height, width }} 
      className={`rounded-lg overflow-hidden relative ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={showControls}
        attributionControl={showControls}
      >
        <ChangeView center={mapCenter} />
        {allowSelect && <MapEvents onMapClick={handleMapClick} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        
        {/* نمایش نشانگرهای موجود */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.latitude, marker.longitude]}
            eventHandlers={{
              click: () => onMarkerClick?.(marker)
            }}
          >
            <Popup>
              {marker.name || `موقعیت ${index + 1}`}
            </Popup>
          </Marker>
        ))}
        
        {/* نمایش موقعیت انتخاب شده */}
        {allowSelect && selectedPosition && (
          <Marker position={selectedPosition}>
            <Popup>
              موقعیت انتخاب شده
            </Popup>
          </Marker>
        )}
      </MapContainer>
      {showSearch && (
        <div className="absolute z-[1000] top-2 right-2 w-72 max-w-full pointer-events-auto">
          <SearchBox onSearchSelect={handleSearchSelect} />
        </div>
      )}
    </div>
  );
};

export default Map; 