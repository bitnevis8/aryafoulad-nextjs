"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

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
const useMap = dynamic(
  () => import('react-leaflet').then((mod) => mod.useMap),
  { ssr: false }
);

// کامپوننت برای به‌روزرسانی مرکز نقشه
function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const Map = ({
  center = [35.7219, 51.3347], // تهران به عنوان مرکز پیش‌فرض
  zoom = 13,
  markers = [],
  onMarkerClick,
  onMapClick,
  height = '400px',
  width = '100%',
  className = '',
  showControls = true,
  draggable = true,
}) => {
  const [selectedPosition, setSelectedPosition] = useState(null);

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

  const handleMapClick = (e) => {
    if (onMapClick) {
      const { lat, lng } = e.latlng;
      onMapClick({ latitude: lat, longitude: lng });
      setSelectedPosition([lat, lng]);
    }
  };

  return (
    <div 
      style={{ height, width }} 
      className={`rounded-lg overflow-hidden ${className}`}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={showControls}
        attributionControl={showControls}
      >
        <ChangeView center={center} zoom={zoom} />
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

        {/* نشانگر انتخاب شده */}
        {selectedPosition && (
          <Marker
            position={selectedPosition}
            draggable={draggable}
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onMapClick({ latitude: lat, longitude: lng });
              }
            }}
          >
            <Popup>
              موقعیت انتخاب شده
            </Popup>
          </Marker>
        )}

        {/* فعال کردن کلیک روی نقشه */}
        {onMapClick && (
          <div
            className="absolute inset-0 z-[1000] cursor-pointer"
            onClick={handleMapClick}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map; 