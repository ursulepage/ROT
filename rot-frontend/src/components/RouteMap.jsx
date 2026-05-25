// src/components/RouteMap.jsx

import { useState, useEffect, useRef } from "react";
import { 
  MapPin, 
  Navigation, 
  Bus, 
  Clock, 
  DollarSign, 
  Info,
  Shield,
  Star,
  Wifi,
  Coffee,
  Battery,
  Wind,
  Tv,
  Repeat
} from "lucide-react";

function RouteMap({ from, to }) {
  const [routeData, setRouteData] = useState(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedStop, setSelectedStop] = useState(null);
  const animationRef = useRef(null);

  // Route data with coordinates
  const routesData = {
    "Kigali→Huye": {
      id: 1,
      from: "Kigali",
      to: "Huye",
      distance: "165 km",
      duration: "3.5 hours",
      price: 3500,
      stops: [
        { name: "Kigali", x: 15, y: 50, type: "start", time: "00:00", desc: "Capital City Terminal" },
        { name: "Muhanga", x: 35, y: 65, type: "stop", time: "01:15", desc: "Central Business Hub" },
        { name: "Gitarama", x: 50, y: 75, type: "stop", time: "02:00", desc: "Historical Town" },
        { name: "Kabuye", x: 70, y: 85, type: "stop", time: "02:45", desc: "Scenic Viewpoint" },
        { name: "Huye", x: 90, y: 90, type: "end", time: "03:30", desc: "University City" }
      ],
      amenities: ["Free WiFi", "USB Charging", "Air Conditioning", "Snacks", "Restroom"]
    },
    "Kigali→Musanze": {
      id: 2,
      from: "Kigali",
      to: "Musanze",
      distance: "95 km",
      duration: "2.5 hours",
      price: 5000,
      stops: [
        { name: "Kigali", x: 15, y: 50, type: "start", time: "00:00", desc: "Capital City Terminal" },
        { name: "Gakenke", x: 40, y: 35, type: "stop", time: "01:00", desc: "Mountain Gateway" },
        { name: "Bugarura", x: 65, y: 25, type: "stop", time: "01:45", desc: "Volcano Viewpoint" },
        { name: "Musanze", x: 90, y: 20, type: "end", time: "02:30", desc: "Gorilla Trekking Base" }
      ],
      amenities: ["Free WiFi", "USB Charging", "Air Conditioning", "Restroom"]
    },
    "Kigali→Rubavu": {
      id: 3,
      from: "Kigali",
      to: "Rubavu",
      distance: "120 km",
      duration: "2 hours",
      price: 7000,
      stops: [
        { name: "Kigali", x: 15, y: 50, type: "start", time: "00:00", desc: "Capital City Terminal" },
        { name: "Rubavu", x: 85, y: 15, type: "end", time: "02:00", desc: "Lake Kivu Resort" }
      ],
      amenities: ["Free WiFi", "USB Charging", "Air Conditioning", "Lake View", "Refreshments"]
    }
  };

  useEffect(() => {
    const routeKey = `${from}→${to}`;
    const data = routesData[routeKey];
    if (data) {
      setRouteData(data);
      setAnimationProgress(0);
    } else {
      setRouteData({
        from: from,
        to: to,
        distance: "Unknown",
        duration: "Unknown",
        price: 0,
        stops: [{ name: from, x: 20, y: 20, type: "start", time: "00:00" }, { name: to, x: 80, y: 80, type: "end", time: "Unknown" }]
      });
    }
  }, [from, to]);

  // Continuous looping animation
  useEffect(() => {
    const animate = () => {
      setAnimationProgress(prev => {
        let newProgress = prev + 0.3;
        // When reaches 100, loop back to 0 for continuous movement
        if (newProgress >= 100) {
          newProgress = 0;
        }
        return newProgress;
      });
      
      animationRef.current = setTimeout(animate, 50);
    };
    
    animationRef.current = setTimeout(animate, 50);
    
    return () => clearTimeout(animationRef.current);
  }, []);

  // Get car position based on animation progress
  const getCarPosition = () => {
    if (!routeData) return { x: 0, y: 0, currentStop: "", nextStop: "" };
    const stops = routeData.stops;
    const totalSegments = stops.length - 1;
    const progressIndex = (animationProgress / 100) * totalSegments;
    const currentIndex = Math.floor(progressIndex);
    const nextIndex = Math.min(currentIndex + 1, totalSegments);
    
    if (currentIndex >= stops.length - 1) {
      // When at end, show returning to start (continuous)
      return {
        x: stops[stops.length - 1].x,
        y: stops[stops.length - 1].y,
        currentStop: stops[stops.length - 1].name,
        nextStop: stops[0].name
      };
    }
    
    const segmentProgress = progressIndex - currentIndex;
    const currentStop = stops[currentIndex];
    const nextStop = stops[nextIndex];
    
    return {
      x: currentStop.x + (nextStop.x - currentStop.x) * segmentProgress,
      y: currentStop.y + (nextStop.y - currentStop.y) * segmentProgress,
      currentStop: currentStop.name,
      nextStop: nextStop.name
    };
  };

  const carPos = getCarPosition();
  const currentStopIndex = Math.floor((animationProgress / 100) * (routeData?.stops?.length || 1));

  if (!routeData) {
    return (
      <div className="bg-gray-100 rounded-xl h-96 flex items-center justify-center">
        <div className="text-center">
          <Bus size={48} className="mx-auto text-gray-400 mb-3 animate-pulse" />
          <p className="text-gray-500">Loading route map...</p>
        </div>
      </div>
    );
  }

  // Build road path from stops
  const roadPath = routeData.stops.map((stop, i) => 
    i === 0 ? `M${stop.x},${stop.y}` : `L${stop.x},${stop.y}`
  ).join(" ");

  // Calculate progress for display (always between 0-100)
  const displayProgress = Math.round(animationProgress);

  return (
    <div className="space-y-4">
      {/* Main Map Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 shadow-2xl">
        <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl shadow-inner p-4">
          
          {/* Map Header */}
          <div className="text-center mb-4 pb-3 border-b border-gray-200">
            <h3 className="font-bold text-gray-800 flex items-center justify-center gap-2 text-lg">
              <MapPin size={18} className="text-green-600" />
              {routeData.from} → {routeData.to}
              <MapPin size={18} className="text-red-600" />
            </h3>
            <div className="flex items-center justify-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-gray-600">
                <Clock size={14} /> {routeData.duration}
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <DollarSign size={14} /> {routeData.price.toLocaleString()} RWF
              </span>
              <span className="flex items-center gap-1 text-gray-600">
                <Navigation size={14} /> {routeData.distance}
              </span>
              <span className="flex items-center gap-1 text-green-600">
                <Repeat size={14} /> Continuous Loop
              </span>
            </div>
          </div>

          {/* SVG Map Canvas */}
          <svg viewBox="0 0 100 100" className="w-full max-w-md mx-auto" style={{ background: "#f0fdf4" }}>
            <defs>
              {/* Grid Pattern */}
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#d1fae5" strokeWidth="0.5"/>
              </pattern>
              
              {/* Road Gradient */}
              <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 1 }} />
                <stop offset="50%" style={{ stopColor: "#f59e0b", stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: "#ef4444", stopOpacity: 1 }} />
              </linearGradient>
              
              {/* Building Pattern */}
              <pattern id="buildings" width="4" height="4" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="1.5" height="3" fill="#9ca3af" opacity="0.3"/>
                <rect x="2" y="1" width="1.5" height="2" fill="#9ca3af" opacity="0.3"/>
              </pattern>
              
              {/* Tree Pattern */}
              <pattern id="trees" width="3" height="3" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1" fill="#34d399" opacity="0.4"/>
              </pattern>

              {/* Glow Filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Grid Background */}
            <rect width="100" height="100" fill="url(#grid)" />

            {/* Terrain Features - Hills */}
            <circle cx="20" cy="30" r="10" fill="#86efac" opacity="0.3" />
            <circle cx="70" cy="70" r="12" fill="#6ee7b7" opacity="0.3" />
            <circle cx="45" cy="55" r="8" fill="#a7f3d0" opacity="0.3" />
            <circle cx="80" cy="25" r="6" fill="#86efac" opacity="0.3" />

            {/* Trees */}
            <rect x="25" y="20" width="8" height="6" fill="url(#trees)" />
            <rect x="60" y="75" width="10" height="8" fill="url(#trees)" />
            <rect x="10" y="60" width="6" height="5" fill="url(#trees)" />

            {/* Buildings - City Areas */}
            <rect x="10" y="45" width="8" height="6" fill="url(#buildings)" />
            <rect x="12" y="48" width="10" height="8" fill="url(#buildings)" opacity="0.5" />

            {/* River */}
            <path d="M0,85 Q25,80 50,82 Q75,84 100,78" fill="none" stroke="#60a5fa" strokeWidth="2" opacity="0.4" strokeDasharray="2,2"/>

            {/* Road Shadow */}
            <path
              d={roadPath}
              fill="none"
              stroke="#9ca3af"
              strokeWidth="4.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.4"
              transform="translate(0.5, 0.5)"
            />

            {/* Main Road */}
            <path
              d={roadPath}
              fill="none"
              stroke="url(#roadGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#glow)"
            />

            {/* Road Dashed Center Line */}
            <path
              d={roadPath}
              fill="none"
              stroke="#fff"
              strokeWidth="0.8"
              strokeDasharray="2,3"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.8"
            />

            {/* Moving Progress Trail */}
            <path
              d={roadPath}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={`${(displayProgress / 100) * 200}, 200`}
              opacity="0.6"
            />

            {/* Stops */}
            {routeData.stops.map((stop, idx) => {
              const isStart = stop.type === "start";
              const isEnd = stop.type === "end";
              const isCurrent = idx === currentStopIndex;
              
              return (
                <g 
                  key={idx} 
                  transform={`translate(${stop.x - 3}, ${stop.y - 3})`}
                  onClick={() => setSelectedStop(selectedStop?.name === stop.name ? null : stop)}
                  style={{ cursor: "pointer" }}
                >
                  {/* Pulsing Ring for Current Stop */}
                  {isCurrent && (
                    <circle cx="3" cy="3" r="8" fill="#f59e0b" opacity="0.3">
                      <animate attributeName="r" values="6;12;6" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1s" repeatCount="indefinite" />
                    </circle>
                  )}
                  
                  {/* Stop Marker */}
                  <circle
                    cx="3"
                    cy="3"
                    r="5"
                    fill={isStart ? "#22c55e" : isEnd ? "#ef4444" : "#f59e0b"}
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <circle cx="3" cy="3" r="2" fill="white" />
                  
                  {/* Stop Label */}
                  <text
                    x="10"
                    y="2"
                    fontSize="3.5"
                    fill="#1e293b"
                    fontWeight="bold"
                    dominantBaseline="middle"
                  >
                    {stop.name}
                  </text>
                  
                  {/* Stop Time */}
                  <text
                    x="10"
                    y="7"
                    fontSize="2.5"
                    fill="#64748b"
                    dominantBaseline="middle"
                  >
                    {stop.time}
                  </text>
                </g>
              );
            })}

            {/* Animated Car - Continuously Moving */}
            <g transform={`translate(${carPos.x - 2.5}, ${carPos.y - 2})`}>
              {/* Car Shadow */}
              <ellipse cx="2.5" cy="3.5" rx="3" ry="1" fill="#1e293b" opacity="0.3" />
              
              {/* Car Body */}
              <rect x="0" y="0" width="5" height="3" rx="1" fill="#3b82f6" stroke="#1e40af" strokeWidth="0.3" />
              
              {/* Car Roof */}
              <rect x="0.8" y="-0.5" width="3.4" height="1.5" rx="0.5" fill="#60a5fa" />
              
              {/* Windows */}
              <rect x="1" y="-0.3" width="1.2" height="1" rx="0.2" fill="#93c5fd" />
              <rect x="2.5" y="-0.3" width="1.2" height="1" rx="0.2" fill="#93c5fd" />
              
              {/* Wheels */}
              <circle cx="1" cy="3" r="0.8" fill="#1e293b" />
              <circle cx="4" cy="3" r="0.8" fill="#1e293b" />
              <circle cx="1" cy="3" r="0.4" fill="#475569" />
              <circle cx="4" cy="3" r="0.4" fill="#475569" />
              
              {/* Headlight */}
              <rect x="4.7" y="0.8" width="0.4" height="0.8" rx="0.1" fill="#fef08a">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
              </rect>
              
              {/* Taillight */}
              <rect x="-0.1" y="0.8" width="0.4" height="0.8" rx="0.1" fill="#ef4444">
                <animate attributeName="opacity" values="1;0.3;1" dur="0.5s" repeatCount="indefinite" />
              </rect>
              
              {/* Exhaust Smoke */}
              <circle cx="-1" cy="2" r="0.5" fill="#9ca3af" opacity="0.5">
                <animate attributeName="cx" values="-1;-2.5" dur="0.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.5;0" dur="0.4s" repeatCount="indefinite" />
                <animate attributeName="r" values="0.5;1.2" dur="0.4s" repeatCount="indefinite" />
              </circle>
              
              {/* Motion Lines */}
              <line x1="-1.5" y1="1.5" x2="-0.5" y2="1.5" stroke="#fbbf24" strokeWidth="0.3" opacity="0.6">
                <animate attributeName="x1" values="-1.5;-3" dur="0.3s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0" dur="0.3s" repeatCount="indefinite" />
              </line>
              <line x1="-1.5" y1="2.5" x2="-0.5" y2="2.5" stroke="#fbbf24" strokeWidth="0.3" opacity="0.6">
                <animate attributeName="x1" values="-1.5;-3" dur="0.3s" repeatCount="indefinite" delay="0.1s" />
                <animate attributeName="opacity" values="0.6;0" dur="0.3s" repeatCount="indefinite" delay="0.1s" />
              </line>
            </g>
          </svg>

          {/* Progress Bar - Continuous */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span className="flex items-center gap-1">
                <MapPin size={10} className="text-green-600" /> {routeData.stops[0]?.name}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-semibold">{displayProgress}% Complete</span>
                <Repeat size={12} className="text-green-500 animate-pulse" />
                <span className="text-xs text-green-600">Looping</span>
              </div>
              <span className="flex items-center gap-1">
                {routeData.stops[routeData.stops.length - 1]?.name} <MapPin size={10} className="text-red-600" />
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${displayProgress}%` }}
              />
            </div>
          </div>

          {/* Loop Indicator */}
          <div className="text-center mt-3">
            <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Repeat size={12} />
              Car is continuously moving along the route (looping)
            </p>
          </div>
        </div>
      </div>

      {/* Current Location Card - Continuously Updates */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-4 text-white animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Bus size={24} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm opacity-80">Current Location</p>
            <p className="font-bold text-lg">
              {carPos.currentStop || routeData.stops[0]?.name}
            </p>
            <p className="text-xs opacity-80">
              Next: {carPos.nextStop || routeData.stops[1]?.name || "Looping back"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{displayProgress}%</p>
            <p className="text-xs opacity-80">Journey</p>
          </div>
        </div>
      </div>

      {/* Route Stops Details */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <Navigation size={16} className="text-indigo-600" />
          Route Stops & Schedule
        </h3>
        <div className="space-y-3">
          {routeData.stops.map((stop, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-3 p-2 rounded-lg transition cursor-pointer ${
                selectedStop?.name === stop.name ? "bg-indigo-50" : "hover:bg-gray-50"
              } ${currentStopIndex === index ? "ring-2 ring-indigo-300 bg-indigo-50/50" : ""}`}
              onClick={() => setSelectedStop(selectedStop?.name === stop.name ? null : stop)}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                stop.type === "start" ? "bg-green-500 text-white" :
                stop.type === "end" ? "bg-red-500 text-white" :
                "bg-orange-500 text-white"
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{stop.name}</p>
                <p className="text-xs text-gray-500">{stop.desc || "Stopover point"}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">{stop.time}</p>
                {currentStopIndex === index && (
                  <span className="text-xs text-green-600 animate-pulse">● Current</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bus Amenities */}
      <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="font-semibold text-gray-800 flex items-center gap-2">
            <Shield size={16} className="text-emerald-600" />
            Bus Features
          </h3>
          <span className="text-indigo-600 text-sm">{showDetails ? "▲" : "▼"}</span>
        </button>
        
        {showDetails && (
          <div className="mt-3 pt-3 border-t border-gray-100 animate-in">
            <div className="grid grid-cols-2 gap-2">
              {routeData.amenities?.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                  {amenity === "Free WiFi" && <Wifi size={14} className="text-blue-500" />}
                  {amenity === "USB Charging" && <Battery size={14} className="text-green-500" />}
                  {amenity === "Air Conditioning" && <Wind size={14} className="text-cyan-500" />}
                  {amenity === "Snacks" && <Coffee size={14} className="text-orange-500" />}
                  {amenity === "Restroom" && <div className="w-3 h-3 rounded-full bg-purple-500" />}
                  {amenity === "Lake View" && <Tv size={14} className="text-teal-500" />}
                  {amenity === "Refreshments" && <Coffee size={14} className="text-amber-500" />}
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Passenger Rating</span>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold">4.8</span>
                  <span className="text-gray-400">(234 reviews)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Travel Info */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <h3 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <Info size={16} />
          Travel Information
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-amber-700">📍 Departure</p>
            <p className="font-medium text-gray-800">{routeData.stops[0]?.name} Terminal</p>
          </div>
          <div>
            <p className="text-amber-700">🎯 Destination</p>
            <p className="font-medium text-gray-800">{routeData.stops[routeData.stops.length - 1]?.name}</p>
          </div>
          <div>
            <p className="text-amber-700">⏰ Departure Time</p>
            <p className="font-medium text-gray-800">{new Date().toLocaleTimeString()}</p>
          </div>
          <div>
            <p className="text-amber-700">📅 Date</p>
            <p className="font-medium text-gray-800">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="col-span-2">
            <p className="text-amber-700">🔄 Loop Mode</p>
            <p className="font-medium text-gray-800">Car continuously moves along the route without stopping</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default RouteMap;