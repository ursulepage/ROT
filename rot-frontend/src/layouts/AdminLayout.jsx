// src/layouts/AdminLayout.jsx

import { useState, useEffect } from "react";
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import {
  LayoutDashboard,
  Building2,
  Users,
  BarChart3,
  Wallet,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Settings,
  Bell,
  Upload,
  Sun,
  Moon,
  Mail,
  Phone,
  Briefcase,
} from "lucide-react";

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  // Load saved theme and apply immediately
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setDarkMode(isDark);
    applyTheme(isDark);
  }, []);

  // Function to apply theme to html element
  const applyTheme = (isDark) => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
    applyTheme(newMode);
    // Dispatch event for other components (like dashboard) to sync
    window.dispatchEvent(new CustomEvent("themeChange", { detail: { isDark: newMode } }));
  };

  // Load user, notifications
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    const savedNotifs = localStorage.getItem("notifications");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    } else {
      const defaultNotifs = [
        { id: 1, title: "New company registered", message: "Volcano Express joined the platform", time: "5 min ago", read: false },
        { id: 2, title: "Payment received", message: "Transaction #TXN12345 completed", time: "1 hour ago", read: false },
        { id: 3, title: "System update", message: "Scheduled maintenance tonight", time: "3 hours ago", read: true },
      ];
      setNotifications(defaultNotifs);
      localStorage.setItem("notifications", JSON.stringify(defaultNotifs));
    }
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) setAvatarFile(file);
  };

  const handleSaveProfile = async () => {
    if (!avatarFile) return;
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert("Profile updated successfully!");
      setProfileModalOpen(false);
    } catch (error) {
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const markNotificationRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("notifications", JSON.stringify(updated));
  };

  const menus = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Companies", path: "/admin/companies", icon: <Building2 size={20} /> },
    { name: "Managers", path: "/admin/managers", icon: <Users size={20} /> },
    { name: "Reports", path: "/admin/reports", icon: <BarChart3 size={20} /> },
    { name: "Payments", path: "/admin/payments", icon: <Wallet size={20} /> },
  ];

  const getInitials = (email) => {
    return email?.split("@")[0].slice(0, 2).toUpperCase() || "AD";
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
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
        } ${sidebarOpen ? "w-72" : "w-20"} bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-2xl`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3 overflow-hidden">
            <img
              src="/ROT.png"
              alt="ROT"
              className="w-10 h-10 bg-white rounded-full p-1.5 object-cover"
              onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/40x40?text=R"; }}
            />
            {sidebarOpen && (
              <div>
                <h1 className="text-xl font-bold tracking-tight">ROT</h1>
                <p className="text-xs text-slate-400">Admin Portal</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* User info */}
        {sidebarOpen && user && (
          <div className="mx-4 mt-6 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                {getInitials(user.email)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{user.email?.split("@")[0]}</p>
                <p className="text-xs text-slate-400">System Admin</p>
              </div>
              <button onClick={() => setProfileModalOpen(true)} className="p-1 rounded-lg hover:bg-white/10 transition">
                <Settings size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
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
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className={isActive ? "text-indigo-400" : "group-hover:text-indigo-400"}>
                  {menu.icon}
                </span>
                {sidebarOpen && <span className="text-sm font-medium">{menu.name}</span>}
                {isActive && sidebarOpen && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer / logout */}
        <div className="p-4 border-t border-white/10">
          {sidebarOpen && <div className="mb-3 text-xs text-center text-slate-500">v2.0 • System Online</div>}
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-300 py-2.5 rounded-xl font-medium transition"
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-72" : "lg:ml-20"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-6 py-3">
            <div className="hidden lg:block">
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Manage your transport ecosystem</p>
            </div>

            <div className="flex items-center gap-3 ml-auto lg:ml-0">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                {darkMode ? <Sun size={18} className="text-yellow-500" /> : <Moon size={18} className="text-gray-600 dark:text-gray-300" />}
              </button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition relative"
                >
                  <Bell size={20} className="text-gray-600 dark:text-gray-300" />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
                      <button onClick={() => setShowNotifications(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No new notifications</div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3 border-b border-gray-50 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition ${!notif.read ? "bg-blue-50 dark:bg-blue-900/20" : ""}`}
                            onClick={() => markNotificationRead(notif.id)}
                          >
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{notif.title}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{notif.message}</p>
                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* System status */}
              <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium">
                <ShieldCheck size={14} /> System Active
              </div>

              {/* Profile button */}
              <button
                onClick={() => setProfileModalOpen(true)}
                className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-md hover:shadow-lg transition"
              >
                {user?.avatar_image ? (
                  <img src={user.avatar_image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  getInitials(user?.email)
                )}
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>

      {/* Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Admin Profile</h3>
              <button onClick={() => setProfileModalOpen(false)} className="text-white hover:bg-white/20 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {avatarFile ? (
                    <img src={URL.createObjectURL(avatarFile)} alt="Preview" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md" />
                  ) : user?.avatar_image ? (
                    <img src={user.avatar_image} alt="Admin Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-indigo-500 shadow-md" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center border-4 border-indigo-500 text-3xl font-bold text-indigo-700 dark:text-indigo-300 shadow-md">
                      {getInitials(user?.email)}
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-1.5 bg-white dark:bg-gray-700 rounded-full shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600">
                    <Upload size={16} className="text-gray-600 dark:text-gray-300" />
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  </label>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Click the icon to upload a new avatar</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Mail size={18} className="text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{user?.email || "admin@rot.rw"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Phone size={18} className="text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">{user?.phone_number || "+250 788 123 456"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <Briefcase size={18} className="text-indigo-500" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
                    <p className="font-medium text-gray-800 dark:text-gray-200">Super Administrator</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={() => setProfileModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium">
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={loading || !avatarFile}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}

export default AdminLayout;