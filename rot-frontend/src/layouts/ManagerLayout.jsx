// src/layouts/ManagerLayout.jsx

import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  LayoutDashboard,
  Car,
  Users,
  MapPin,
  Navigation,
  Ticket,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  Bell,
  Settings,
  User,
  Search,
  Clock,
  DollarSign,
  HelpCircle,
  Shield,
  Globe,
  Upload,
} from "lucide-react";

function ManagerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [notifPrefOpen, setNotifPrefOpen] = useState(false);
  const [businessInfoOpen, setBusinessInfoOpen] = useState(false);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loadingStats, setLoadingStats] = useState(true);

  // Avatar upload states
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
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

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar_image", avatarFile);

      const response = await axios.put(`${API_URL}/manager/${user?.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        // Construct full image URL
        const avatarUrl = response.data.avatar_url 
          ? (response.data.avatar_url.startsWith("http") ? response.data.avatar_url : `${API_URL}/uploads/${response.data.avatar_url}`)
          : avatarPreview;

        const updatedUser = { ...user, avatar_image: avatarUrl };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        alert("Avatar updated successfully!");
        setProfileModalOpen(false);
        setAvatarFile(null);
        setAvatarPreview(null);
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to update avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const menus = [
    { name: "Dashboard", path: "/manager/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Cars", path: "/manager/cars", icon: <Car size={20} /> },
    { name: "Drivers", path: "/manager/drivers", icon: <Users size={20} /> },
    { name: "Driver Tracking", path: "/manager/driver-tracking", icon: <Navigation size={20} /> },
    { name: "Stations", path: "/manager/stations", icon: <MapPin size={20} /> },
    { name: "Launch Cars", path: "/manager/launch-cars", icon: <Navigation size={20} /> },
    { name: "Locations", path: "/manager/locations", icon: <MapPin size={20} /> },
    { name: "Tickets", path: "/manager/tickets", icon: <Ticket size={20} /> },
    { name: "Reports", path: "/manager/reports", icon: <FileText size={20} /> },
    { name: "Analytics", path: "/manager/analytics", icon: <BarChart3 size={20} /> },
  ];

  const getInitials = (email) => email?.split("@")[0]?.slice(0, 2).toUpperCase() || "CM";

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith("http") ? avatar : `${API_URL}/uploads/${avatar}`;
  };

  const formatTime = (date) => date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date) => date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`Searching for: ${searchQuery}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition"
      >
        <Menu size={22} />
      </button>

      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR - Blue gradient */}
      <aside
        className={`fixed top-0 left-0 h-full z-50 transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarOpen ? "w-72" : "w-20"} bg-gradient-to-b from-blue-900 to-blue-950 text-white shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-blue-800">
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
                <p className="text-xs text-blue-300">Company Manager</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-blue-800 transition"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-blue-800">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menu - removed stats card */}
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
                    : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-blue-300" : "group-hover:text-blue-300"}>{menu.icon}</span>
                {sidebarOpen && <span className="text-sm font-medium">{menu.name}</span>}
                {isActive && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300" />}
              </Link>
            );
          })}
        </nav>

        {/* User info & logout */}
        <div className="p-4 border-t border-blue-800">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 p-2 mb-3 rounded-xl bg-blue-800/30">
              {/* Avatar display */}
              {user.avatar_image ? (
                <img
                  src={getAvatarUrl(user.avatar_image)}
                  alt="Avatar"
                  className="w-9 h-9 rounded-full object-cover border border-white/30"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-9 h-9 rounded-full bg-white text-blue-900 flex items-center justify-center font-bold text-sm shadow ${
                  user.avatar_image ? "hidden" : "flex"
                }`}
              >
                {getInitials(user.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.email?.split("@")[0]}</p>
                <p className="text-xs text-blue-300">Manager</p>
              </div>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="p-1 rounded-lg hover:bg-blue-700 transition"
              >
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
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
          <div className="px-4 py-2 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-gray-800 truncate">
                Welcome back, {user?.email?.split("@")[0] || "Manager"}! 🎉
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {formatDate(currentTime)} • {formatTime(currentTime)}
              </p>
            </div>

            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-1.5 w-80">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search buses, routes, tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full"
              />
            </form>

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
                        <p className="text-sm font-semibold text-gray-800">New ticket booking</p>
                        <p className="text-xs text-gray-500 mt-1">Kigali → Huye • 2 min ago</p>
                      </div>
                      <div className="p-4 hover:bg-gray-50 cursor-pointer">
                        <p className="text-sm font-semibold text-gray-800">Payment received</p>
                        <p className="text-xs text-gray-500 mt-1">120,000 RWF via MTN • 1 hour ago</p>
                      </div>
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
                      <button
                        onClick={() => { setNotifPrefOpen(true); setSettingsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Bell size={16} /> Notifications
                      </button>
                      <button
                        onClick={() => { setBusinessInfoOpen(true); setSettingsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Globe size={16} /> Business Info
                      </button>
                      <button
                        onClick={() => { setAdvancedSettingsOpen(true); setSettingsOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Shield size={16} /> Advanced
                      </button>
                      <hr className="my-1" />
                      <button
                        onClick={() => window.open("https://help.example.com", "_blank")}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <HelpCircle size={16} /> Help & Support
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

              {/* Avatar in top bar (mobile/desktop) */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md"
              >
                {user?.avatar_image ? (
                  <img
                    src={getAvatarUrl(user.avatar_image)}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  getInitials(user?.email)
                )}
              </button>
            </div>
          </div>
        </header>

        <div className="p-5 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* PROFILE MODAL – medium size */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">Profile Settings</h3>
              <button onClick={() => setProfileModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md"
                    />
                  ) : user?.avatar_image ? (
                    <img
                      src={getAvatarUrl(user.avatar_image)}
                      alt="Current avatar"
                      className="w-20 h-20 rounded-full object-cover border-4 border-blue-500 shadow-md"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-500 text-2xl font-bold text-blue-700 shadow-md">
                      {getInitials(user?.email)}
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

              {/* User info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={user?.email || ""} className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm" disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" placeholder="Enter phone number" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" placeholder="Enter company name" className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setProfileModalOpen(false)} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm">Cancel</button>
                <button
                  onClick={avatarFile ? saveAvatar : () => { alert("No changes to save"); setProfileModalOpen(false); }}
                  disabled={uploadingAvatar}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center gap-1"
                >
                  {uploadingAvatar ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other modals (Notification Preferences, Business Info, Advanced Settings) – kept as before */}
      {notifPrefOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Notification Preferences</h3><button onClick={() => setNotifPrefOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><div><p className="font-medium">Email Notifications</p><p className="text-sm text-gray-500">Receive updates via email</p></div><input type="checkbox" defaultChecked className="w-5 h-5 rounded" /></div>
              <div className="flex justify-between items-center"><div><p className="font-medium">SMS Notifications</p><p className="text-sm text-gray-500">Get SMS alerts</p></div><input type="checkbox" className="w-5 h-5 rounded" /></div>
              <div className="flex justify-between items-center"><div><p className="font-medium">Push Notifications</p><p className="text-sm text-gray-500">Browser notifications</p></div><input type="checkbox" defaultChecked className="w-5 h-5 rounded" /></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setNotifPrefOpen(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={() => { alert("Preferences saved"); setNotifPrefOpen(false); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Save</button></div>
          </div>
        </div>
      )}

      {businessInfoOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Business Information</h3><button onClick={() => setBusinessInfoOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <input type="text" placeholder="Business Name" className="w-full px-3 py-2 border rounded-lg" />
              <input type="text" placeholder="License Number" className="w-full px-3 py-2 border rounded-lg" />
              <textarea placeholder="Address" rows="3" className="w-full px-3 py-2 border rounded-lg"></textarea>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setBusinessInfoOpen(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={() => { alert("Business info updated"); setBusinessInfoOpen(false); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Update</button></div>
          </div>
        </div>
      )}

      {advancedSettingsOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold">Advanced Settings</h3><button onClick={() => setAdvancedSettingsOpen(false)}><X size={20} /></button></div>
            <div className="space-y-3">
              <div className="flex justify-between items-center"><div><p className="font-medium">Two-Factor Authentication</p><p className="text-sm text-gray-500">Extra security</p></div><input type="checkbox" className="w-5 h-5 rounded" /></div>
              <div className="flex justify-between items-center"><div><p className="font-medium">API Access</p><p className="text-sm text-gray-500">Enable API integration</p></div><input type="checkbox" className="w-5 h-5 rounded" /></div>
              <select className="w-full px-3 py-2 border rounded-lg"><option>30 days retention</option><option>90 days</option><option>1 year</option></select>
              <div className="bg-red-50 p-3 rounded-lg"><p className="text-sm font-semibold text-red-800">Danger Zone</p><button className="mt-2 w-full py-2 bg-red-600 text-white rounded-lg text-sm">Delete Account</button></div>
            </div>
            <div className="flex gap-3 mt-6"><button onClick={() => setAdvancedSettingsOpen(false)} className="flex-1 py-2 border rounded-lg">Cancel</button><button onClick={() => { alert("Settings applied"); setAdvancedSettingsOpen(false); }} className="flex-1 py-2 bg-blue-600 text-white rounded-lg">Apply</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerLayout;