import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { GlassCard } from '@/components/common/GlassCard';
import { useGPS } from '@/hooks/useGPS';
import { MapPin, Users, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

export function GPSMap() {
  const { workers, userLocation } = useGPS();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const center: L.LatLngExpression = userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : [19.0760, 72.8777];

    // Initialize map
    const map = L.map(mapContainerRef.current).setView(center, 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // Only run once on mount

  // Update markers when workers change
  useEffect(() => {
    if (!mapRef.current) return;

    const defaultIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });

    // Remove old markers that aren't in current list
    Object.keys(markersRef.current).forEach(id => {
      if (!workers.find(w => w.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // Add or update markers
    workers.forEach(worker => {
      const pos: L.LatLngExpression = [worker.location.lat, worker.location.lng];
      if (markersRef.current[worker.id]) {
        markersRef.current[worker.id].setLatLng(pos);
      } else {
        const marker = L.marker(pos, { icon: defaultIcon })
          .addTo(mapRef.current!)
          .bindPopup(`<b>${worker.name}</b><br>${worker.status}`);
        markersRef.current[worker.id] = marker;
      }
    });

    // Update user location
    if (userLocation) {
      const userPos: L.LatLngExpression = [userLocation.lat, userLocation.lng];
      if (markersRef.current['user']) {
        markersRef.current['user'].setLatLng(userPos);
      } else {
        const userMarker = L.marker(userPos, { 
          icon: L.icon({
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            className: 'hue-rotate-90' // Make user marker blue/different
          }) 
        })
        .addTo(mapRef.current!)
        .bindPopup('<b>Your Location</b>');
        markersRef.current['user'] = userMarker;
      }
    }
  }, [workers, userLocation]);

  return (
    <div className="h-full min-h-[400px] relative rounded-xl overflow-hidden border border-white/10">
      <div ref={mapContainerRef} className="absolute inset-0 z-10" />
      
      {/* Minimal Overlay */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/80">{workers.length} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-white/80">Live</span>
          </div>
        </div>
      </div>
    </div>
  );
}
