// src/layouts/StationLayout.jsx

import { useState, useEffect, useRef } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  LayoutDashboard,
  QrCode,
  UserCheck,
  LogOut,
  Ticket,
  Menu,
  X,
  Bell,
  Settings,
  Upload,
  Search,
  Clock,
  User,
  Shield,
  Building2,
  MapPin,
} from "lucide-react";
import axios from "axios";

function StationLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [station, setStation] = useState(null);
  const [company, setCompany] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Fetch station and its company (agency) – station works for this company manager
  useEffect(() => {
    const fetchStationData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const userData = localStorage.getItem("user");
        if (userData) {
          const parsed = JSON.parse(userData);
          setStation(parsed);
          // If the station has a company_id, fetch the company details
          if (parsed.company_id) {
            const companyRes = await axios.get(`${API_URL}/company/${parsed.company_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCompany(companyRes.data);
          }
        }
      } catch (error) {
        console.error("Error fetching station data:", error);
      }
    };
    fetchStationData();
  }, []);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar_image", avatarFile);
      // Uncomment when backend endpoint is ready
      // await axios.put(`${API_URL}/station/avatar`, formData, {
      //   headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      // });
      alert("Profile updated successfully!");
      setProfileModalOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to update profile");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("company");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const menus = [
    { name: "Dashboard", path: "/station/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Tickets", path: "/station/tickets", icon: <Ticket size={20} /> },
    { name: "Scan Ticket", path: "/station/scan-ticket", icon: <QrCode size={20} /> },
    { name: "Verify Passenger", path: "/station/verify-passenger", icon: <UserCheck size={20} /> },
  ];

  const getInitials = (name) => {
    return name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "ST";
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchQuery}`);
  };

  const stationName = station?.station_name || station?.name || "Station";
  const agencyName = company?.name || station?.company_name || "Unknown Agency";

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition"
      >
        <Menu size={22} />
      </button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "w-72" : "w-20"} bg-gradient-to-b from-indigo-900 to-indigo-950 text-white shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-indigo-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/ROT.png"
              alt="ROT"
              className="w-10 h-10 bg-white rounded-full p-1.5 object-cover"
              onError={(e) => (e.target.src = "https://placehold.co/40x40?text=R")}
            />
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold tracking-tight">ROT</h1>
                <p className="text-xs text-indigo-300">Station Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-indigo-800 transition"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-indigo-800">
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {menus.map((menu) => {
            const isActive = location.pathname === menu.path;
            return (
              <Link
                key={menu.path}
                to={menu.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-white/10 text-white shadow-md"
                    : "text-indigo-100 hover:bg-indigo-800/50 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-indigo-300" : "group-hover:text-indigo-300"}>{menu.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium">{menu.name}</span>}
                {isActive && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-300" />}
              </Link>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-indigo-800">
          {sidebarOpen && (
            <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-indigo-800/30">
              {station?.avatar_image ? (
                <img
                  src={station.avatar_image}
                  alt="Station avatar"
                  className="w-9 h-9 rounded-full object-cover border border-white/30"
                />
              ) : null}
              <div
                className={`w-9 h-9 rounded-full bg-white text-indigo-900 flex items-center justify-center font-bold text-sm shadow ${
                  station?.avatar_image ? "hidden" : "flex"
                }`}
              >
                {getInitials(stationName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{stationName}</p>
                <p className="text-xs text-indigo-300">Station Manager</p>
              </div>
              <button onClick={() => setProfileModalOpen(true)} className="p-1 rounded-lg hover:bg-indigo-700 transition">
                <Settings size={14} />
              </button>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600/80 hover:bg-red-600 py-2.5 rounded-xl font-medium transition-all"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-72" : "lg:ml-20"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">Station Dashboard</h1>
              <p className="text-xs text-gray-500 hidden sm:block">{formatDate(currentTime)} • {formatTime(currentTime)}</p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1.5 w-80">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search tickets, passengers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full"
              />
            </form>

            {/* Right side icons */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationOpen(!notificationOpen);
                    setSettingsOpen(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition relative"
                >
                  <Bell size={20} className="text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                {notificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-gray-800">Notifications</h3>
                      <button onClick={() => setNotificationOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto divide-y divide-gray-100">
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-semibold text-gray-800">New ticket scanned</p>
                        <p className="text-xs text-gray-500 mt-1">Kigali → Huye • 2 min ago</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-semibold text-gray-800">Verification successful</p>
                        <p className="text-xs text-gray-500 mt-1">Passenger allowed • 1 hour ago</p>
                      </div>
                    </div>
                    <div className="p-3 text-center border-t border-gray-100">
                      <button className="text-sm text-indigo-600 font-medium">View all</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Settings dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setSettingsOpen(!settingsOpen);
                    setNotificationOpen(false);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                >
                  <Settings size={20} className="text-gray-600" />
                </button>
                {settingsOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                    <div className="py-2">
                      <button
                        onClick={() => { setProfileModalOpen(true); setSettingsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <User size={16} /> Profile
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => window.open("https://help.example.com", "_blank")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Shield size={16} /> Help & Support
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile avatar */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
              >
                {station?.avatar_image ? (
                  <img src={station.avatar_image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(stationName)
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="p-5 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* PROFILE MODAL showing the real agency (company) */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">Station Profile</h3>
              <button onClick={() => setProfileModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 shadow-md" />
                  ) : station?.avatar_image ? (
                    <img src={station.avatar_image} alt="Station Avatar" className="w-20 h-20 rounded-full object-cover border-4 border-indigo-500 shadow-md" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-indigo-500 text-2xl font-bold text-indigo-700 shadow-md">
                      {getInitials(stationName)}
                    </div>
                  )}
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md cursor-pointer hover:bg-gray-100"
                  >
                    <Upload size={14} className="text-gray-600" />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </div>
                <p className="text-xs text-gray-500">Click icon to change photo</p>
              </div>

              {/* Station Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-800">
                  <MapPin size={14} className="text-indigo-500" />
                  {stationName}
                </div>
              </div>

              {/* Agency (Company) – confirms station works for a company manager */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agency (Company)</label>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-800">
                  <Building2 size={14} className="text-indigo-500" />
                  {agencyName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <div className="flex items-center gap-2 px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-800">
                  <MapPin size={14} className="text-indigo-500" />
                  {station?.address || company?.address || "Not provided"}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={uploadingAvatar || !avatarFile}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-1"
                >
                  {uploadingAvatar ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StationLayout;