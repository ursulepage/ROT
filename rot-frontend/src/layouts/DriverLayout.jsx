// src/layouts/DriverLayout.jsx

import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  LayoutDashboard,
  BusFront,
  Ticket,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  MapPin,
  Navigation,
  User,
  Phone,
  Car,
  Clock,
  Calendar,
  Camera,
  Upload,
  Shield,
  HelpCircle,
  Globe,
  Smartphone,
  Map,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  Fuel,
  Thermometer,
  Gauge,
  Wifi,
  Bluetooth,
  Volume2,
  Battery,
  Award,
  TrendingUp,
  Star,
  Gift,
  Coffee,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Compass,
  Home,
  AlertTriangle,
  ThumbsUp,
  MessageCircle,
  Share2,
  QrCode,
  Download,
  Printer,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
} from "lucide-react";

function DriverLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [driverInfo, setDriverInfo] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temp: 24, condition: "Sunny", icon: "☀️" });
  const [fuelLevel, setFuelLevel] = useState(75);
  const [earnings, setEarnings] = useState({ today: 45000, week: 320000, month: 1250000 });
  const [rating, setRating] = useState(4.8);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [nextTrip, setNextTrip] = useState(null);
  
  // Profile modal states
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  
  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);
  
  // Profile edit form
  const [editForm, setEditForm] = useState({
    driver_name: "",
    phone_number: "",
    email: "",
    emergency_contact: "",
    license_number: "",
    license_expiry: "",
    address: "",
    blood_group: "",
    years_of_experience: "",
  });
  
  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  
  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    email_alerts: true,
    sms_alerts: true,
    push_alerts: true,
    trip_reminders: true,
    payment_notifications: true,
    weather_alerts: true,
    maintenance_alerts: true,
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    const driverData = localStorage.getItem("driver");
    
    if (userData) {
      const parsed = JSON.parse(userData);
      setDriverInfo(parsed);
      setEditForm({
        driver_name: parsed.driver_name || "",
        phone_number: parsed.phone_number || "",
        email: parsed.email || "",
        emergency_contact: parsed.emergency_contact || "",
        license_number: parsed.license_number || "",
        license_expiry: parsed.license_expiry || "",
        address: parsed.address || "",
        blood_group: parsed.blood_group || "",
        years_of_experience: parsed.years_of_experience || "",
      });
    } else if (driverData) {
      const parsed = JSON.parse(driverData);
      setDriverInfo(parsed);
      setEditForm({
        driver_name: parsed.driver_name || "",
        phone_number: parsed.phone_number || "",
        email: parsed.email || "",
        emergency_contact: parsed.emergency_contact || "",
        license_number: parsed.license_number || "",
        license_expiry: parsed.license_expiry || "",
        address: parsed.address || "",
        blood_group: parsed.blood_group || "",
        years_of_experience: parsed.years_of_experience || "",
      });
    }
    
    // Fetch current trip
    fetchCurrentTrip();
    // Fetch next trip
    fetchNextTrip();
    // Fetch earnings
    fetchEarnings();
    // Generate QR code for driver
    generateDriverQR();
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchCurrentTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/current-trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setCurrentTrip(response.data);
      }
    } catch (error) {
      console.error("No current trip:", error);
    }
  };

  const fetchNextTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/next-trip`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setNextTrip(response.data);
      }
    } catch (error) {
      console.error("No upcoming trip:", error);
    }
  };

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setEarnings(response.data);
      }
    } catch (error) {
      console.error("Earnings fetch error:", error);
    }
  };

  const generateDriverQR = async () => {
    try {
      const driverId = driverInfo?.id || "DRIVER001";
      const qrData = JSON.stringify({
        driver_id: driverId,
        name: driverInfo?.driver_name,
        phone: driverInfo?.phone_number,
        company: "ROT Transport",
      });
      const QRCode = await import('qrcode');
      const qrImage = await QRCode.toDataURL(qrData);
      setQrCode(qrImage);
    } catch (error) {
      console.error("QR generation error:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("driver");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar_image", avatarFile);
      formData.append("role", "driver");

      const response = await axios.put(`${API_URL}/driver/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        const avatarUrl = response.data.avatar_url 
          ? (response.data.avatar_url.startsWith("http") ? response.data.avatar_url : `${API_URL}/uploads/${response.data.avatar_url}`)
          : avatarPreview;

        const updatedDriver = { ...driverInfo, avatar_image: avatarUrl };
        localStorage.setItem("driver", JSON.stringify(updatedDriver));
        localStorage.setItem("user", JSON.stringify(updatedDriver));
        setDriverInfo(updatedDriver);
        alert("Profile photo updated successfully!");
        setProfileModalOpen(false);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to update profile photo. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/driver/profile`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const updatedDriver = { ...driverInfo, ...editForm };
        localStorage.setItem("driver", JSON.stringify(updatedDriver));
        localStorage.setItem("user", JSON.stringify(updatedDriver));
        setDriverInfo(updatedDriver);
        alert("Profile updated successfully!");
        setProfileModalOpen(false);
      }
    } catch (error) {
      console.error("Profile update failed:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert("New passwords do not match!");
      return;
    }
    if (passwordForm.new_password.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/driver/change-password`, {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        alert("Password changed successfully!");
        setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
        setSettingsModalOpen(false);
      }
    } catch (error) {
      console.error("Password change failed:", error);
      alert(error.response?.data?.message || "Failed to change password");
    }
  };

  const saveNotificationSettings = () => {
    localStorage.setItem("driver_notifications", JSON.stringify(notifSettings));
    alert("Notification preferences saved!");
    setNotificationsOpen(false);
  };

  const menuItems = [
    { name: "Dashboard", path: "/driver/dashboard", icon: <LayoutDashboard size={20} />, badge: null },
    { name: "My Trips", path: "/driver/trips", icon: <BusFront size={20} />, badge: currentTrip ? "LIVE" : null },
    { name: "Tickets", path: "/driver/tickets", icon: <Ticket size={20} />, badge: null },
    { name: "Live Tracking", path: "/driver/tracking", icon: <MapPin size={20} />, badge: null },
    { name: "My Bus", path: "/driver/my-bus", icon: <Car size={20} />, badge: null },
    { name: "Earnings", path: "/driver/earnings", icon: <TrendingUp size={20} />, badge: null },
    { name: "Support", path: "/driver/support", icon: <MessageCircle size={20} />, badge: null },
  ];

  const getInitials = (name) => {
    if (!name) return "D";
    return name.charAt(0)?.toUpperCase() || "D";
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith("http") ? avatar : `${API_URL}/uploads/${avatar}`;
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        } w-80 bg-gradient-to-br from-orange-600 via-orange-700 to-orange-800 text-white shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-orange-500/30">
          <div className="flex items-center gap-3">
            <img 
              src="/ROT.png" 
              alt="ROT Logo" 
              className="w-12 h-12 object-contain bg-white rounded-xl p-1.5 shadow-lg"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/48x48?text=R";
              }}
            />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">ROT</h1>
              <p className="text-xs text-orange-200">Driver Portal</p>
            </div>
          </div>
        </div>

        {/* Driver Info - Clickable Profile */}
        <div 
          className="px-5 py-5 border-b border-orange-500/30 cursor-pointer hover:bg-orange-500/20 transition-all group"
          onClick={() => setProfileModalOpen(true)}
        >
          <div className="flex items-center gap-3">
            {driverInfo?.avatar_image ? (
              <img
                src={getAvatarUrl(driverInfo.avatar_image)}
                alt="Avatar"
                className="w-14 h-14 rounded-xl object-cover border-2 border-white/30 shadow-md group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center border-2 border-white/30 shadow-md">
                <span className="text-2xl font-bold">{getInitials(driverInfo?.driver_name)}</span>
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-base">{driverInfo?.driver_name || "Driver"}</h3>
              <p className="text-xs text-orange-200 flex items-center gap-1.5 mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Active • {driverInfo?.car_plate ? `Bus: ${driverInfo.car_plate}` : "No bus assigned"}
              </p>
              {/* Rating stars */}
              <div className="flex items-center gap-1 mt-1">
                <Star size={12} className="text-yellow-300 fill-yellow-300" />
                <span className="text-xs">{rating} ★</span>
              </div>
            </div>
            <Settings size={16} className="text-orange-300 opacity-0 group-hover:opacity-100 transition" />
          </div>
        </div>

        {/* Fuel Level Indicator */}
        <div className="px-5 py-3 border-b border-orange-500/30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-orange-200 flex items-center gap-1">
              <Fuel size={12} /> Fuel Level
            </span>
            <span className="text-xs font-semibold">{fuelLevel}%</span>
          </div>
          <div className="w-full bg-orange-500/30 rounded-full h-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${fuelLevel}%` }}
            />
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto h-[calc(100%-420px)]">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                location.pathname === item.path
                  ? "bg-white text-orange-700 shadow-lg font-semibold"
                  : "text-orange-100 hover:bg-orange-500/30 hover:text-white"
              }`}
            >
              <span className={location.pathname === item.path ? "text-orange-600" : "group-hover:text-orange-200"}>
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-red-500 px-1.5 py-0.5 rounded-full animate-pulse">
                  {item.badge}
                </span>
              )}
              {location.pathname === item.path && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-600"></div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Stats Cards */}
        <div className="px-4 py-3 border-t border-orange-500/30 bg-orange-700/20">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-orange-200">Today's Earnings</p>
              <p className="text-sm font-bold">{earnings.today.toLocaleString()} RWF</p>
            </div>
            <div className="bg-white/10 rounded-lg p-2 text-center">
              <p className="text-xs text-orange-200">This Week</p>
              <p className="text-sm font-bold">{earnings.week.toLocaleString()} RWF</p>
            </div>
          </div>
        </div>

        {/* Notifications & Settings Footer */}
        <div className="absolute bottom-0 left-0 w-full p-4 border-t border-orange-500/30 bg-orange-700/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3 px-2">
            <button
              onClick={() => setNotificationsOpen(true)}
              className="flex items-center gap-2 text-orange-200 hover:text-white transition relative"
            >
              <Bell size={18} />
              <span className="text-xs">Notifications</span>
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setStatsModalOpen(true)}
              className="flex items-center gap-2 text-orange-200 hover:text-white transition"
            >
              <Award size={18} />
              <span className="text-xs">Stats</span>
            </button>
            <button
              onClick={() => setQrModalOpen(true)}
              className="flex items-center gap-2 text-orange-200 hover:text-white transition"
            >
              <QrCode size={18} />
              <span className="text-xs">QR</span>
            </button>
            <button
              onClick={() => setSettingsModalOpen(true)}
              className="flex items-center gap-2 text-orange-200 hover:text-white transition"
            >
              <Settings size={18} />
              <span className="text-xs">Settings</span>
            </button>
          </div>
          <div className="text-center mb-3 text-xs text-orange-200/80 flex items-center justify-center gap-2">
            <ClockIcon size={12} />
            {formatDate(currentTime)} • {formatTime(currentTime)}
            <Sun size={12} className="ml-1" />
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-600 py-3 rounded-xl font-semibold transition-all"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:ml-80 min-h-screen">
        {/* Topbar */}
        <div className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-gray-100">
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3">
            <div className="hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome back, {driverInfo?.driver_name?.split(" ")[0] || "Driver"}! 🚌
              </h1>
              <p className="text-sm text-gray-500">Manage your trips and track your location in real-time</p>
            </div>
            <div className="lg:hidden">
              <h1 className="text-lg font-bold text-gray-800">Driver Panel</h1>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {/* Weather Widget */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-3 py-1.5 rounded-full shadow-sm">
                <span className="text-lg">{weather.icon}</span>
                <span className="text-sm font-medium text-gray-700">{weather.temp}°C</span>
                <span className="text-xs text-gray-500">{weather.condition}</span>
              </div>
              
              {/* Live Tracking Indicator */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 px-4 py-2 rounded-full shadow-sm">
                <Navigation size={14} className="text-orange-600 animate-pulse" />
                <span className="text-xs font-medium text-orange-700">Live Tracking Active</span>
              </div>

              {/* Next Trip Timer */}
              {nextTrip && (
                <div className="flex items-center gap-2 bg-purple-50 px-3 py-2 rounded-full shadow-sm">
                  <ClockIcon size={14} className="text-purple-600" />
                  <span className="text-xs font-medium text-purple-700">
                    Next: {nextTrip.travel_from} → {nextTrip.travel_to}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </div>

      {/* ==================== PROFILE MODAL (Enhanced) ==================== */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-t-2xl p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <User size={22} /> Driver Profile
                </h3>
                <p className="text-orange-100 text-sm mt-0.5">View and edit your personal information</p>
              </div>
              <button onClick={() => { setProfileModalOpen(false); setAvatarFile(null); setAvatarPreview(null); }} className="p-2 hover:bg-white/20 rounded-xl transition">
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleProfileUpdate}>
                {/* Avatar Upload Section */}
                <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-100">
                  <div className="relative group">
                    {(avatarPreview || driverInfo?.avatar_image) ? (
                      <img
                        src={avatarPreview || getAvatarUrl(driverInfo?.avatar_image)}
                        alt="Profile"
                        className="w-28 h-28 rounded-2xl object-cover border-4 border-orange-500 shadow-xl"
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center border-4 border-orange-500 shadow-xl">
                        <span className="text-4xl font-bold text-white">{getInitials(driverInfo?.driver_name)}</span>
                      </div>
                    )}
                    <button type="button" onClick={() => fileInputRef.current.click()} className="absolute bottom-0 right-0 p-2.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition-all group-hover:scale-110">
                      <Camera size={16} className="text-gray-600" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Click the camera icon to change your photo</p>
                  {avatarFile && (
                    <div className="flex gap-2 mt-3">
                      <button type="button" onClick={saveAvatar} disabled={uploadingAvatar} className="px-4 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-1">
                        {uploadingAvatar ? "Uploading..." : "Save Photo"}
                      </button>
                      <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); }} className="px-4 py-1.5 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Three Column Form for better organization */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
                    <input type="text" value={editForm.driver_name} onChange={(e) => setEditForm({ ...editForm, driver_name: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
                    <input type="tel" value={editForm.phone_number} onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Emergency Contact</label>
                    <input type="tel" value={editForm.emergency_contact} onChange={(e) => setEditForm({ ...editForm, emergency_contact: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Emergency phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">License Number</label>
                    <input type="text" value={editForm.license_number} onChange={(e) => setEditForm({ ...editForm, license_number: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">License Expiry</label>
                    <input type="date" value={editForm.license_expiry} onChange={(e) => setEditForm({ ...editForm, license_expiry: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                    <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Home address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Blood Group</label>
                    <select value={editForm.blood_group} onChange={(e) => setEditForm({ ...editForm, blood_group: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl">
                      <option value="">Select</option>
                      <option>A+</option><option>A-</option><option>B+</option><option>B-</option>
                      <option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Years of Experience</label>
                    <input type="number" value={editForm.years_of_experience} onChange={(e) => setEditForm({ ...editForm, years_of_experience: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" placeholder="Years" />
                  </div>
                </div>

                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setProfileModalOpen(false)} className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium transition">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-medium transition shadow-md">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ==================== STATS MODAL ==================== */}
      {statsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Award size={20} /> Driver Stats
                </h3>
                <p className="text-purple-100 text-sm mt-0.5">Your performance overview</p>
              </div>
              <button onClick={() => setStatsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-orange-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Total Trips</p>
                  <p className="text-2xl font-bold text-orange-600">147</p>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">On-Time Rate</p>
                  <p className="text-2xl font-bold text-green-600">98%</p>
                </div>
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Total Passengers</p>
                  <p className="text-2xl font-bold text-blue-600">2,845</p>
                </div>
                <div className="bg-yellow-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500">Safety Score</p>
                  <p className="text-2xl font-bold text-yellow-600">4.9</p>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Customer Rating</span>
                  <span className="text-sm font-semibold">{rating} / 5.0</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${(rating/5)*100}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== QR CODE MODAL ==================== */}
      {qrModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <QrCode size={20} /> Driver QR Code
                </h3>
                <p className="text-gray-300 text-sm mt-0.5">Scan to verify driver identity</p>
              </div>
              <button onClick={() => setQrModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 text-center">
              {qrCode ? (
                <img src={qrCode} alt="Driver QR Code" className="w-48 h-48 mx-auto mb-4" />
              ) : (
                <div className="w-48 h-48 mx-auto mb-4 bg-gray-100 rounded-xl flex items-center justify-center">
                  <QrCode size={64} className="text-gray-400" />
                </div>
              )}
              <p className="text-sm text-gray-600 mt-2">Driver ID: {driverInfo?.id || "N/A"}</p>
              <button 
                onClick={() => window.print()}
                className="mt-4 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 inline-flex items-center gap-2"
              >
                <Printer size={16} /> Print QR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SETTINGS MODAL ==================== */}
      {settingsModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Settings size={20} /> Settings
                </h3>
                <p className="text-gray-300 text-sm mt-0.5">Manage your account preferences</p>
              </div>
              <button onClick={() => setSettingsModalOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {/* Change Password Section */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield size={16} className="text-orange-600" /> Change Password
                </h4>
                <form onSubmit={handlePasswordChange} className="space-y-3">
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} placeholder="Current Password" value={passwordForm.current_password} onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl pr-10" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <input type="password" placeholder="New Password (min. 6 characters)" value={passwordForm.new_password} onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" required />
                  <input type="password" placeholder="Confirm New Password" value={passwordForm.confirm_password} onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl" required />
                  <button type="submit" className="w-full py-2.5 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition font-medium">
                    Update Password
                  </button>
                </form>
              </div>

              <hr className="my-4" />

              {/* App Preferences */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Globe size={16} className="text-orange-600" /> App Preferences
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">Language</p>
                      <p className="text-xs text-gray-500">Choose your preferred language</p>
                    </div>
                    <select className="px-3 py-1.5 border rounded-lg text-sm">
                      <option>English</option>
                      <option>Kinyarwanda</option>
                      <option>French</option>
                    </select>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-xs text-gray-500">Toggle dark/light theme</p>
                    </div>
                    <input type="checkbox" className="w-5 h-5 rounded" />
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setSettingsModalOpen(false)} className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== NOTIFICATIONS MODAL (Enhanced) ==================== */}
      {notificationsOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Bell size={20} /> Notifications
                </h3>
                <p className="text-orange-100 text-sm mt-0.5">Manage your alert preferences</p>
              </div>
              <button onClick={() => setNotificationsOpen(false)} className="p-2 hover:bg-white/20 rounded-xl transition">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">Email Alerts</p><p className="text-xs text-gray-500">Trip updates via email</p></div>
                <input type="checkbox" checked={notifSettings.email_alerts} onChange={(e) => setNotifSettings({ ...notifSettings, email_alerts: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">SMS Alerts</p><p className="text-xs text-gray-500">Important updates via SMS</p></div>
                <input type="checkbox" checked={notifSettings.sms_alerts} onChange={(e) => setNotifSettings({ ...notifSettings, sms_alerts: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">Push Notifications</p><p className="text-xs text-gray-500">Browser notifications</p></div>
                <input type="checkbox" checked={notifSettings.push_alerts} onChange={(e) => setNotifSettings({ ...notifSettings, push_alerts: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">Trip Reminders</p><p className="text-xs text-gray-500">Before your trips</p></div>
                <input type="checkbox" checked={notifSettings.trip_reminders} onChange={(e) => setNotifSettings({ ...notifSettings, trip_reminders: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">Payment Notifications</p><p className="text-xs text-gray-500">Payment updates</p></div>
                <input type="checkbox" checked={notifSettings.payment_notifications} onChange={(e) => setNotifSettings({ ...notifSettings, payment_notifications: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">Weather Alerts</p><p className="text-xs text-gray-500">Weather conditions</p></div>
                <input type="checkbox" checked={notifSettings.weather_alerts} onChange={(e) => setNotifSettings({ ...notifSettings, weather_alerts: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                <div><p className="font-medium">Maintenance Alerts</p><p className="text-xs text-gray-500">Vehicle maintenance</p></div>
                <input type="checkbox" checked={notifSettings.maintenance_alerts} onChange={(e) => setNotifSettings({ ...notifSettings, maintenance_alerts: e.target.checked })} className="w-5 h-5 rounded" />
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setNotificationsOpen(false)} className="flex-1 py-2.5 border rounded-xl hover:bg-gray-50">
                Cancel
              </button>
              <button onClick={saveNotificationSettings} className="flex-1 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700">
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DriverLayout;