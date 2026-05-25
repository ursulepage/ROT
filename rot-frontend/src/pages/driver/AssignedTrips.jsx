// src/pages/driver/AssignedTrips.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Bus,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  Navigation,
  X,
  AlertCircle,
  Play,
  Pause,
  Flag,
} from "lucide-react";
import { Link } from "react-router-dom";

function AssignedTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTrip, setActiveTrip] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTrips();
    getCurrentLocation();
    
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, []);

  const fetchTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error("Geolocation error:", error),
        { enableHighAccuracy: true }
      );
    }
  };

  const startTrip = async (trip) => {
    setActiveTrip(trip);
    
    // Start sending location every 10 seconds
    const interval = setInterval(async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const token = localStorage.getItem("token");
            await axios.post(
              `${API_URL}/driver/location`,
              {
                latitude,
                longitude,
                location_name: `En route: ${trip.travel_from} → ${trip.travel_to}`,
                status: "active",
                current_route: `${trip.travel_from}→${trip.travel_to}`,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (error) {
            console.error("Location update error:", error);
          }
        });
      }
    }, 10000);
    
    setTrackingInterval(interval);
  };

  const endTrip = () => {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }
    setActiveTrip(null);
    alert("Trip ended successfully!");
    fetchTrips();
  };

  const getStatusBadge = (trip) => {
    const now = new Date();
    const tripTime = new Date(trip.travel_time);
    
    if (activeTrip?.id === trip.id) {
      return { text: "In Progress", color: "bg-green-100 text-green-700" };
    } else if (tripTime < now) {
      return { text: "Completed", color: "bg-gray-100 text-gray-700" };
    } else {
      return { text: "Scheduled", color: "bg-blue-100 text-blue-700" };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">My Trips</h1>
        <p className="text-sm text-gray-500">Manage your assigned routes and track your journey</p>
      </div>

      {/* Active Trip Banner */}
      {activeTrip && (
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl p-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Navigation size={20} />
              </div>
              <div>
                <h3 className="font-bold">Active Trip: {activeTrip.travel_from} → {activeTrip.travel_to}</h3>
                <p className="text-sm text-green-100">Live location tracking active</p>
              </div>
            </div>
            <button
              onClick={endTrip}
              className="px-4 py-2 bg-white text-green-700 rounded-lg font-medium hover:bg-gray-100 transition flex items-center gap-2"
            >
              <Flag size={16} />
              End Trip
            </button>
          </div>
          {currentLocation && (
            <div className="mt-3 pt-3 border-t border-white/20 text-sm">
              📍 Current Location: {currentLocation.lat?.toFixed(4)}°, {currentLocation.lng?.toFixed(4)}°
            </div>
          )}
        </div>
      )}

      {/* Trips List */}
      <div className="grid gap-4">
        {trips.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Bus size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No trips assigned yet</p>
          </div>
        ) : (
          trips.map((trip) => {
            const status = getStatusBadge(trip);
            const isExpired = new Date(trip.travel_time) < new Date();
            
            return (
              <div
                key={trip.id}
                className={`bg-white rounded-xl shadow-sm border p-5 transition ${
                  activeTrip?.id === trip.id ? "border-green-300 shadow-md" : "border-gray-100"
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={16} className="text-orange-600" />
                      <span className="font-semibold text-gray-800">
                        {trip.travel_from} → {trip.travel_to}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={14} />
                        <span>{new Date(trip.travel_time).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Bus size={14} />
                        <span>{trip.car_plate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={14} />
                        <span>{trip.passenger_count || 0} passengers</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!isExpired && activeTrip?.id !== trip.id && (
                    <button
                      onClick={() => startTrip(trip)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition flex items-center gap-2"
                    >
                      <Play size={14} />
                      Start Trip
                    </button>
                  )}
                  
                  {activeTrip?.id === trip.id && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Navigation size={14} className="animate-pulse" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                  )}
                  
                  {isExpired && activeTrip?.id !== trip.id && (
                    <div className="flex items-center gap-2 text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
                      <CheckCircle size={14} />
                      <span className="text-sm">Completed</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default AssignedTrips;