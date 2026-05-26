// src/pages/manager/DriverTracking.jsx

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { 
  RefreshCw, MapPin, Car, Navigation, Clock, AlertCircle, X, 
  Target, Satellite, Eye, Users, Truck, Route, Gauge, Wifi, WifiOff,
  ZoomIn, ZoomOut, Compass
} from "lucide-react";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom vehicle marker
const createVehicleMarker = (isActive, color = "#10B981", locationName = "") => {
  return L.divIcon({
    html: `
      <div style="position: relative;">
        <div style="
          background: ${color};
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
          font-size: 22px;
          ${isActive ? 'animation: pulse 1.5s infinite;' : ''}
          transition: transform 0.2s;
          cursor: pointer;
        "
        onmouseover="this.style.transform='scale(1.1)'"
        onmouseout="this.style.transform='scale(1)'">
          🚍
        </div>
        ${locationName ? `
          <div style="
            position: absolute;
            bottom: -20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.75);
            color: white;
            padding: 2px 6px;
            border-radius: 12px;
            font-size: 10px;
            white-space: nowrap;
            font-weight: 500;
            pointer-events: none;
          ">
            ${locationName.length > 15 ? locationName.substring(0, 12) + '...' : locationName}
          </div>
        ` : ''}
        <style>
          @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
          }
        </style>
      </div>
    `,
    className: "custom-marker",
    iconSize: [44, 44],
    popupAnchor: [0, -22],
  });
};

// Function to get location name from coordinates using reverse geocoding
const getLocationName = async (lat, lng) => {
  try {
    // Using OpenStreetMap Nominatim API for reverse geocoding
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    
    if (data && data.display_name) {
      // Extract city/town name or road name
      const city = data.address?.city || data.address?.town || data.address?.village || data.address?.suburb;
      const road = data.address?.road || data.address?.pedestrian;
      if (city && road) return `${road}, ${city}`;
      if (city) return city;
      if (road) return road;
      return data.display_name.split(',')[0];
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
};

function DriverTracking() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [mapType, setMapType] = useState("street");
  const [zoomLevel, setZoomLevel] = useState(8);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch drivers every 10 seconds
  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current && document.getElementById("map")) {
      // Initialize map centered on Rwanda
      mapRef.current = L.map("map").setView([-1.9441, 30.0619], zoomLevel);
      
      // Add zoom control with custom position
      L.control.zoom({
        position: 'topright'
      }).addTo(mapRef.current);
      
      updateMapTile();
      
      // Add click handler to get location name on map click
      mapRef.current.on('click', async (e) => {
        const locationName = await getLocationName(e.latlng.lat, e.latlng.lng);
        if (locationName) {
          L.popup()
            .setLatLng(e.latlng)
            .setContent(`
              <div style="font-family: system-ui; text-align: center;">
                <strong>📍 ${locationName}</strong><br/>
                <small>${e.latlng.lat.toFixed(6)}°, ${e.latlng.lng.toFixed(6)}°</small>
              </div>
            `)
            .openOn(mapRef.current);
        }
      });
    }
    
    // Update zoom level when map zoom changes
    if (mapRef.current) {
      mapRef.current.on('zoomend', () => {
        setZoomLevel(mapRef.current.getZoom());
      });
    }
    
    updateMarkers();
  }, [drivers, mapType]);

  const updateMapTile = () => {
    if (!mapRef.current) return;
    
    mapRef.current.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        mapRef.current.removeLayer(layer);
      }
    });
    
    let tileUrl, attribution;
    
    if (mapType === "street") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
      attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    } else {
      tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
      attribution = '&copy; <a href="https://www.esri.com/">Esri</a>';
    }
    
    L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(mapRef.current);
  };

  const fetchDrivers = async () => {
    setRefreshing(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/manager/driver-locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Enrich drivers with location names
      const enrichedDrivers = await Promise.all(response.data.map(async (driver) => {
        if (driver.latitude && driver.longitude && driver.latitude !== 'null' && driver.longitude !== 'null') {
          const lat = parseFloat(driver.latitude);
          const lng = parseFloat(driver.longitude);
          if (!isNaN(lat) && !isNaN(lng)) {
            // Try to get location name if not provided
            if (!driver.location_name || driver.location_name === 'On route') {
              const locationName = await getLocationName(lat, lng);
              if (locationName) {
                driver.location_name = locationName;
              }
            }
          }
        }
        return driver;
      }));
      
      setDrivers(enrichedDrivers);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch driver locations:", err);
      setError(err.response?.data?.message || "Could not load driver locations.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateMarkers = () => {
    if (!mapRef.current) return;
    
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    drivers.forEach(driver => {
      if (driver.latitude && driver.longitude && driver.latitude !== 'null' && driver.longitude !== 'null') {
        const lat = parseFloat(driver.latitude);
        const lng = parseFloat(driver.longitude);
        
        if (isNaN(lat) || isNaN(lng)) return;
        
        const lastUpdateTime = new Date(driver.last_update);
        const minutesAgo = (Date.now() - lastUpdateTime) / 1000 / 60;
        const isActive = minutesAgo < 5;
        const markerColor = isActive ? "#10B981" : "#EF4444";
        
        const icon = createVehicleMarker(isActive, markerColor, driver.location_name);
        
        // Calculate estimated arrival time if route exists
        let estimatedArrival = "";
        if (driver.current_route && driver.tripProgress) {
          const remainingPercent = 100 - (driver.tripProgress || 0);
          const etaMinutes = Math.round(remainingPercent * 0.5);
          if (etaMinutes > 0) {
            estimatedArrival = `<div><strong>ETA:</strong> ~${etaMinutes} min</div>`;
          }
        }
        
        const popupContent = `
          <div style="font-family: system-ui; min-width: 280px; max-width: 320px;">
            <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 12px;">
                <div style="background: ${markerColor}; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                  🚍
                </div>
                <div>
                  <strong style="font-size: 16px;">${driver.driver_name}</strong>
                  <p style="margin: 0; font-size: 11px; color: ${markerColor};">
                    ${isActive ? '● Live Tracking' : '● Offline'}
                  </p>
                </div>
              </div>
            </div>
            <div style="margin-top: 8px;">
              <div style="margin-bottom: 6px;">
                <strong style="color: #374151;">📍 Current Location:</strong><br/>
                <span style="color: #4F46E5; font-weight: 500;">${driver.location_name || 'On route'}</span>
              </div>
              <div style="margin-bottom: 6px;">
                <strong>🚌 Vehicle:</strong> ${driver.car_plate || 'Not Assigned'}
              </div>
              <div style="margin-bottom: 6px;">
                <strong>🛣️ Route:</strong> ${driver.current_route || '—'}
              </div>
              ${driver.tripProgress ? `
                <div style="margin: 10px 0;">
                  <div style="font-size: 10px; color: #6B7280;">Trip Progress</div>
                  <div style="background: #e5e7eb; border-radius: 10px; height: 6px; margin-top: 4px;">
                    <div style="background: #4F46E5; width: ${driver.tripProgress}%; height: 6px; border-radius: 10px;"></div>
                  </div>
                  <div style="display: flex; justify-content: space-between; margin-top: 4px;">
                    <span style="font-size: 10px;">${driver.travel_from || 'Start'}</span>
                    <span style="font-size: 10px; color: #4F46E5;">${driver.tripProgress}%</span>
                    <span style="font-size: 10px;">${driver.travel_to || 'End'}</span>
                  </div>
                </div>
              ` : ''}
              ${estimatedArrival}
              <div style="margin-top: 6px;">
                <strong>📡 Coordinates:</strong><br/>
                <code style="font-size: 11px; background: #f3f4f6; padding: 2px 4px; border-radius: 4px;">
                  ${lat.toFixed(6)}°, ${lng.toFixed(6)}°
                </code>
              </div>
              <div style="margin-top: 8px; color: #6B7280; font-size: 10px;">
                ⏱️ Last update: ${formatTime(driver.last_update)}
              </div>
            </div>
            <div style="margin-top: 12px; display: flex; gap: 8px;">
              <a href="https://www.google.com/maps?q=${lat},${lng}" target="_blank" style="flex: 1; background: #4F46E5; color: white; text-decoration: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; text-align: center;">
                📍 Google Maps
              </a>
              <button onclick="window.zoomToDriver(${lat}, ${lng})" style="flex: 1; background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-size: 12px; cursor: pointer;">
                🔍 Zoom In
              </button>
            </div>
          </div>
        `;
        
        const marker = L.marker([lat, lng], { icon })
          .bindPopup(popupContent, { maxWidth: 350, minWidth: 280 })
          .addTo(mapRef.current);
        
        marker.on("click", () => setSelectedDriver(driver));
        markersRef.current[driver.driver_id] = marker;
      }
    });

    // Fit bounds to show all markers
    if (Object.keys(markersRef.current).length > 0) {
      const bounds = [];
      drivers.forEach(driver => {
        if (driver.latitude && driver.longitude) {
          bounds.push([parseFloat(driver.latitude), parseFloat(driver.longitude)]);
        }
      });
      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  // Add global function for zoom from popup
  useEffect(() => {
    window.zoomToDriver = (lat, lng) => {
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 18);
      }
    };
    return () => {
      delete window.zoomToDriver;
    };
  }, []);

  const formatTime = (dateStr) => {
    if (!dateStr) return "Never";
    const date = new Date(dateStr);
    const diff = (Date.now() - date) / 1000 / 60;
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)} min ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const getSignalQuality = (lastUpdateTime) => {
    if (!lastUpdateTime) return { label: "No Signal", color: "bg-gray-500", icon: <WifiOff size={12} /> };
    const minutesAgo = (Date.now() - new Date(lastUpdateTime)) / 1000 / 60;
    if (minutesAgo < 2) return { label: "Excellent", color: "bg-green-500", icon: <Wifi size={12} /> };
    if (minutesAgo < 5) return { label: "Good", color: "bg-green-400", icon: <Wifi size={12} /> };
    if (minutesAgo < 10) return { label: "Fair", color: "bg-yellow-500", icon: <Wifi size={12} /> };
    return { label: "Poor", color: "bg-red-500", icon: <WifiOff size={12} /> };
  };

  const centerMapOnDriver = (driver) => {
    if (driver.latitude && driver.longitude && mapRef.current) {
      const lat = parseFloat(driver.latitude);
      const lng = parseFloat(driver.longitude);
      if (!isNaN(lat) && !isNaN(lng)) {
        mapRef.current.setView([lat, lng], 16);
        if (markersRef.current[driver.driver_id]) {
          markersRef.current[driver.driver_id].openPopup();
        }
      }
    }
    setSelectedDriver(driver);
  };

  const centerMapOnAllDrivers = () => {
    if (Object.keys(markersRef.current).length > 0 && mapRef.current) {
      const bounds = [];
      drivers.forEach(driver => {
        if (driver.latitude && driver.longitude) {
          bounds.push([parseFloat(driver.latitude), parseFloat(driver.longitude)]);
        }
      });
      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const zoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.setView([-1.9441, 30.0619], 8);
    }
  };

  const activeDrivers = drivers.filter(d => {
    if (!d.last_update) return false;
    const minutesAgo = (Date.now() - new Date(d.last_update)) / 1000 / 60;
    return minutesAgo < 10;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-gray-500">Loading driver locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="text-indigo-600" /> Live Driver Tracking
          </h1>
          <p className="text-gray-500">Real-time GPS location of your fleet</p>
          {lastUpdate && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={12} />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMapType("street")}
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1 ${
                mapType === "street" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"
              }`}
            >
              <MapPin size={14} /> Street
            </button>
            <button
              onClick={() => setMapType("satellite")}
              className={`px-3 py-1.5 rounded-md text-sm transition flex items-center gap-1 ${
                mapType === "satellite" ? "bg-white shadow-sm text-indigo-600" : "text-gray-600"
              }`}
            >
              <Satellite size={14} /> Satellite
            </button>
          </div>
          <button
            onClick={fetchDrivers}
            disabled={refreshing}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Updating..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchDrivers} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Total Drivers</p>
          <p className="text-2xl font-bold text-gray-800">{drivers.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Active Now</p>
          <p className="text-2xl font-bold text-green-600">{activeDrivers.length}</p>
          <p className="text-xs text-gray-400">{Math.round((activeDrivers.length / drivers.length) * 100) || 0}% of fleet</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">With GPS</p>
          <p className="text-2xl font-bold text-indigo-600">{drivers.filter(d => d.latitude && d.longitude).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">On Route</p>
          <p className="text-2xl font-bold text-blue-600">{drivers.filter(d => d.current_route).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <p className="text-xs text-gray-500 uppercase">Online Status</p>
          <p className="text-2xl font-bold text-orange-600">{drivers.filter(d => d.status === "active").length}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <div className="relative">
            <div id="map" className="h-[550px] rounded-xl border shadow-sm bg-gray-50" style={{ zIndex: 1 }} />
            
            {/* Custom Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
              <button
                onClick={zoomIn}
                className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition"
                title="Zoom In"
              >
                <ZoomIn size={18} className="text-gray-600" />
              </button>
              <button
                onClick={zoomOut}
                className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition"
                title="Zoom Out"
              >
                <ZoomOut size={18} className="text-gray-600" />
              </button>
              <button
                onClick={resetView}
                className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition"
                title="Reset View"
              >
                <Compass size={18} className="text-gray-600" />
              </button>
            </div>
            
            <button
              onClick={centerMapOnAllDrivers}
              className="absolute bottom-4 right-4 bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition z-10"
              title="Show all drivers"
            >
              <Target size={18} className="text-indigo-600" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-gray-500">Live (&lt;2min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-gray-500">Good (2-5min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-gray-500">Fair (5-10min)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-gray-500">Poor (&gt;10min)</span>
              </div>
            </div>
            <p className="text-xs text-gray-400">📍 {drivers.filter(d => d.latitude && d.longitude).length} driver(s) sharing location</p>
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            💡 Tip: Click anywhere on the map to see location name | Use + / - buttons to zoom | Click markers for driver details
          </p>
        </div>

        {/* Driver List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-indigo-50 border-b font-semibold text-gray-800 flex justify-between items-center">
            <span>🚍 Drivers List</span>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {activeDrivers.length} active
            </span>
          </div>
          <div className="divide-y max-h-[550px] overflow-y-auto">
            {drivers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Car size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No drivers found</p>
                <p className="text-xs mt-1">Drivers will appear here when they start sharing location</p>
              </div>
            ) : (
              drivers.map(driver => {
                const signal = getSignalQuality(driver.last_update);
                const hasGps = driver.latitude && driver.longitude;
                const lat = hasGps ? parseFloat(driver.latitude) : null;
                const lng = hasGps ? parseFloat(driver.longitude) : null;
                const isLive = driver.status === "active";
                
                return (
                  <div
                    key={driver.driver_id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-all ${
                      selectedDriver?.driver_id === driver.driver_id ? "bg-indigo-50 border-l-4 border-indigo-500" : ""
                    }`}
                    onClick={() => centerMapOnDriver(driver)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isLive ? "bg-green-100" : "bg-gray-100"
                        }`}>
                          <Car size={20} className={isLive ? "text-green-600" : "text-gray-500"} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 flex items-center gap-2">
                            {driver.driver_name}
                            {isLive && (
                              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                LIVE
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Truck size={10} /> {driver.car_plate || "No car assigned"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {signal.icon}
                        <span className="text-xs text-gray-600">{signal.label}</span>
                      </div>
                    </div>

                    {/* Location Name - Important */}
                    {driver.location_name && (
                      <div className="mb-2 p-2 bg-indigo-50 rounded-lg">
                        <div className="flex items-center gap-1 text-xs text-indigo-600 mb-1">
                          <MapPin size={12} /> Current Location
                        </div>
                        <p className="text-sm font-medium text-indigo-800">{driver.location_name}</p>
                      </div>
                    )}

                    {/* Current Route */}
                    {driver.current_route && (
                      <div className="mb-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-1 text-xs text-indigo-600 mb-1">
                          <Route size={12} /> Current Route
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{driver.travel_from || 'Start'}</span>
                          <span>→</span>
                          <span className="font-medium">{driver.travel_to || 'Destination'}</span>
                        </div>
                      </div>
                    )}

                    {/* Coordinates */}
                    {hasGps && lat && lng && !isNaN(lat) && !isNaN(lng) && (
                      <div className="bg-gray-50 rounded-lg p-2 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-600 flex items-center gap-1">
                            <Target size={10} /> GPS Coordinates
                          </span>
                          <span className="text-xs text-gray-400">{formatTime(driver.last_update)}</span>
                        </div>
                        <div className="flex justify-between text-xs mt-1">
                          <code className="font-mono text-indigo-700">{lat.toFixed(6)}</code>
                          <code className="font-mono text-indigo-700">{lng.toFixed(6)}</code>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-2">
                      {hasGps && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            centerMapOnDriver(driver);
                          }}
                          className="flex-1 text-xs bg-indigo-50 text-indigo-700 py-1.5 rounded-lg hover:bg-indigo-100 transition flex items-center justify-center gap-1"
                        >
                          <Target size={12} /> Center Map
                        </button>
                      )}
                      <a
                        href={hasGps ? `https://www.google.com/maps?q=${lat},${lng}` : "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex-1 text-xs py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                          hasGps ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                        }`}
                        onClick={(e) => !hasGps && e.preventDefault()}
                      >
                        <MapPin size={12} /> Google Maps
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Driver Details Modal */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelectedDriver(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-5 text-white sticky top-0">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    <Car size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{selectedDriver.driver_name}</h3>
                    <p className="text-indigo-200 text-sm">
                      {selectedDriver.status === "active" ? "● Active Driver" : "○ Offline"}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedDriver(null)} className="p-2 hover:bg-white/20 rounded-lg transition">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="p-5 space-y-4">
              {/* Location Name Section */}
              {selectedDriver.location_name && (
                <div className="bg-indigo-50 rounded-xl p-4">
                  <h4 className="font-semibold text-indigo-800 mb-2 flex items-center gap-2">
                    <MapPin size={16} /> Current Location
                  </h4>
                  <p className="text-indigo-900 font-medium">{selectedDriver.location_name}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg">
                <div><span className="text-gray-500 text-xs">Phone</span><p className="font-medium text-sm">{selectedDriver.phone_number || "—"}</p></div>
                <div><span className="text-gray-500 text-xs">Vehicle</span><p className="font-medium text-sm">{selectedDriver.car_plate || "—"}</p></div>
                <div><span className="text-gray-500 text-xs">Route</span><p className="font-medium text-sm">{selectedDriver.current_route || "—"}</p></div>
                <div><span className="text-gray-500 text-xs">Last Update</span><p className="font-medium text-sm">{formatTime(selectedDriver.last_update)}</p></div>
              </div>

              {selectedDriver.latitude && selectedDriver.longitude && (
                <div className="border rounded-lg p-3">
                  <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Target size={14} /> GPS Coordinates
                  </h4>
                  <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Latitude:</span>
                      <code className="font-mono text-indigo-700">{parseFloat(selectedDriver.latitude).toFixed(8)}</code>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Longitude:</span>
                      <code className="font-mono text-indigo-700">{parseFloat(selectedDriver.longitude).toFixed(8)}</code>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                {selectedDriver.latitude && selectedDriver.longitude && (
                  <>
                    <button
                      onClick={() => {
                        if (mapRef.current) {
                          mapRef.current.setView([parseFloat(selectedDriver.latitude), parseFloat(selectedDriver.longitude)], 18);
                          setSelectedDriver(null);
                        }
                      }}
                      className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <ZoomIn size={16} /> Zoom In
                    </button>
                    <a
                      href={`https://www.google.com/maps?q=${selectedDriver.latitude},${selectedDriver.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 font-medium"
                    >
                      <MapPin size={16} /> Open Maps
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverTracking;