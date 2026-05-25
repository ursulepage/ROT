// src/pages/driver/DriverDashboard.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bus, MapPin, Clock, Users, CheckCircle, Navigation, Calendar,
  AlertCircle, Ticket, LogOut, Menu, X, Bell, Play, Flag,
  Phone, DollarSign, Search, LayoutDashboard, User, Car,
  ChevronDown, RefreshCw, ArrowRight, Loader2, Info,
  Settings, Award, Star, QrCode, Printer, Shield, Eye, EyeOff,
  Globe, AlarmClock, TrendingUp, Headphones, Mail, UserPlus,
  Circle, CircleCheck, CircleDot, Route, Truck
} from "lucide-react";

function DriverDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ================= STATE MANAGEMENT =================
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [driverInfo, setDriverInfo] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Trip Progress
  const [tripProgress, setTripProgress] = useState(0);
  const [currentStopIndex, setCurrentStopIndex] = useState(0);
  const [completedStops, setCompletedStops] = useState([]);
  
  // Car Assignment
  const [showCarAssignment, setShowCarAssignment] = useState(false);
  const [availableLaunches, setAvailableLaunches] = useState([]);
  const [selectedLaunchId, setSelectedLaunchId] = useState("");
  const [selectedLaunchDetails, setSelectedLaunchDetails] = useState(null);
  const [carLoading, setCarLoading] = useState(false);
  const [assigningCar, setAssigningCar] = useState(false);
  
  // Trip Management
  const [assignedTrips, setAssignedTrips] = useState([]);
  const [stats, setStats] = useState({
    totalTrips: 0, completedTrips: 0, upcomingTrips: 0,
    totalPassengers: 0, todayEarnings: 0, rating: 4.8
  });
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  
  // Passenger Management
  const [showPassengersModal, setShowPassengersModal] = useState(false);
  const [passengersOnBoard, setPassengersOnBoard] = useState([]);
  const [expiringPassengers, setExpiringPassengers] = useState([]);
  const [currentStop, setCurrentStop] = useState("");
  const [routeStops, setRouteStops] = useState([]);
  const [tripStarted, setTripStarted] = useState(false);
  const [tripCompleted, setTripCompleted] = useState(false);
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [editForm, setEditForm] = useState({ driver_name: "", phone_number: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const [weather] = useState({ temp: 24, icon: "☀️" });

  // ================= MENU ITEMS =================
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "trips", name: "My Trips", icon: <Calendar size={20} /> },
    { id: "tickets", name: "Tickets", icon: <Ticket size={20} /> },
    { id: "support", name: "Support", icon: <Headphones size={20} /> },
  ];

  // ================= HELPER FUNCTIONS =================
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setDriverInfo(parsed);
      setEditForm({
        driver_name: parsed.driver_name || "",
        phone_number: parsed.phone_number || "",
        email: parsed.email || "",
      });
    }
    
    initializeDriver();
    
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, []);

  const initializeDriver = async () => {
    await fetchAssignedTrips();
    await fetchTickets();
    await fetchAvailableLaunches();
    getCurrentLocation();
    loadNotifications();
    setLoading(false);
  };

  // Calculate trip progress based on completed stops
  const calculateProgress = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  // Mark current location as arrived
  const markArrivedAtStop = async (stop, index) => {
    if (!activeTrip) {
      alert("No active trip. Please start a trip first.");
      return;
    }
    
    setCurrentStop(stop);
    setCurrentStopIndex(index);
    
    // Add to completed stops if not already
    if (!completedStops.includes(stop)) {
      const newCompleted = [...completedStops, stop];
      setCompletedStops(newCompleted);
      const progress = calculateProgress(newCompleted.length, routeStops.length);
      setTripProgress(progress);
      
      addNotification(`📍 Arrived at ${stop} - Trip ${progress}% complete`, "success");
      
      // Check for passengers getting off at this stop
      const passengersForStop = passengersOnBoard.filter(p => p.travel_to === stop);
      if (passengersForStop.length > 0) {
        setExpiringPassengers(passengersForStop);
        setShowPassengersModal(true);
        addNotification(`🔔 ${passengersForStop.length} passenger(s) need to get off at ${stop}`, "warning");
      }
      
      // If all stops completed, show completion
      if (newCompleted.length === routeStops.length) {
        addNotification("🎉 All stops completed! Click 'Finish Trip' to end the trip.", "success");
      }
    }
  };

  // Mark passengers as arrived (expire their tickets)
  const markPassengersArrived = async () => {
    if (expiringPassengers.length === 0) return;
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/driver/mark-arrived`, 
        { passenger_ids: expiringPassengers.map(p => p.id), location_name: currentStop },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state - expire tickets
      const updatedTickets = tickets.map(ticket => 
        expiringPassengers.some(p => p.id === ticket.id) 
          ? { ...ticket, ticket_life_cycle: "expired" }
          : ticket
      );
      setTickets(updatedTickets);
      
      // Remove from onboard
      setPassengersOnBoard(prev => prev.filter(p => !expiringPassengers.some(ep => ep.id === p.id)));
      
      addNotification(`✅ ${expiringPassengers.length} passenger(s) got off at ${currentStop}`, "success");
      setShowPassengersModal(false);
      setExpiringPassengers([]);
      fetchTickets();
    } catch (error) {
      console.error("Error marking arrived:", error);
      alert("Failed to mark passengers");
    }
  };

  const togglePassengerSelection = (passengerId) => {
    setExpiringPassengers(prev =>
      prev.some(p => p.id === passengerId)
        ? prev.filter(p => p.id !== passengerId)
        : [...prev, passengersOnBoard.find(p => p.id === passengerId)]
    );
  };

  // ================= API CALLS =================
  const fetchAvailableLaunches = async () => {
    setCarLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/available-launches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableLaunches(response.data || []);
    } catch (error) {
      console.error("Error fetching available launches:", error);
    } finally {
      setCarLoading(false);
    }
  };

  const assignLaunch = async () => {
    if (!selectedLaunchId) {
      alert("Please select a launch");
      return;
    }
    
    setAssigningCar(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/driver/assign-launch`,
        { launch_id: parseInt(selectedLaunchId) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        alert("Launch assigned successfully!");
        setShowCarAssignment(false);
        setSelectedLaunchId("");
        setSelectedLaunchDetails(null);
        await fetchAssignedTrips();
        await fetchAvailableLaunches();
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign launch");
    } finally {
      setAssigningCar(false);
    }
  };

  const fetchAssignedTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const trips = response.data || [];
      const now = new Date();
      const upcoming = trips.filter(t => new Date(t.travel_time) > now);
      const completed = trips.filter(t => new Date(t.travel_time) <= now);
      const todayEarnings = completed.reduce((sum, t) => sum + (t.price_amount || 0), 0);
      
      setAssignedTrips(trips);
      setStats({
        totalTrips: trips.length,
        completedTrips: completed.length,
        upcomingTrips: upcoming.length,
        totalPassengers: trips.reduce((sum, t) => sum + (t.passenger_count || 0), 0),
        todayEarnings: todayEarnings,
        rating: 4.8
      });
    } catch (error) {
      console.error("Error fetching trips:", error);
    }
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
      const onboard = response.data.filter(t => t.ticket_life_cycle === "active");
      setPassengersOnBoard(onboard);
      setTicketsLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTicketsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError(null);
          if (trackingActive && activeTrip) {
            updateDriverLocation(position.coords.latitude, position.coords.longitude);
          }
        },
        () => setLocationError("Unable to get location")
      );
    } else {
      setLocationError("Geolocation not supported");
    }
  };

  const updateDriverLocation = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/driver/location`, { 
        latitude, longitude, location_name: currentStop || "On route", 
        status: trackingActive ? "active" : "offline"
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (error) {
      console.error("Location update error:", error);
    }
  };

  // START TRIP - begins the journey
  const startTrip = async (trip) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/driver/start-trip`, {
        launch_id: trip.launch_car_id,
        started_at: new Date().toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setActiveTrip(trip);
      setTripStarted(true);
      setTripCompleted(false);
      setTrackingActive(true);
      setCompletedStops([]);
      setTripProgress(0);
      setCurrentStopIndex(0);
      
      // Define route stops
      const stops = [trip.travel_from, trip.travel_to];
      setRouteStops(stops);
      
      addNotification(`🚀 TRIP STARTED: ${trip.travel_from} → ${trip.travel_to}`, "success");
      addNotification(`📍 You are at ${trip.travel_from}. Click "Arrived" when you reach each stop.`, "info");
      
      // Start location tracking
      const interval = setInterval(async () => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            await updateDriverLocation(position.coords.latitude, position.coords.longitude);
          });
        }
      }, 10000);
      setTrackingInterval(interval);
      
    } catch (error) {
      console.error("Error starting trip:", error);
      alert("Failed to start trip");
    }
  };

  // ARRIVE AT LOCATION - mark that driver has reached a stop
  const arriveAtLocation = async (location) => {
    if (!activeTrip) {
      alert("No active trip. Please start a trip first.");
      return;
    }
    
    if (tripCompleted) {
      alert("Trip is already completed. Please finish the trip.");
      return;
    }
    
    // Find the stop index
    const stopIndex = routeStops.findIndex(s => s === location);
    if (stopIndex === -1) {
      alert(`"${location}" is not a stop on this route.`);
      return;
    }
    
    // Check if already arrived at this stop
    if (completedStops.includes(location)) {
      alert(`Already arrived at ${location}. Continue to next stop.`);
      return;
    }
    
    await markArrivedAtStop(location, stopIndex);
    
    // Auto-update location for tracking
    if (currentLocation) {
      await updateDriverLocation(currentLocation.lat, currentLocation.lng);
    }
  };

  // FINISH TRIP - ends the journey
  const finishTrip = async () => {
    if (!activeTrip) {
      alert("No active trip to finish");
      return;
    }
    
    if (!tripStarted) {
      alert("Trip hasn't started yet");
      return;
    }
    
    // Check if all stops are completed
    if (completedStops.length < routeStops.length) {
      const remaining = routeStops.filter(s => !completedStops.includes(s));
      alert(`Please arrive at all stops first. Remaining: ${remaining.join(" → ")}`);
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/driver/end-trip`, {
        launch_id: activeTrip.launch_car_id,
        arrived_at: new Date().toISOString()
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      // Expire all remaining active tickets
      const activeTickets = tickets.filter(t => t.ticket_life_cycle === "active");
      if (activeTickets.length > 0) {
        await axios.post(`${API_URL}/driver/mark-arrived`, 
          { passenger_ids: activeTickets.map(t => t.id), location_name: "Final Destination" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      if (trackingInterval) clearInterval(trackingInterval);
      
      setActiveTrip(null);
      setTripStarted(false);
      setTripCompleted(true);
      setTrackingActive(false);
      setCurrentStop("");
      setCompletedStops([]);
      setTripProgress(0);
      setPassengersOnBoard([]);
      
      addNotification("🏁 TRIP FINISHED! All passengers have been dropped off.", "success");
      
      await fetchAssignedTrips();
      await fetchTickets();
      
    } catch (error) {
      console.error("Error finishing trip:", error);
      alert("Failed to finish trip");
    }
  };

  const verifyPassenger = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/verify-ticket`, { ticket_id: ticketId }, { headers: { Authorization: `Bearer ${token}` } });
      addNotification("Passenger verified!", "success");
      fetchTickets();
    } catch (error) {
      alert("Verification failed");
    }
  };

  const loadNotifications = () => {
    setNotifications([
      { id: 1, message: "Welcome to ROT Driver Portal!", time: "Just now", read: false, type: "info" },
    ]);
  };

  const addNotification = (message, type = "info") => {
    const newNotif = { id: Date.now(), message, time: "Just now", read: false, type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 20));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/driver/profile`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      alert("Profile updated!");
      setShowProfileModal(false);
    } catch (error) {
      alert("Update failed");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/driver/change-password`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Password changed!");
      setShowSettingsModal(false);
    } catch (error) {
      alert("Change failed");
    }
  };

  const handleLogout = () => {
    if (trackingInterval) clearInterval(trackingInterval);
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "D";
  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => date.toLocaleDateString();

  const getStatusBadge = (status) => {
    const styles = { active: "bg-green-100 text-green-700", used: "bg-blue-100 text-blue-700", expired: "bg-red-100 text-red-700" };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredTickets = tickets.filter(ticket => {
    const search = ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   ticket.phone_number?.includes(searchTerm);
    return search && (filter === "all" || ticket.ticket_life_cycle === filter);
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Menu Button */}
      <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg">
        <Menu size={22} />
      </button>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Toggle Sidebar Button */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="hidden lg:flex fixed top-20 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200 hover:bg-gray-50"
      >
        {sidebarOpen ? <X size={18} className="text-gray-600" /> : <Menu size={18} className="text-gray-600" />}
      </button>

      {/* ================= SIDEBAR ================= */}
      <div className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ${sidebarOpen ? "w-80" : "w-20"} bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white shadow-2xl overflow-hidden`}>
        <div className={`p-6 border-b border-orange-500/30 ${!sidebarOpen ? "px-3" : ""}`}>
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <img src="/ROT.png" alt="ROT Logo" className="w-10 h-10 bg-white rounded-xl p-1 shadow-lg object-contain" />
            {sidebarOpen && <div><h1 className="text-xl font-bold">ROT</h1><p className="text-xs text-orange-200">Driver Portal</p></div>}
          </div>
        </div>

        <div className={`px-5 py-5 border-b border-orange-500/30 cursor-pointer hover:bg-orange-500/20 group ${!sidebarOpen ? "px-3" : ""}`} onClick={() => setShowProfileModal(true)}>
          <div className="flex items-center gap-3 justify-center lg:justify-start">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-md">
              <span className="text-xl font-bold">{getInitials(driverInfo?.driver_name)}</span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{driverInfo?.driver_name || "Driver"}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-orange-200">{trackingActive ? "Live" : "Offline"}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-380px)]">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition ${activeTab === item.id ? "bg-white text-orange-700 shadow-lg font-semibold" : "text-orange-100 hover:bg-orange-500/30"} ${!sidebarOpen ? "justify-center" : ""}`} title={!sidebarOpen ? item.name : ""}>
              <span className={activeTab === item.id ? "text-orange-600" : ""}>{item.icon}</span>
              {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-3 border-t border-orange-500/30 bg-orange-700/20 backdrop-blur-sm">
          <div className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} mb-3 px-2`}>
            <button onClick={() => setShowNotifications(!showNotifications)} className="flex items-center gap-2 text-orange-200 hover:text-white relative">
              <Bell size={18} />
              {sidebarOpen && <span className="text-xs">Alerts</span>}
              {unreadCount > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>}
            </button>
            {sidebarOpen && (
              <>
                <button onClick={() => setShowStatsModal(true)} className="flex items-center gap-2 text-orange-200 hover:text-white"><Award size={18} /><span className="text-xs">Stats</span></button>
                <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 text-orange-200 hover:text-white"><QrCode size={18} /><span className="text-xs">QR</span></button>
                <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 text-orange-200 hover:text-white"><Settings size={18} /><span className="text-xs">Settings</span></button>
              </>
            )}
          </div>
          {sidebarOpen && (
            <div className="text-center mb-3 text-xs text-orange-200/80 flex items-center justify-center gap-2">
              <Clock size={12} />{formatDate(currentTime)} • {formatTime(currentTime)}<span className="text-lg">{weather.icon}</span>
            </div>
          )}
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600 py-2 rounded-xl">
            <LogOut size={18} /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-80" : "lg:ml-20"} min-h-screen`}>
        {/* Top Bar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
          <div className="px-6 py-3 flex justify-between items-center flex-wrap gap-3">
            <h1 className="text-xl font-bold text-gray-800">Driver Dashboard</h1>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowCarAssignment(true)} className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition">
                <UserPlus size={16} /> Assign Launch
              </button>
              
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <span className="text-lg">{weather.icon}</span>
                <span className="text-sm">{weather.temp}°C</span>
              </div>
              
              {trackingActive && (
                <div className="flex items-center gap-2 bg-orange-50 px-3 py-1.5 rounded-full">
                  <Navigation size={14} className="text-orange-600 animate-pulse" />
                  <span className="text-xs text-orange-700">Live</span>
                </div>
              )}
              
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-full relative">
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 max-h-96 overflow-auto">
                    <div className="p-3 border-b"><h3 className="font-semibold">Notifications ({unreadCount})</h3></div>
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${!n.read ? "bg-orange-50" : ""}`}>
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-gray-400">{n.time}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <button onClick={() => setShowProfileModal(true)} className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">
                {getInitials(driverInfo?.driver_name)}
              </button>
            </div>
          </div>
          
          <div className="px-6 flex gap-1 border-t bg-gray-50/50 overflow-x-auto">
            {menuItems.map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === item.id ? "border-orange-600 text-orange-700 bg-white" : "border-transparent text-gray-600 hover:text-orange-600"}`}>
                {item.icon}{item.name}
              </button>
            ))}
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div className="p-6">
          
          {/* DASHBOARD TAB */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Bus size={40} />
                    <div>
                      <h1 className="text-2xl font-bold">Welcome, {driverInfo.driver_name?.split(" ")[0] || "Driver"}! 🚌</h1>
                      <p>{activeTrip ? `Active Trip: ${activeTrip.travel_from} → ${activeTrip.travel_to}` : "No active trip. Assign a launch and start your journey."}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCarAssignment(true)} className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <UserPlus size={16} /> Assign Launch
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4"><p className="text-xs text-gray-500">Total Trips</p><p className="text-2xl font-bold">{stats.totalTrips}</p></div>
                <div className="bg-white rounded-xl p-4"><p className="text-xs text-gray-500">On Board</p><p className="text-2xl font-bold text-purple-600">{passengersOnBoard.length}</p></div>
                <div className="bg-white rounded-xl p-4"><p className="text-xs text-gray-500">Completed</p><p className="text-2xl font-bold text-green-600">{stats.completedTrips}</p></div>
                <div className="bg-white rounded-xl p-4"><p className="text-xs text-gray-500">Today's Trips</p><p className="text-2xl font-bold text-emerald-600">{stats.upcomingTrips + stats.completedTrips}</p></div>
              </div>

              {/* Trip Progress Section - MAIN FEATURE */}
              {activeTrip && (
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                      <Route className="text-orange-600" /> Trip Progress
                    </h2>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-orange-600">{tripProgress}%</span>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-green-500 h-4 rounded-full transition-all duration-500 flex items-center justify-center text-xs text-white" style={{ width: `${tripProgress}%` }}>
                      {tripProgress > 20 && `${tripProgress}%`}
                    </div>
                  </div>
                  
                  {/* Route Stops with Status */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin size={16} /> Route Stops</h3>
                    <div className="flex flex-wrap gap-3">
                      {routeStops.map((stop, idx) => {
                        const isCompleted = completedStops.includes(stop);
                        const isCurrent = currentStop === stop;
                        return (
                          <div key={idx} className="relative">
                            <button
                              onClick={() => arriveAtLocation(stop)}
                              disabled={isCompleted || !activeTrip}
                              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                                isCompleted ? "bg-green-500 text-white cursor-default" :
                                isCurrent ? "bg-orange-500 text-white animate-pulse" :
                                "bg-gray-100 text-gray-700 hover:bg-orange-100"
                              }`}
                            >
                              {isCompleted ? <CircleCheck size={16} /> : isCurrent ? <CircleDot size={16} /> : <Circle size={16} />}
                              {stop}
                              {!isCompleted && activeTrip && !isCurrent && <span className="text-xs ml-1">(Click to Arrive)</span>}
                            </button>
                            {idx < routeStops.length - 1 && !isCompleted && (
                              <ArrowRight size={16} className="absolute -right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hidden lg:block" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Trip Control Buttons */}
                  <div className="flex gap-4 mt-4 pt-4 border-t">
                    {!tripStarted && (
                      <button onClick={() => startTrip(activeTrip)} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
                        <Play size={20} /> START TRIP
                      </button>
                    )}
                    {tripStarted && !tripCompleted && (
                      <button onClick={finishTrip} disabled={completedStops.length < routeStops.length} className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${completedStops.length === routeStops.length ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}>
                        <Flag size={20} /> FINISH TRIP
                      </button>
                    )}
                  </div>
                  
                  {/* Current Status Message */}
                  {tripStarted && !tripCompleted && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <Navigation size={16} className="animate-pulse" />
                        {completedStops.length === 0 && `📍 You are at ${routeStops[0]}. Click "Arrived" when ready to depart.`}
                        {completedStops.length > 0 && completedStops.length < routeStops.length && `📍 You are at ${currentStop || routeStops[completedStops.length]}. Click "Arrived" at each stop to continue.`}
                        {completedStops.length === routeStops.length && `🎉 All stops completed! Click "FINISH TRIP" to end the journey.`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Location Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5">
                  <h2 className="font-semibold mb-3"><Navigation size={18} className="inline text-orange-600 mr-2" />Your Location</h2>
                  {currentLocation ? (
                    <div>
                      <div className="bg-gray-50 p-3 rounded-lg"><p className="text-xs text-gray-500">Coordinates</p><p className="font-mono text-sm">{currentLocation.lat?.toFixed(6)}°, {currentLocation.lng?.toFixed(6)}°</p></div>
                      <div className="flex gap-3 mt-3"><a href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`} target="_blank" className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-center text-sm">View Map</a><button onClick={getCurrentLocation} className="px-4 py-2 border rounded-lg"><RefreshCw size={14} /></button></div>
                    </div>
                  ) : (<div className="text-center py-6"><Navigation size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500">Getting location...</p></div>)}
                </div>

                <div className="bg-white rounded-xl p-5">
                  <h2 className="font-semibold mb-3"><Truck size={18} className="inline text-green-600 mr-2" />Active Trip Status</h2>
                  {activeTrip ? (
                    <div className="space-y-3">
                      <div className="bg-green-50 p-3 rounded-lg">
                        <p className="font-medium">{activeTrip.travel_from} → {activeTrip.travel_to}</p>
                        <p className="text-sm text-gray-600">{passengersOnBoard.length} passengers on board</p>
                        <p className="text-sm text-orange-600 mt-1">Progress: {tripProgress}% complete</p>
                      </div>
                      {!tripStarted && <p className="text-sm text-gray-500">Click "START TRIP" above to begin</p>}
                      {tripStarted && !tripCompleted && <p className="text-sm text-green-600">Trip in progress. Arrive at stops to drop off passengers.</p>}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Clock size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">No active trip</p>
                      <p className="text-xs text-gray-400 mt-1">Assign a launch to start your journey</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Passengers on Board */}
              {passengersOnBoard.length > 0 && (
                <div className="bg-white rounded-xl">
                  <div className="px-5 py-4 border-b flex justify-between"><div><h2 className="font-semibold">Passengers On Board ({passengersOnBoard.length})</h2><p className="text-xs text-gray-500">These passengers need to be dropped off at their destinations</p></div><button onClick={() => setShowPassengersModal(true)} className="text-sm text-orange-600">Manage</button></div>
                  <div className="divide-y max-h-64 overflow-auto">
                    {passengersOnBoard.slice(0, 5).map(p => (
                      <div key={p.id} className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center"><User size={18} className="text-orange-600" /></div>
                          <div><p className="font-medium">{p.passenger_name}</p><p className="text-xs text-gray-500">{p.phone_number}</p></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-gray-500">↓ {p.travel_to}</span>
                          <button onClick={() => verifyPassenger(p.id)} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Verify</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TRIPS TAB */}
          {activeTab === "trips" && (
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-semibold">My Assigned Trips</h2>
                <button onClick={() => setShowCarAssignment(true)} className="text-sm bg-orange-600 text-white px-3 py-1 rounded-lg flex items-center gap-1"><UserPlus size={14} /> Assign Launch</button>
              </div>
              {assignedTrips.length === 0 ? (
                <div className="text-center py-12 text-gray-400"><Bus size={48} className="mx-auto mb-2" /><p>No trips assigned</p><button onClick={() => setShowCarAssignment(true)} className="mt-2 text-orange-600 underline">Assign a launch first</button></div>
              ) : (
                assignedTrips.map((trip, idx) => (
                  <div key={idx} className="p-4 border-b flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2"><MapPin size={14} className="text-orange-600" /><span className="font-semibold">{trip.travel_from} → {trip.travel_to}</span></div>
                      <div className="flex gap-3 text-sm text-gray-500 mt-1"><Clock size={12} className="inline" />{new Date(trip.travel_time).toLocaleString()}<Bus size={12} className="inline ml-2" />{trip.car_plate}</div>
                    </div>
                    {new Date(trip.travel_time) > new Date() && !activeTrip && (
                      <button onClick={() => startTrip(trip)} className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm">Start</button>
                    )}
                    {activeTrip?.launch_car_id === trip.launch_car_id && <span className="text-green-600 text-sm flex items-center gap-1"><Navigation size={12} className="animate-pulse" /> In Progress ({tripProgress}%)</span>}
                    {new Date(trip.travel_time) <= new Date() && activeTrip?.launch_car_id !== trip.launch_car_id && <span className="text-gray-400 text-sm">Completed</span>}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === "tickets" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-3 text-center"><p className="text-xs">Active</p><p className="text-xl font-bold text-green-600">{tickets.filter(t => t.ticket_life_cycle === "active").length}</p></div>
                <div className="bg-white rounded-xl p-3 text-center"><p className="text-xs">Used</p><p className="text-xl font-bold text-blue-600">{tickets.filter(t => t.ticket_life_cycle === "used").length}</p></div>
                <div className="bg-white rounded-xl p-3 text-center"><p className="text-xs">Expired</p><p className="text-xl font-bold text-red-600">{tickets.filter(t => t.ticket_life_cycle === "expired").length}</p></div>
                <div className="bg-white rounded-xl p-3 text-center"><p className="text-xs">Total</p><p className="text-xl font-bold">{tickets.length}</p></div>
              </div>
              <div className="bg-white rounded-xl p-3 flex gap-2"><Search size={18} className="text-gray-400" /><input type="text" placeholder="Search..." className="flex-1 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /><div className="flex gap-1">{["all","active","used","expired"].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-2 py-1 text-xs rounded ${filter === f ? "bg-orange-600 text-white" : "bg-gray-100"}`}>{f}</button>)}</div></div>
              {ticketsLoading ? <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-orange-600" /></div> : filteredTickets.map(t => (
                <div key={t.id} className="bg-white rounded-xl p-4">
                  <div className="flex justify-between"><div><p className="font-semibold">{t.passenger_name}</p><p className="text-xs text-gray-500">{t.phone_number}</p></div><span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(t.ticket_life_cycle)}`}>{t.ticket_life_cycle}</span></div>
                  <div className="flex justify-between text-sm text-gray-600 mt-2"><span>🚌 {t.car_plate}</span><span>📍 {t.travel_from} → {t.travel_to}</span><span>🎫 Ticket #{t.id}</span></div>
                  {t.ticket_life_cycle === "active" && <button onClick={() => verifyPassenger(t.id)} className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded">Verify Passenger</button>}
                  {t.ticket_life_cycle === "expired" && <span className="mt-2 text-xs text-gray-400">Passenger has been dropped off</span>}
                </div>
              ))}
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === "support" && (
            <div className="bg-white rounded-xl p-6 text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"><Headphones size={40} className="text-orange-600" /></div>
              <h2 className="text-xl font-bold mb-2">Need Help?</h2>
              <p className="text-gray-500 mb-4">Contact our support team</p>
              <div className="space-y-3"><div className="flex items-center justify-center gap-2 text-gray-600"><Phone size={16} /> +250 788 123 456</div><div className="flex items-center justify-center gap-2 text-gray-600"><Mail size={16} /> support@rot.rw</div></div>
              <button className="mt-4 bg-orange-600 text-white px-6 py-2 rounded-lg">Contact Support</button>
            </div>
          )}
        </div>
      </div>

      {/* ================= MODALS ================= */}

      {/* CAR ASSIGNMENT MODAL */}
      {showCarAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-4 flex justify-between items-center sticky top-0">
              <div><h2 className="font-bold text-white">Assign Launch to You</h2><p className="text-orange-100 text-sm">Select a launch to drive</p></div>
              <button onClick={() => setShowCarAssignment(false)} className="text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {carLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-orange-600" size={32} /></div>
              ) : availableLaunches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Car size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No available launches</p>
                  <p className="text-sm mt-1">Contact your manager to create launches</p>
                </div>
              ) : (
                <select value={selectedLaunchId} onChange={(e) => { setSelectedLaunchId(e.target.value); const launch = availableLaunches.find(l => l.id === parseInt(e.target.value)); setSelectedLaunchDetails(launch); }} className="w-full p-3 border rounded-xl">
                  <option value="">Select a launch</option>
                  {availableLaunches.map(launch => (
                    <option key={launch.id} value={launch.id}>{launch.travel_from} → {launch.travel_to} | {new Date(launch.travel_time).toLocaleString()} | {launch.available_sits} seats</option>
                  ))}
                </select>
              )}
              {selectedLaunchDetails && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-2 text-sm"><div className="flex justify-between"><span className="text-gray-600">Route:</span><span className="font-medium">{selectedLaunchDetails.travel_from} → {selectedLaunchDetails.travel_to}</span></div><div className="flex justify-between"><span className="text-gray-600">Departure:</span><span className="font-medium">{new Date(selectedLaunchDetails.travel_time).toLocaleString()}</span></div><div className="flex justify-between"><span className="text-gray-600">Bus:</span><span className="font-medium">{selectedLaunchDetails.car_name} ({selectedLaunchDetails.car_plate})</span></div><div className="flex justify-between"><span className="text-gray-600">Seats:</span><span className="font-medium text-green-600">{selectedLaunchDetails.available_sits} available</span></div></div>
                </div>
              )}
              <button onClick={assignLaunch} disabled={!selectedLaunchId || assigningCar} className="w-full py-3 bg-orange-600 text-white rounded-xl disabled:opacity-50">{assigningCar ? "Assigning..." : "Assign Launch"}</button>
            </div>
          </div>
        </div>
      )}

      {/* PASSENGERS MODAL */}
      {showPassengersModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-4 flex justify-between sticky top-0"><div><h2 className="font-bold text-white">Manage Passengers</h2><p className="text-green-100 text-sm">{currentStop ? `Passengers getting off at ${currentStop}` : "All passengers on board"}</p></div><button onClick={() => setShowPassengersModal(false)} className="text-white"><X size={20} /></button></div>
            <div className="p-5 space-y-4">
              {expiringPassengers.length > 0 && (<div className="bg-yellow-50 p-4 rounded-xl"><h3 className="font-semibold text-yellow-800 mb-2">🚏 Passengers Getting Off at {currentStop}</h3><p className="text-sm text-yellow-700 mb-2">These passengers have reached their destination. Click the checkbox and confirm to mark them as arrived.</p>{expiringPassengers.map(p => (<div key={p.id} className="flex justify-between items-center p-2 bg-white rounded mb-1"><div><p className="font-medium">{p.passenger_name}</p><p className="text-xs text-gray-500">{p.phone_number}</p></div><span className="text-xs bg-green-100 px-2 py-1 rounded-full">Destination: {p.travel_to}</span></div>))}</div>)}
              <div><h3 className="font-semibold mb-2">All Passengers On Board ({passengersOnBoard.length})</h3>{passengersOnBoard.map(p => (<div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2"><div className="flex items-center gap-3"><input type="checkbox" checked={expiringPassengers.some(ep => ep.id === p.id)} onChange={() => togglePassengerSelection(p.id)} className="w-4 h-4 text-orange-600" /><div><p className="font-medium">{p.passenger_name}</p><p className="text-xs text-gray-500">{p.phone_number}</p></div></div><div className="flex items-center gap-3"><span className="text-xs text-gray-500">↓ {p.travel_to}</span><button onClick={() => verifyPassenger(p.id)} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">Verify</button></div></div>))}</div>
            </div>
            <div className="p-4 border-t flex gap-3"><button onClick={() => setShowPassengersModal(false)} className="flex-1 py-2 border rounded-lg">Close</button>{expiringPassengers.length > 0 && <button onClick={markPassengersArrived} className="flex-1 py-2 bg-emerald-600 text-white rounded-lg">✅ Mark {expiringPassengers.length} Passenger(s) as Arrived</button>}</div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5"><div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Driver Profile</h3><button onClick={() => setShowProfileModal(false)}><X /></button></div><div className="text-center mb-4"><div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center"><span className="text-2xl font-bold text-orange-600">{getInitials(driverInfo?.driver_name)}</span></div><h3 className="font-semibold mt-2">{driverInfo?.driver_name}</h3></div><div className="space-y-3"><input value={editForm.phone_number} onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})} className="w-full border rounded-lg p-2" placeholder="Phone" /><input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full border rounded-lg p-2" placeholder="Email" /></div><button onClick={handleProfileUpdate} className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg">Save</button></div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5"><div className="flex justify-between"><h3 className="font-bold">Stats</h3><button onClick={() => setShowStatsModal(false)}><X /></button></div><div className="grid grid-cols-2 gap-3 mt-4"><div className="bg-orange-50 p-3 rounded text-center"><p className="text-xs">Trips</p><p className="text-xl font-bold">{stats.totalTrips}</p></div><div className="bg-green-50 p-3 rounded text-center"><p className="text-xs">On-Time</p><p className="text-xl font-bold">98%</p></div><div className="bg-blue-50 p-3 rounded text-center"><p className="text-xs">Passengers</p><p className="text-xl font-bold">{stats.totalPassengers}</p></div><div className="bg-yellow-50 p-3 rounded text-center"><p className="text-xs">Rating</p><p className="text-xl font-bold">{stats.rating}★</p></div></div></div>
        </div>
      )}

      {/* QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center"><div className="flex justify-between"><h3 className="font-bold">QR Code</h3><button onClick={() => setShowQRModal(false)}><X /></button></div><div className="w-48 h-48 mx-auto my-4 bg-gray-100 rounded-xl flex items-center justify-center"><QrCode size={80} className="text-gray-400" /></div><p className="text-sm">ID: {driverInfo?.id || "N/A"}</p><button className="mt-3 bg-orange-600 text-white px-4 py-2 rounded-lg inline-flex gap-2"><Printer size={16} /> Print</button></div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5"><div className="flex justify-between"><h3 className="font-bold">Settings</h3><button onClick={() => setShowSettingsModal(false)}><X /></button></div><div className="mt-4"><label className="text-sm">New Password</label><input type="password" className="w-full border rounded-lg p-2 mt-1" placeholder="New password" /><button onClick={handlePasswordChange} className="w-full mt-3 bg-gray-800 text-white py-2 rounded-lg">Update</button></div></div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;