// src/pages/manager/DriverTracking.jsx

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { RefreshCw, MapPin, Car, Navigation, Clock, AlertCircle } from "lucide-react";

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function DriverTracking() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchDrivers();
    const interval = setInterval(fetchDrivers, 30000); // refresh every 30 sec
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mapRef.current && document.getElementById("map")) {
      // Initialize map centered on Rwanda
      mapRef.current = L.map("map").setView([-1.9441, 30.0619], 8);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> contributors',
      }).addTo(mapRef.current);
    }
    updateMarkers();
  }, [drivers]);

  const fetchDrivers = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_URL}/manager/driver-locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(res.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch driver locations:", err);
      setError("Could not load driver locations. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateMarkers = () => {
    if (!mapRef.current) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    drivers.forEach(driver => {
      if (driver.latitude && driver.longitude) {
        const popupContent = `
          <div style="font-family: sans-serif; min-width: 180px;">
            <strong>${driver.driver_name}</strong><br/>
            📍 ${driver.location_name || "On route"}<br/>
            🚍 ${driver.car_plate} (${driver.car_name || "Bus"})<br/>
            🛣️ ${driver.current_route || "—"}<br/>
            🕒 Last seen: ${new Date(driver.last_update).toLocaleString()}<br/>
            <span style="color: ${driver.status === "active" ? "green" : "gray"}">● ${driver.status}</span>
          </div>
        `;
        const marker = L.marker([driver.latitude, driver.longitude])
          .bindPopup(popupContent)
          .addTo(mapRef.current);
        marker.on("click", () => setSelectedDriver(driver));
        markersRef.current[driver.driver_id] = marker;
      }
    });
  };

  const formatTime = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr)) / 1000 / 60;
    if (diff < 1) return "Just now";
    if (diff < 60) return `${Math.floor(diff)} min ago`;
    return `${Math.floor(diff / 60)} hours ago`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Live Driver Tracking</h1>
          <p className="text-gray-500">Real-time location of your fleet</p>
        </div>
        <button
          onClick={fetchDrivers}
          disabled={refreshing}
          className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={fetchDrivers} className="ml-auto text-sm underline">Retry</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map container */}
        <div className="lg:col-span-2">
          <div id="map" className="h-96 lg:h-[500px] rounded-xl border border-gray-200 shadow-sm" />
          <p className="text-xs text-gray-400 mt-2 text-center">
            📍 Markers show driver last known positions. Click on a marker for details.
          </p>
        </div>

        {/* Driver list */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-800">Active Drivers</h2>
            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
              {drivers.filter(d => d.status === "active").length} online
            </span>
          </div>
          <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
            {drivers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Car size={32} className="mx-auto mb-2 text-gray-300" />
                No active drivers found
              </div>
            ) : (
              drivers.map(driver => (
                <div
                  key={driver.driver_id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedDriver?.driver_id === driver.driver_id ? "bg-indigo-50" : ""}`}
                  onClick={() => {
                    setSelectedDriver(driver);
                    if (driver.latitude && driver.longitude && mapRef.current) {
                      mapRef.current.setView([driver.latitude, driver.longitude], 12);
                      markersRef.current[driver.driver_id]?.openPopup();
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-800">{driver.driver_name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Car size={12} /> {driver.car_plate}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                        driver.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${driver.status === "active" ? "bg-green-600 animate-pulse" : "bg-gray-500"}`} />
                        {driver.status}
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
                    <Navigation size={12} />
                    {driver.location_name || "Location unknown"}
                  </div>
                  <div className="mt-1 text-xs text-gray-400 flex items-center gap-2">
                    <Clock size={12} />
                    {driver.last_update ? formatTime(driver.last_update) : "Never"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Driver Details Modal (optional on click) */}
      {selectedDriver && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Driver Details</h3>
              <button onClick={() => setSelectedDriver(null)} className="p-1 rounded-lg hover:bg-gray-100">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{selectedDriver.driver_name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Phone</span><span>{selectedDriver.phone_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Car</span><span>{selectedDriver.car_plate} ({selectedDriver.car_name})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Route</span><span>{selectedDriver.current_route || "—"}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Last seen</span><span>{new Date(selectedDriver.last_update).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="capitalize">{selectedDriver.status}</span></div>
              {selectedDriver.latitude && selectedDriver.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${selectedDriver.latitude},${selectedDriver.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center bg-indigo-50 text-indigo-700 py-2 rounded-lg hover:bg-indigo-100 transition"
                >
                  View on Google Maps
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverTracking;