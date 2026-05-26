// src/pages/driver/DriverDashboard.jsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Bus, MapPin, Clock, Users, CheckCircle, Navigation, Calendar,
  AlertCircle, Ticket, LogOut, Menu, X, Bell, Play, Flag,
  Phone, DollarSign, Search, LayoutDashboard, User, Car,
  RefreshCw, ArrowRight, Loader2, Info,
  Settings, Award, Star, QrCode, Printer,
  Headphones, Mail, UserPlus,
  Circle, CircleCheck, CircleDot, Route, Truck, Fuel, Battery,
  Wifi, Signal, Volume2, VolumeX, Sun, Wind, Droplet,
  Map, Gift, Sparkles, Trophy, Target,
  Eye as EyeIcon, Send, WifiOff, XCircle, Megaphone,
  Trash2, RefreshCcw, UserCheck, UserX, AlertTriangle
} from "lucide-react";

function DriverDashboard() {
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // ================= STATE MANAGEMENT =================
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [driverInfo, setDriverInfo] = useState({});
  const [driverProfile, setDriverProfile] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState("dashboard");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Trip Progress
  const [tripProgress, setTripProgress] = useState(0);
  const [completedStops, setCompletedStops] = useState([]);
  const [tripDuration, setTripDuration] = useState(0);
  const [tripStartTime, setTripStartTime] = useState(null);
  const [distanceTraveled, setDistanceTraveled] = useState(0);
  
  // Car Assignment
  const [showCarAssignment, setShowCarAssignment] = useState(false);
  const [availableLaunches, setAvailableLaunches] = useState([]);
  const [selectedLaunchId, setSelectedLaunchId] = useState("");
  const [selectedLaunchDetails, setSelectedLaunchDetails] = useState(null);
  const [carLoading, setCarLoading] = useState(false);
  const [assigningCar, setAssigningCar] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [showChangeAssignment, setShowChangeAssignment] = useState(false);
  
  // Trip Management
  const [assignedTrips, setAssignedTrips] = useState([]);
  const [driverStats, setDriverStats] = useState({
    total_assignments: 0,
    completed_trips: 0,
    active_trips: 0,
    active_passengers: 0,
    delivered_passengers: 0,
    total_revenue: 0
  });
  
  const [currentLocation, setCurrentLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [activeTrip, setActiveTrip] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [ticketsData, setTicketsData] = useState({ tickets: [], stats: { total: 0, active: 0, used: 0, expired: 0 } });
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
  const [availableRoutes, setAvailableRoutes] = useState([]);
  const [selectedRouteForExpiry, setSelectedRouteForExpiry] = useState("");
  const [showRouteSelector, setShowRouteSelector] = useState(false);
  
  // Real Vehicle Stats (from GPS)
  const [speed, setSpeed] = useState(0);
  const [isMoving, setIsMoving] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  
  // Weather (simulated but can be real API)
  const [weather, setWeather] = useState({ temp: 24, condition: "Sunny", icon: "☀️", wind: 12, humidity: 65 });
  
  // Announcements
  const [announcements, setAnnouncements] = useState([]);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  
  // Rewards
  const [rewards, setRewards] = useState({ points: 0, badges: [] });
  
  // Location Tracking
  const [locationTrackingActive, setLocationTrackingActive] = useState(false);
  const [locationUpdateStatus, setLocationUpdateStatus] = useState(null);
  
  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editForm, setEditForm] = useState({ driver_name: "", phone_number: "", email: "" });
  
  const [muteSound, setMuteSound] = useState(false);
  const audioContextRef = useRef(null);

  // ================= MENU ITEMS =================
  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "location", name: "Share Location", icon: <Navigation size={20} /> },
    { id: "trips", name: "My Trips", icon: <Calendar size={20} /> },
    { id: "tickets", name: "Tickets", icon: <Ticket size={20} /> },
    { id: "passengers", name: "Passengers", icon: <Users size={20} /> },
    { id: "rewards", name: "Rewards", icon: <Gift size={20} /> },
    { id: "support", name: "Support", icon: <Headphones size={20} /> },
  ];

  // ================= INITIALIZATION =================
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (tripStarted && !tripCompleted && tripStartTime) {
        setTripDuration(Math.floor((new Date() - tripStartTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [tripStarted, tripCompleted, tripStartTime]);

  useEffect(() => {
    initializeDriver();
    loadAnnouncements();
    return () => {
      if (trackingInterval) clearInterval(trackingInterval);
    };
  }, []);

  // Real speed tracking from GPS
  useEffect(() => {
    if (locationTrackingActive) {
      const speedInterval = setInterval(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const currentSpeed = position.coords.speed ? Math.round(position.coords.speed * 3.6) : 0;
              setSpeed(currentSpeed);
              setIsMoving(currentSpeed > 5);
              
              if (lastPosition) {
                const distance = calculateDistance(
                  lastPosition.lat, lastPosition.lng,
                  position.coords.latitude, position.coords.longitude
                );
                if (distance > 0.1) {
                  setDistanceTraveled(prev => prev + distance);
                }
              }
              setLastPosition({ lat: position.coords.latitude, lng: position.coords.longitude });
            },
            () => {},
            { enableHighAccuracy: true }
          );
        }
      }, 3000);
      return () => clearInterval(speedInterval);
    }
  }, [locationTrackingActive, lastPosition]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // ================= API CALLS =================
  
  const initializeDriver = async () => {
    setLoading(true);
    await fetchDriverProfile();
    await fetchCurrentAssignment();
    await fetchDriverStats();
    await fetchTickets();
    await fetchAssignedTrips();
    await fetchAvailableLaunches();
    await fetchAvailableRoutes();
    await fetchRewards();
    getCurrentLocation();
    loadNotifications();
    setLoading(false);
  };

  const fetchDriverProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setDriverProfile(response.data);
        setDriverInfo(response.data);
        setEditForm({
          driver_name: response.data?.driver_name || "",
          phone_number: response.data?.phone_number || "",
          email: response.data?.email || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      addNotification("Failed to load profile", "error");
    }
  };

  const fetchDriverStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setDriverStats(response.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setRewards(response.data);
      } else {
        // Fallback to default
        setRewards({ points: 1250, badges: ["Safe Driver", "Punctual"] });
      }
    } catch (error) {
      console.error("Error fetching rewards:", error);
      setRewards({ points: 1250, badges: ["Safe Driver", "Punctual"] });
    }
  };

  const fetchCurrentAssignment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/my-assigned-car`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.car_plate) {
        setCurrentAssignment(response.data);
        if (response.data.travel_from && response.data.travel_to) {
          setActiveTrip(response.data);
          setRouteStops([response.data.travel_from, response.data.travel_to]);
        }
      } else {
        setCurrentAssignment(null);
      }
    } catch (error) {
      console.error("Error fetching assignment:", error);
      setCurrentAssignment(null);
    }
  };

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
      setAvailableLaunches([]);
    } finally {
      setCarLoading(false);
    }
  };

  const fetchAssignedTrips = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAssignedTrips(response.data || []);
    } catch (error) {
      console.error("Error fetching trips:", error);
      setAssignedTrips([]);
    }
  };

  const fetchTickets = async () => {
    setTicketsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/my-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.data) {
        const tickets = response.data.tickets || response.data || [];
        const stats = response.data.stats || {
          total: tickets.length,
          active: tickets.filter(t => t.ticket_life_cycle === "active").length,
          used: tickets.filter(t => t.ticket_life_cycle === "used").length,
          expired: tickets.filter(t => t.ticket_life_cycle === "expired").length
        };
        
        setTicketsData({ tickets, stats });
        const onboard = tickets.filter(t => t.ticket_life_cycle === "active");
        setPassengersOnBoard(onboard);
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTicketsData({ tickets: [], stats: { total: 0, active: 0, used: 0, expired: 0 } });
    } finally {
      setTicketsLoading(false);
    }
  };

  const fetchAvailableRoutes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableRoutes(response.data || []);
    } catch (error) {
      console.error("Error fetching routes:", error);
      setAvailableRoutes([]);
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
        playNotificationSound();
        alert("Launch assigned successfully!");
        setShowCarAssignment(false);
        setSelectedLaunchId("");
        setSelectedLaunchDetails(null);
        await fetchCurrentAssignment();
        await fetchAvailableLaunches();
        await fetchTickets();
        await fetchAssignedTrips();
        addNotification("Vehicle assigned successfully!", "success");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to assign launch");
    } finally {
      setAssigningCar(false);
    }
  };

  const changeAssignment = async () => {
    if (!selectedLaunchId) {
      alert("Please select a new launch");
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
        playNotificationSound();
        alert("Assignment changed successfully!");
        setShowChangeAssignment(false);
        setSelectedLaunchId("");
        setSelectedLaunchDetails(null);
        await fetchCurrentAssignment();
        await fetchAvailableLaunches();
        await fetchTickets();
        await fetchAssignedTrips();
        
        setActiveTrip(null);
        setTripStarted(false);
        setTripCompleted(false);
        setCompletedStops([]);
        setTripProgress(0);
        addNotification("Vehicle assignment changed!", "success");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Failed to change assignment");
    } finally {
      setAssigningCar(false);
    }
  };

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
      setLocationTrackingActive(true);
      setCompletedStops([]);
      setTripProgress(0);
      setTripStartTime(new Date());
      setTripDuration(0);
      setDistanceTraveled(0);
      
      const stops = [trip.travel_from, trip.travel_to];
      setRouteStops(stops);
      
      playNotificationSound();
      addNotification(`🚀 TRIP STARTED: ${trip.travel_from} → ${trip.travel_to}`, "success");
      addNotification(`📍 Location sharing enabled - Manager can now track you`, "info");
      
    } catch (error) {
      console.error("Error starting trip:", error);
      alert("Failed to start trip");
    }
  };

  const finishTrip = async () => {
    if (!activeTrip) {
      alert("No active trip to finish");
      return;
    }
    
    if (!tripStarted) {
      alert("Trip hasn't started yet");
      return;
    }
    
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
      
      setRewards(prev => ({ ...prev, points: prev.points + 100 }));
      
      setActiveTrip(null);
      setTripStarted(false);
      setTripCompleted(true);
      setTrackingActive(false);
      setLocationTrackingActive(false);
      setCurrentStop("");
      setCompletedStops([]);
      setTripProgress(0);
      
      playNotificationSound();
      addNotification(`🏁 TRIP FINISHED! +100 points earned!`, "success");
      
      await fetchAssignedTrips();
      await fetchTickets();
      await fetchDriverStats();
      await fetchRewards();
      
    } catch (error) {
      console.error("Error finishing trip:", error);
      alert("Failed to finish trip");
    }
  };

  const verifyPassenger = async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/driver/verify-ticket`, { ticket_id: ticketId }, { headers: { Authorization: `Bearer ${token}` } });
      setRewards(prev => ({ ...prev, points: prev.points + 5 }));
      playNotificationSound();
      addNotification("Passenger verified! +5 points", "success");
      fetchTickets();
      fetchRewards();
    } catch (error) {
      alert("Verification failed");
    }
  };

  const expireTicketsByRoute = async () => {
    if (!selectedRouteForExpiry) {
      alert("Please select a route/location");
      return;
    }
    
    const route = availableRoutes.find(r => r.id === parseInt(selectedRouteForExpiry));
    if (!route) return;
    
    const ticketsToExpire = ticketsData.tickets?.filter(t => 
      t.ticket_life_cycle === "active" && 
      (t.travel_to === route.travel_to || t.travel_from === route.travel_from)
    ) || [];
    
    if (ticketsToExpire.length === 0) {
      alert(`No active tickets found for ${route.travel_from} → ${route.travel_to}`);
      return;
    }
    
    if (!window.confirm(`Expire ${ticketsToExpire.length} ticket(s) for ${route.travel_from} → ${route.travel_to}?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      for (const ticket of ticketsToExpire) {
        await axios.post(
          `${API_URL}/driver/mark-arrived`,
          { passenger_ids: [ticket.id], location_name: route.travel_to },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      const pointsEarned = ticketsToExpire.length * 10;
      setRewards(prev => ({ ...prev, points: prev.points + pointsEarned }));
      
      playNotificationSound();
      addNotification(`✅ ${ticketsToExpire.length} ticket(s) expired for ${route.travel_from} → ${route.travel_to} (+${pointsEarned} points)`, "success");
      
      setShowRouteSelector(false);
      setSelectedRouteForExpiry("");
      await fetchTickets();
      await fetchDriverStats();
      await fetchRewards();
    } catch (error) {
      console.error("Error expiring tickets:", error);
      alert("Failed to expire tickets");
    }
  };

  const deleteExpiredTrips = async () => {
    const expiredTrips = assignedTrips.filter(t => new Date(t.travel_time) < new Date());
    
    if (expiredTrips.length === 0) {
      alert("No expired trips to delete");
      return;
    }
    
    if (!window.confirm(`Delete ${expiredTrips.length} expired trip(s) permanently?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      let deletedCount = 0;
      
      for (const trip of expiredTrips) {
        await axios.delete(`${API_URL}/driver/trip/${trip.launch_car_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        deletedCount++;
      }
      
      playNotificationSound();
      addNotification(`🗑️ ${deletedCount} expired trip(s) deleted`, "success");
      await fetchAssignedTrips();
    } catch (error) {
      console.error("Error deleting expired trips:", error);
      alert("Failed to delete some trips");
    }
  };

  const deleteExpiredTickets = async () => {
    const expiredTickets = ticketsData.tickets?.filter(t => t.ticket_life_cycle === "expired") || [];
    
    if (expiredTickets.length === 0) {
      alert("No expired tickets to delete");
      return;
    }
    
    if (!window.confirm(`Delete ${expiredTickets.length} expired ticket(s) permanently?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      let deletedCount = 0;
      
      for (const ticket of expiredTickets) {
        await axios.delete(`${API_URL}/tickets/${ticket.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        deletedCount++;
      }
      
      playNotificationSound();
      addNotification(`🗑️ ${deletedCount} expired ticket(s) deleted`, "success");
      await fetchTickets();
    } catch (error) {
      console.error("Error deleting expired tickets:", error);
      alert("Failed to delete some tickets");
    }
  };

  // ================= LOCATION TRACKING =================
  
  const sendLocationToServer = async (latitude, longitude) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/driver/location`,
        {
          latitude: latitude,
          longitude: longitude,
          location_name: activeTrip ? `On route: ${activeTrip.travel_from} → ${activeTrip.travel_to}` : "Available",
          status: locationTrackingActive ? "active" : "offline",
          current_route: activeTrip ? `${activeTrip.travel_from}→${activeTrip.travel_to}` : null,
          speed: speed,
          is_moving: isMoving,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocationUpdateStatus({ type: "success", message: "Location sent!" });
      setTimeout(() => setLocationUpdateStatus(null), 2000);
    } catch (error) {
      console.error("Error sending location:", error);
      setLocationUpdateStatus({ type: "error", message: "Failed to send" });
    }
  };

  const shareCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await sendLocationToServer(position.coords.latitude, position.coords.longitude);
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          playNotificationSound();
          addNotification("📍 Location shared with manager!", "success");
        },
        (error) => {
          setLocationError(error.message);
          addNotification("Failed to get location", "error");
        }
      );
    } else {
      setLocationError("Geolocation not supported");
    }
  };

  const toggleLocationTracking = () => {
    if (!locationTrackingActive) {
      setLocationTrackingActive(true);
      addNotification("📍 Location tracking enabled", "success");
      
      const interval = setInterval(() => {
        if ("geolocation" in navigator && locationTrackingActive) {
          navigator.geolocation.getCurrentPosition(async (position) => {
            await sendLocationToServer(position.coords.latitude, position.coords.longitude);
            setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          }, (error) => {
            console.error("Geolocation error:", error);
          });
        }
      }, 10000);
      setTrackingInterval(interval);
    } else {
      setLocationTrackingActive(false);
      if (trackingInterval) clearInterval(trackingInterval);
      addNotification("📍 Location tracking disabled", "info");
    }
  };

  const getCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
          setLocationError(null);
        },
        () => setLocationError("Unable to get location")
      );
    } else {
      setLocationError("Geolocation not supported");
    }
  };

  // ================= HELPER FUNCTIONS =================
  
  const playNotificationSound = () => {
    if (muteSound) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.2;
      oscillator.start();
      setTimeout(() => oscillator.stop(), 500);
    } catch (error) {
      console.log("Audio not supported");
    }
  };

  const addNotification = (message, type = "info") => {
    const newNotif = { id: Date.now(), message, time: "Just now", read: false, type };
    setNotifications(prev => [newNotif, ...prev].slice(0, 30));
  };

  const loadNotifications = () => {
    setNotifications([
      { id: 1, message: "Welcome to ROT Driver Portal!", time: "Just now", read: false, type: "info" },
      { id: 2, message: "You can now expire tickets by route!", time: "Just now", read: false, type: "success" },
    ]);
  };

  const loadAnnouncements = () => {
    setAnnouncements([
      { id: 1, title: "Safety Reminder", message: "Always wear your seatbelt and follow traffic rules", date: "Today", type: "info" },
      { id: 2, title: "New Feature", message: "Auto-expire tickets by route now available!", date: "Yesterday", type: "success" },
    ]);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_URL}/driver/profile`, editForm, { headers: { Authorization: `Bearer ${token}` } });
      alert("Profile updated!");
      setShowProfileModal(false);
      fetchDriverProfile();
    } catch (error) {
      alert("Update failed");
    }
  };

  const handleLogout = () => {
    if (trackingInterval) clearInterval(trackingInterval);
    localStorage.clear();
    navigate("/login");
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours > 0 ? hours + "h " : ""}${minutes}m ${secs}s`;
  };

  const getInitials = (name) => name?.charAt(0)?.toUpperCase() || "D";
  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => date.toLocaleDateString();

  const getStatusBadge = (status) => {
    const styles = { active: "bg-green-100 text-green-700", used: "bg-blue-100 text-blue-700", expired: "bg-red-100 text-red-700" };
    return styles[status] || "bg-gray-100 text-gray-700";
  };

  const filteredTickets = ticketsData.tickets?.filter(ticket => {
    const search = ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   ticket.phone_number?.includes(searchTerm);
    return search && (filter === "all" || ticket.ticket_life_cycle === filter);
  }) || [];

  const unreadCount = notifications.filter(n => !n.read).length;

  const refreshAllData = async () => {
    setRefreshing(true);
    await fetchDriverProfile();
    await fetchCurrentAssignment();
    await fetchDriverStats();
    await fetchTickets();
    await fetchAssignedTrips();
    await fetchAvailableLaunches();
    await fetchAvailableRoutes();
    await fetchRewards();
    setRefreshing(false);
    addNotification("All data refreshed!", "success");
  };

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
                  <div className={`w-2 h-2 rounded-full ${isMoving ? "bg-green-400 animate-pulse" : "bg-yellow-400"}`}></div>
                  <span className="text-xs text-orange-200">{isMoving ? `Moving • ${speed} km/h` : "Stopped"}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Stats Mini */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-orange-500/30 bg-orange-700/20">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1"><Car size={12} /><span>{currentAssignment?.car_plate || "No Car"}</span></div>
              <div className="flex items-center gap-1"><Navigation size={12} /><span>Speed {speed} km/h</span></div>
            </div>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto h-[calc(100%-460px)]">
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
                <button onClick={() => setShowRewardsModal(true)} className="flex items-center gap-2 text-orange-200 hover:text-white"><Gift size={18} /><span className="text-xs">Rewards</span></button>
                <button onClick={() => setShowQRModal(true)} className="flex items-center gap-2 text-orange-200 hover:text-white"><QrCode size={18} /><span className="text-xs">QR</span></button>
                <button onClick={() => setShowSettingsModal(true)} className="flex items-center gap-2 text-orange-200 hover:text-white"><Settings size={18} /><span className="text-xs">Settings</span></button>
              </>
            )}
          </div>
          {sidebarOpen && (
            <div className="text-center mb-3 text-xs text-orange-200/80">
              <Clock size={12} className="inline mr-1" />{formatDate(currentTime)} • {formatTime(currentTime)}
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
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold text-gray-800">Driver Dashboard</h1>
              <div className="flex items-center gap-1 bg-yellow-100 px-3 py-1 rounded-full">
                <Gift size={14} className="text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-700">{rewards.points} pts</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!currentAssignment ? (
                <button onClick={() => setShowCarAssignment(true)} className="flex items-center gap-2 bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-orange-700 transition">
                  <UserPlus size={16} /> Assign Launch
                </button>
              ) : (
                <button onClick={() => setShowChangeAssignment(true)} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700 transition">
                  <RefreshCcw size={16} /> Change Assignment
                </button>
              )}
              
              <button onClick={refreshAllData} disabled={refreshing} className="p-2 hover:bg-gray-100 rounded-full">
                <RefreshCw size={18} className={refreshing ? "animate-spin text-orange-600" : "text-gray-600"} />
              </button>
              
              <button onClick={() => setShowAnnouncements(!showAnnouncements)} className="p-2 hover:bg-gray-100 rounded-full relative">
                <Megaphone size={20} className="text-gray-600" />
              </button>
              
              {locationTrackingActive && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full">
                  <Wifi size={14} className="text-green-600 animate-pulse" />
                  <span className="text-xs text-green-700">Sharing Live</span>
                </div>
              )}
              
              {isMoving && (
                <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                  <Navigation size={14} className="text-blue-600 animate-pulse" />
                  <span className="text-xs text-blue-700">{speed} km/h</span>
                </div>
              )}
              
              <button onClick={() => setMuteSound(!muteSound)} className="p-2 hover:bg-gray-100 rounded-full">
                {muteSound ? <VolumeX size={20} className="text-gray-600" /> : <Volume2 size={20} className="text-gray-600" />}
              </button>
              
              <div className="relative">
                <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-100 rounded-full relative">
                  <Bell size={20} className="text-gray-600" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 max-h-96 overflow-auto">
                    <div className="p-3 border-b sticky top-0 bg-white"><h3 className="font-semibold">Notifications</h3></div>
                    {notifications.map(n => (
                      <div key={n.id} className="p-3 border-b hover:bg-gray-50">
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
          
          {/* Announcements Panel */}
          {showAnnouncements && (
            <div className="px-6 py-3 bg-yellow-50 border-b border-yellow-200">
              <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-yellow-800">📢 Announcements</h3><button onClick={() => setShowAnnouncements(false)}><X size={16} /></button></div>
              {announcements.map(a => (
                <div key={a.id} className={`p-2 mb-1 rounded ${a.type === "success" ? "bg-green-100" : a.type === "warning" ? "bg-orange-100" : "bg-blue-100"}`}>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-gray-600">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{a.date}</p>
                </div>
              ))}
            </div>
          )}
          
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
              <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Bus size={40} />
                    <div>
                      <h1 className="text-2xl font-bold">Welcome, {driverInfo?.driver_name?.split(" ")[0] || "Driver"}! 🚌</h1>
                      <p>{activeTrip ? `Active Trip: ${activeTrip.travel_from} → ${activeTrip.travel_to}` : "No active trip. Assign a launch and start your journey."}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!currentAssignment ? (
                      <button onClick={() => setShowCarAssignment(true)} className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <UserPlus size={16} /> Assign Launch
                      </button>
                    ) : (
                      <button onClick={() => setShowChangeAssignment(true)} className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                        <RefreshCcw size={16} /> Change Car
                      </button>
                    )}
                    <button onClick={() => setShowMapModal(true)} className="bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                      <Map size={16} /> View Map
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Grid - REAL DATA */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Completed Trips</p>
                  <p className="text-2xl font-bold text-green-600">{driverStats.completed_trips}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">On Board</p>
                  <p className="text-2xl font-bold text-purple-600">{passengersOnBoard.length}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Delivered</p>
                  <p className="text-2xl font-bold text-blue-600">{driverStats.delivered_passengers}</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <p className="text-xs text-gray-500">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">{driverStats.total_revenue?.toLocaleString()} RWF</p>
                </div>
              </div>

              {/* Current Assignment Info */}
              {currentAssignment && (
                <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-green-800">Currently Assigned Vehicle</h3>
                      <p className="text-lg font-bold text-green-900">{currentAssignment.car_name} ({currentAssignment.car_plate})</p>
                      <p className="text-sm text-green-700">{currentAssignment.travel_from} → {currentAssignment.travel_to}</p>
                    </div>
                    <button onClick={() => setShowChangeAssignment(true)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition flex items-center gap-1">
                      <RefreshCcw size={14} /> Change
                    </button>
                  </div>
                </div>
              )}

              {/* Trip Progress Section */}
              {activeTrip && (
                <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Route className="text-orange-600" /> Trip Progress</h2>
                    <div className="text-right"><span className="text-3xl font-bold text-orange-600">{tripProgress}%</span><p className="text-xs text-gray-500">Complete</p></div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div className="bg-gradient-to-r from-orange-500 to-green-500 h-4 rounded-full transition-all duration-500" style={{ width: `${tripProgress}%` }}></div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center"><p className="text-xs text-gray-500">Duration</p><p className="text-sm font-semibold">{formatDuration(tripDuration)}</p></div>
                    <div className="text-center"><p className="text-xs text-gray-500">Distance</p><p className="text-sm font-semibold">{distanceTraveled.toFixed(1)} km</p></div>
                    <div className="text-center"><p className="text-xs text-gray-500">Stops</p><p className="text-sm font-semibold">{completedStops.length}/{routeStops.length}</p></div>
                  </div>
                  
                  <div className="flex gap-4 mt-4 pt-4 border-t">
                    {!tripStarted && (<button onClick={() => startTrip(activeTrip)} className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"><Play size={20} /> START TRIP</button>)}
                    {tripStarted && !tripCompleted && (<button onClick={finishTrip} disabled={completedStops.length < routeStops.length} className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${completedStops.length === routeStops.length ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}><Flag size={20} /> FINISH TRIP</button>)}
                  </div>
                </div>
              )}

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h2 className="font-semibold mb-3"><Navigation size={18} className="inline text-orange-600 mr-2" />Your Location</h2>
                  {currentLocation ? (
                    <div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-xs text-gray-500">Coordinates</p>
                        <p className="font-mono text-sm">{currentLocation.lat?.toFixed(6)}°, {currentLocation.lng?.toFixed(6)}°</p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`w-2 h-2 rounded-full ${isMoving ? "bg-green-500 animate-pulse" : "bg-yellow-500"}`}></div>
                          <p className="text-xs">{isMoving ? `Moving at ${speed} km/h` : "Stopped"}</p>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-3">
                        <a href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`} target="_blank" className="flex-1 bg-orange-600 text-white py-2 rounded-lg text-center text-sm">View Map</a>
                        <button onClick={shareCurrentLocation} className="px-4 py-2 border rounded-lg"><Send size={14} /></button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6"><Navigation size={32} className="mx-auto text-gray-300 mb-2" /><p className="text-gray-500">Getting location...</p></div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm">
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
            </div>
          )}

          {/* LOCATION SHARING TAB */}
          {activeTab === "location" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <Navigation size={40} />
                  <div>
                    <h1 className="text-2xl font-bold">Location Sharing</h1>
                    <p>Share your real-time location with company manager</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {locationTrackingActive ? (
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    ) : (
                      <div className="w-3 h-3 bg-gray-400 rounded-full" />
                    )}
                    <span className="font-semibold text-lg">
                      {locationTrackingActive ? "Live Tracking Active" : "Tracking Off"}
                    </span>
                  </div>
                  {locationTrackingActive && (
                    <span className="text-xs text-green-600">Sharing every 10 seconds</span>
                  )}
                </div>

                {currentLocation && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Current GPS Coordinates:</p>
                    <div className="bg-white p-3 rounded-lg border">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Latitude:</span>
                        <code className="font-mono text-indigo-700">{currentLocation.lat.toFixed(6)}</code>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Longitude:</span>
                        <code className="font-mono text-indigo-700">{currentLocation.lng.toFixed(6)}</code>
                      </div>
                      <div className="flex justify-between text-sm mt-2 pt-2 border-t">
                        <span className="text-gray-500">Speed:</span>
                        <span className="font-medium text-blue-600">{speed} km/h</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status:</span>
                        <span className={`font-medium ${isMoving ? "text-green-600" : "text-yellow-600"}`}>
                          {isMoving ? "Moving" : "Stopped"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {locationUpdateStatus && (
                  <div className={`p-3 rounded-lg mb-4 flex items-center gap-2 ${
                    locationUpdateStatus.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}>
                    {locationUpdateStatus.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
                    {locationUpdateStatus.message}
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={toggleLocationTracking} className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center gap-2 ${locationTrackingActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                    {locationTrackingActive ? <><XCircle size={18} /> Stop Tracking</> : <><Navigation size={18} /> Start Live Tracking</>}
                  </button>
                  <button onClick={shareCurrentLocation} className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
                    <Send size={18} /> Send Now
                  </button>
                </div>
              </div>

              {activeTrip && (
                <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                  <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2"><Truck size={16} /> Active Trip</h3>
                  <p className="text-sm text-orange-700">{activeTrip.travel_from} → {activeTrip.travel_to}</p>
                  <p className="text-xs text-orange-600 mt-1">Progress: {tripProgress}% complete</p>
                </div>
              )}
            </div>
          )}

          {/* TRIPS TAB */}
          {activeTab === "trips" && (
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center flex-wrap gap-3">
                <h2 className="font-semibold">My Assigned Trips</h2>
                <div className="flex gap-2">
                  <button onClick={deleteExpiredTrips} className="text-sm bg-red-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                    <Trash2 size={14} /> Delete Expired
                  </button>
                  {!currentAssignment ? (
                    <button onClick={() => setShowCarAssignment(true)} className="text-sm bg-orange-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <UserPlus size={14} /> Assign Launch
                    </button>
                  ) : (
                    <button onClick={() => setShowChangeAssignment(true)} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <RefreshCcw size={14} /> Change
                    </button>
                  )}
                </div>
              </div>
              {assignedTrips.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bus size={48} className="mx-auto mb-2" />
                  <p>No trips assigned</p>
                  <button onClick={() => setShowCarAssignment(true)} className="mt-2 text-orange-600 underline">Assign a launch first</button>
                </div>
              ) : (
                assignedTrips.map((trip, idx) => {
                  const isExpired = new Date(trip.travel_time) < new Date();
                  return (
                    <div key={idx} className="p-4 border-b flex justify-between items-center flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-orange-600" />
                          <span className="font-semibold">{trip.travel_from} → {trip.travel_to}</span>
                          {isExpired && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Expired</span>}
                        </div>
                        <div className="flex gap-3 text-sm text-gray-500 mt-1">
                          <Clock size={12} className="inline" />{new Date(trip.travel_time).toLocaleString()}
                          <Bus size={12} className="inline ml-2" />{trip.car_plate}
                        </div>
                      </div>
                      {!isExpired && !activeTrip && (
                        <button onClick={() => startTrip(trip)} className="px-3 py-1 bg-orange-600 text-white rounded-lg text-sm">Start</button>
                      )}
                      {activeTrip?.launch_car_id === trip.launch_car_id && (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          <Navigation size={12} className="animate-pulse" /> In Progress ({tripProgress}%)
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TICKETS TAB */}
          {activeTab === "tickets" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs">Active</p>
                  <p className="text-xl font-bold text-green-600">{ticketsData.stats?.active || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs">Used</p>
                  <p className="text-xl font-bold text-blue-600">{ticketsData.stats?.used || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs">Expired</p>
                  <p className="text-xl font-bold text-red-600">{ticketsData.stats?.expired || 0}</p>
                </div>
                <div className="bg-white rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs">Total</p>
                  <p className="text-xl font-bold">{ticketsData.stats?.total || 0}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-3 flex gap-2 shadow-sm flex-wrap">
                <div className="flex-1 relative">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" placeholder="Search by name or phone..." className="w-full pl-9 pr-3 py-2 border rounded-lg outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-1">
                  {["all", "active", "used", "expired"].map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-xs rounded ${filter === f ? "bg-orange-600 text-white" : "bg-gray-100"}`}>{f}</button>
                  ))}
                </div>
                {(ticketsData.stats?.expired || 0) > 0 && (
                  <button onClick={deleteExpiredTickets} className="px-3 py-1 bg-red-100 text-red-700 text-xs rounded flex items-center gap-1">
                    <Trash2 size={12} /> Delete Expired
                  </button>
                )}
              </div>
              
              {ticketsLoading ? (
                <div className="flex justify-center py-12"><Loader2 size={32} className="animate-spin text-orange-600" /></div>
              ) : (
                filteredTickets.map(t => (
                  <div key={t.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{t.passenger_name}</p>
                        <p className="text-xs text-gray-500">{t.phone_number}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(t.ticket_life_cycle)}`}>
                        {t.ticket_life_cycle}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>🚌 {t.car_plate}</span>
                      <span>📍 {t.travel_from} → {t.travel_to}</span>
                      <span>🎫 #{t.id}</span>
                    </div>
                    {t.ticket_life_cycle === "active" && (
                      <button onClick={() => verifyPassenger(t.id)} className="mt-2 px-3 py-1 bg-green-100 text-green-700 text-sm rounded">
                        Verify (+5 pts)
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* PASSENGERS TAB */}
          {activeTab === "passengers" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <Users size={40} />
                    <div>
                      <h1 className="text-2xl font-bold">Passenger Management</h1>
                      <p>Manage passengers on board and auto-expire by route</p>
                    </div>
                  </div>
                  <button onClick={() => setShowRouteSelector(true)} className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
                    <CheckCircle size={16} /> Auto Expire by Route
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <Users size={24} className="mx-auto text-purple-600 mb-2" />
                  <p className="text-2xl font-bold">{passengersOnBoard.length}</p>
                  <p className="text-xs text-gray-500">On Board</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <UserCheck size={24} className="mx-auto text-green-600 mb-2" />
                  <p className="text-2xl font-bold">{ticketsData.stats?.used || 0}</p>
                  <p className="text-xs text-gray-500">Arrived</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm text-center">
                  <UserX size={24} className="mx-auto text-red-600 mb-2" />
                  <p className="text-2xl font-bold">{ticketsData.stats?.expired || 0}</p>
                  <p className="text-xs text-gray-500">Expired</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b bg-gray-50">
                  <h2 className="font-semibold">Passengers On Board ({passengersOnBoard.length})</h2>
                </div>
                <div className="divide-y max-h-96 overflow-auto">
                  {passengersOnBoard.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Users size={48} className="mx-auto mb-2 text-gray-300" />
                      <p>No passengers on board</p>
                    </div>
                  ) : (
                    passengersOnBoard.map(p => (
                      <div key={p.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                            <User size={18} className="text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium">{p.passenger_name}</p>
                            <p className="text-xs text-gray-500">{p.phone_number}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">↓ {p.travel_to}</span>
                          <button onClick={() => verifyPassenger(p.id)} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded hover:bg-green-200 transition">
                            Verify (+5)
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* REWARDS TAB */}
          {activeTab === "rewards" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl p-6 text-white text-center">
                <Trophy size={48} className="mx-auto mb-3" />
                <h2 className="text-3xl font-bold">{rewards.points}</h2>
                <p className="text-sm opacity-90">Total Points Earned</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Award size={18} className="text-yellow-600" /> Badges Earned</h3>
                  {rewards.badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg mb-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>{badge}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Target size={18} className="text-blue-600" /> Achievement Progress</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm"><span>Complete 10 Trips</span><span>{driverStats.completed_trips}/10</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(driverStats.completed_trips / 10) * 100}%` }}></div></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm"><span>Transport 100 Passengers</span><span>{driverStats.delivered_passengers}/100</span></div>
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-green-500 h-2 rounded-full" style={{ width: `${(driverStats.delivered_passengers / 100) * 100}%` }}></div></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Sparkles size={18} className="text-purple-600" /> How to Earn Points</h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 rounded-lg"><CheckCircle size={24} className="mx-auto text-green-500 mb-1" /><p className="text-sm font-medium">Verify Passenger</p><p className="text-xs text-gray-500">+5 points</p></div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg"><Flag size={24} className="mx-auto text-blue-500 mb-1" /><p className="text-sm font-medium">Complete Trip</p><p className="text-xs text-gray-500">+100 points</p></div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg"><Users size={24} className="mx-auto text-purple-500 mb-1" /><p className="text-sm font-medium">Auto Expire by Route</p><p className="text-xs text-gray-500">+10 per ticket</p></div>
                </div>
              </div>
            </div>
          )}

          {/* SUPPORT TAB */}
          {activeTab === "support" && (
            <div className="bg-white rounded-xl p-6 shadow-sm text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"><Headphones size={40} className="text-orange-600" /></div>
              <h2 className="text-xl font-bold mb-2">Need Help?</h2>
              <p className="text-gray-500 mb-4">Contact our support team for assistance</p>
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
              <div><h2 className="font-bold text-white">Assign Launch</h2><p className="text-orange-100 text-sm">Select a launch to drive</p></div>
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
                <select value={selectedLaunchId} onChange={(e) => { setSelectedLaunchId(e.target.value); const launch = availableLaunches.find(l => l.launch_car_id === parseInt(e.target.value)); setSelectedLaunchDetails(launch); }} className="w-full p-3 border rounded-xl">
                  <option value="">Select a launch</option>
                  {availableLaunches.map(launch => (
                    <option key={launch.launch_car_id} value={launch.launch_car_id}>
                      {launch.travel_from} → {launch.travel_to} | {new Date(launch.travel_time).toLocaleString()} | {launch.available_sits} seats
                    </option>
                  ))}
                </select>
              )}
              {selectedLaunchDetails && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Route:</span><span className="font-medium">{selectedLaunchDetails.travel_from} → {selectedLaunchDetails.travel_to}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Departure:</span><span className="font-medium">{new Date(selectedLaunchDetails.travel_time).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Bus:</span><span className="font-medium">{selectedLaunchDetails.car_name} ({selectedLaunchDetails.car_plate})</span></div>
                  </div>
                </div>
              )}
              <button onClick={assignLaunch} disabled={!selectedLaunchId || assigningCar} className="w-full py-3 bg-orange-600 text-white rounded-xl disabled:opacity-50">
                {assigningCar ? "Assigning..." : "Assign Launch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ASSIGNMENT MODAL */}
      {showChangeAssignment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-auto shadow-2xl">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-4 flex justify-between items-center sticky top-0">
              <div><h2 className="font-bold text-white">Change Assignment</h2><p className="text-green-100 text-sm">Select a new launch</p></div>
              <button onClick={() => setShowChangeAssignment(false)} className="text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              {currentAssignment && (
                <div className="bg-gray-100 rounded-xl p-3 mb-2">
                  <p className="text-xs text-gray-500">Current:</p>
                  <p className="font-medium">{currentAssignment.car_name} ({currentAssignment.car_plate})</p>
                  <p className="text-sm">{currentAssignment.travel_from} → {currentAssignment.travel_to}</p>
                </div>
              )}
              {carLoading ? (
                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-green-600" size={32} /></div>
              ) : availableLaunches.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Car size={48} className="mx-auto mb-3 text-gray-300" />
                  <p>No other launches available</p>
                </div>
              ) : (
                <select value={selectedLaunchId} onChange={(e) => { setSelectedLaunchId(e.target.value); const launch = availableLaunches.find(l => l.launch_car_id === parseInt(e.target.value)); setSelectedLaunchDetails(launch); }} className="w-full p-3 border rounded-xl">
                  <option value="">Select a new launch</option>
                  {availableLaunches.map(launch => (
                    <option key={launch.launch_car_id} value={launch.launch_car_id}>
                      {launch.travel_from} → {launch.travel_to} | {new Date(launch.travel_time).toLocaleString()}
                    </option>
                  ))}
                </select>
              )}
              {selectedLaunchDetails && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Route:</span><span className="font-medium">{selectedLaunchDetails.travel_from} → {selectedLaunchDetails.travel_to}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Departure:</span><span className="font-medium">{new Date(selectedLaunchDetails.travel_time).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Bus:</span><span className="font-medium">{selectedLaunchDetails.car_name} ({selectedLaunchDetails.car_plate})</span></div>
                  </div>
                </div>
              )}
              <button onClick={changeAssignment} disabled={!selectedLaunchId || assigningCar} className="w-full py-3 bg-green-600 text-white rounded-xl disabled:opacity-50">
                {assigningCar ? "Changing..." : "Change Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO EXPIRE MODAL */}
      {showRouteSelector && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex justify-between">
              <div><h2 className="font-bold text-white">Auto Expire by Route</h2><p className="text-purple-100 text-sm">Select route to expire tickets</p></div>
              <button onClick={() => setShowRouteSelector(false)} className="text-white"><X size={20} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-yellow-50 rounded-lg p-3 text-sm text-yellow-800">
                <AlertTriangle size={16} className="inline mr-2" />
                This will expire ALL active tickets for the selected route
              </div>
              <select value={selectedRouteForExpiry} onChange={(e) => setSelectedRouteForExpiry(e.target.value)} className="w-full p-3 border rounded-xl">
                <option value="">Select a route/location</option>
                {availableRoutes.map(route => (
                  <option key={route.id} value={route.id}>
                    {route.travel_from} → {route.travel_to} ({route.price_amount?.toLocaleString()} RWF)
                  </option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={() => setShowRouteSelector(false)} className="flex-1 py-2 border rounded-lg">Cancel</button>
                <button onClick={expireTicketsByRoute} disabled={!selectedRouteForExpiry} className="flex-1 py-2 bg-purple-600 text-white rounded-lg disabled:opacity-50">
                  Expire Tickets
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">Driver Profile</h3><button onClick={() => setShowProfileModal(false)}><X /></button></div>
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">{getInitials(driverInfo?.driver_name)}</span>
              </div>
              <h3 className="font-semibold mt-2">{driverInfo?.driver_name}</h3>
            </div>
            <div className="space-y-3">
              <input value={editForm.phone_number} onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})} className="w-full border rounded-lg p-2" placeholder="Phone" />
              <input value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="w-full border rounded-lg p-2" placeholder="Email" />
            </div>
            <button onClick={handleProfileUpdate} className="w-full mt-4 bg-orange-600 text-white py-2 rounded-lg">Save</button>
          </div>
        </div>
      )}

      {/* STATS MODAL */}
      {showStatsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5">
            <div className="flex justify-between"><h3 className="font-bold">Stats</h3><button onClick={() => setShowStatsModal(false)}><X /></button></div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-orange-50 p-3 rounded text-center"><p className="text-xs">Trips</p><p className="text-xl font-bold">{driverStats.completed_trips}</p></div>
              <div className="bg-green-50 p-3 rounded text-center"><p className="text-xs">Passengers</p><p className="text-xl font-bold">{driverStats.delivered_passengers}</p></div>
              <div className="bg-blue-50 p-3 rounded text-center"><p className="text-xs">Revenue</p><p className="text-xl font-bold">{driverStats.total_revenue?.toLocaleString()}</p></div>
              <div className="bg-yellow-50 p-3 rounded text-center"><p className="text-xs">Points</p><p className="text-xl font-bold">{rewards.points}</p></div>
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 text-center">
            <div className="flex justify-between"><h3 className="font-bold">QR Code</h3><button onClick={() => setShowQRModal(false)}><X /></button></div>
            <div className="w-48 h-48 mx-auto my-4 bg-gray-100 rounded-xl flex items-center justify-center"><QrCode size={80} className="text-gray-400" /></div>
            <p className="text-sm">ID: {driverInfo?.id || "N/A"}</p>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5">
            <div className="flex justify-between"><h3 className="font-bold">Settings</h3><button onClick={() => setShowSettingsModal(false)}><X /></button></div>
            <div className="mt-4 pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="text-sm">Sound Notifications</span>
                <button onClick={() => setMuteSound(!muteSound)} className={`px-3 py-1 rounded-lg text-sm ${muteSound ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                  {muteSound ? "Muted" : "On"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAP MODAL */}
      {showMapModal && currentLocation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-5">
            <div className="flex justify-between mb-4"><h3 className="font-bold text-lg">📍 Live Location</h3><button onClick={() => setShowMapModal(false)}><X /></button></div>
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <Map size={80} className="mx-auto text-gray-400 mb-3" />
              <p className="font-mono text-sm">Lat: {currentLocation.lat?.toFixed(6)}°</p>
              <p className="font-mono text-sm">Lng: {currentLocation.lng?.toFixed(6)}°</p>
              <p className="text-sm mt-2">Speed: {speed} km/h • {isMoving ? "Moving" : "Stopped"}</p>
              <a href={`https://www.google.com/maps?q=${currentLocation.lat},${currentLocation.lng}`} target="_blank" className="mt-4 block bg-orange-600 text-white py-2 rounded-lg text-center">Open in Google Maps</a>
            </div>
          </div>
        </div>
      )}

      {/* REWARDS MODAL */}
      {showRewardsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5">
            <div className="flex justify-between"><h3 className="font-bold text-lg">🎁 Rewards</h3><button onClick={() => setShowRewardsModal(false)}><X /></button></div>
            <div className="text-center my-4">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto"><Trophy size={40} className="text-yellow-600" /></div>
              <p className="text-2xl font-bold mt-2">{rewards.points}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>⭐ Safe Driver Badge</span><span>Earned</span></div>
              <div className="flex justify-between p-2 bg-gray-50 rounded"><span>🎯 10 Trips Complete</span><span>{driverStats.completed_trips}/10</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverDashboard;