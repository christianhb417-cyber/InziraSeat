
import React from 'react';
import { Bus, MapPin, Navigation } from 'lucide-react';
import { Bus as BusType, Coordinates } from '../types';
import { CITY_COORDINATES } from '../constants';

interface LiveMapProps {
  buses: BusType[];
  height?: string;
  focusedBusId?: string;
  showAllCities?: boolean;
}

// Rwanda Bounds for normalization
// Min Lat: -2.9, Max Lat: -1.0
// Min Lng: 28.8, Max Lng: 30.9
const MIN_LAT = -2.95;
const MAX_LAT = -1.00;
const MIN_LNG = 28.80;
const MAX_LNG = 30.95;

const normalize = (lat: number, lng: number) => {
  const y = ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * 100;
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
  return { x, y };
};

export const LiveMap: React.FC<LiveMapProps> = ({ 
  buses, 
  height = '400px', 
  focusedBusId,
  showAllCities = true 
}) => {
  
  return (
    <div className={`w-full relative bg-[#050508] border border-white/10 rounded-3xl overflow-hidden shadow-inner shadow-black`} style={{ height }}>
      {/* Grid Overlay */}
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none"></div>
      
      {/* Radar Circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border border-white/5 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] h-[50%] border border-white/5 rounded-full pointer-events-none"></div>

      {/* Cities Layer */}
      {showAllCities && Object.entries(CITY_COORDINATES).map(([name, coords]) => {
        const { x, y } = normalize(coords.lat, coords.lng);
        return (
          <div key={name} className="absolute group z-10" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}>
            <div className="w-2 h-2 bg-white/20 rounded-full border border-white/40 group-hover:bg-primary transition-colors"></div>
            <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-mono uppercase opacity-50 group-hover:opacity-100 whitespace-nowrap">{name}</span>
          </div>
        );
      })}

      {/* Buses Layer */}
      {buses.map(bus => {
        if (focusedBusId && bus.busId !== focusedBusId) return null;
        
        const { x, y } = normalize(bus.location.lat, bus.location.lng);
        const isFocused = focusedBusId === bus.busId;
        
        return (
          <div 
            key={bus.busId} 
            className="absolute z-20 transition-all duration-1000 ease-linear" 
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
          >
            {/* Pulse Effect */}
            <div className={`absolute inset-0 rounded-full ${bus.status === 'active' || bus.status === 'departed' ? 'bg-primary/30 animate-ping' : 'bg-gray-500/10'}`}></div>
            
            {/* Marker */}
            <div className={`relative w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg backdrop-blur-sm 
              ${bus.status === 'active' ? 'bg-primary/20 border-primary text-primary' : 
                bus.status === 'departed' ? 'bg-accent/20 border-accent text-accent' : 
                'bg-gray-800/80 border-gray-600 text-gray-400'
              } ${isFocused ? 'scale-125' : ''}`}>
               <Navigation size={14} style={{ transform: `rotate(${bus.heading || 0}deg)` }} fill="currentColor" />
            </div>

            {/* Tooltip */}
            <div className={`absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-white/10 px-3 py-1.5 rounded-xl whitespace-nowrap z-30
              ${isFocused ? 'opacity-100' : 'opacity-0 hover:opacity-100'} transition-opacity pointer-events-none`}>
               <p className="text-xs font-bold text-white">{bus.busNumber}</p>
               <p className="text-[10px] text-gray-400">{bus.currentSpeed || 0} km/h</p>
            </div>
          </div>
        );
      })}

      {/* HUD Overlay */}
      <div className="absolute top-4 right-4 flex gap-2">
         <div className="px-2 py-1 rounded bg-black/40 border border-white/10 text-[10px] font-mono text-primary animate-pulse">LIVE TRACKING</div>
      </div>
    </div>
  );
};
