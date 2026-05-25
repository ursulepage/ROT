// src/pages/admin/AdminDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Building2,
  Bus,
  Ticket,
  Wallet,
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  User,
} from "lucide-react";

function AdminDashboard() {
  const [stats, setStats] = useState({
    companies: 0,
    cars: 0,
    tickets: 0,
    income: 0,
    activeTickets: 0,
    usedTickets: 0,
    expiredTickets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  // Load user data and theme preference
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));

    // Sync dark mode with localStorage (used by AdminLayout)
    const savedTheme = localStorage.getItem("theme");
    const isDark = savedTheme === "dark";
    setIsDarkMode(isDark);
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");

    // Listen for theme changes from layout (custom event)
    const handleThemeChange = (e) => {
      setIsDarkMode(e.detail.isDark);
    };
    window.addEventListener("themeChange", handleThemeChange);
    return () => window.removeEventListener("themeChange", handleThemeChange);
  }, []);

  const fetchDashboard = async () => {
    setError(null);
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const [companiesRes, carsRes, ticketsRes, dashboardRes] = await Promise.all([
        axios.get(`${API_URL}/company`, { headers }),
        axios.get(`${API_URL}/cars`, { headers }),
        axios.get(`${API_URL}/tickets`, { headers }),
        axios.get(`${API_URL}/dashboard`, { headers }),
      ]);

      const tickets = ticketsRes.data;
      const active = tickets.filter(t => t.ticket_life_cycle === "active").length;
      const used = tickets.filter(t => t.ticket_life_cycle === "used").length;
      const expired = tickets.filter(t => t.ticket_life_cycle === "expired").length;

      setStats({
        companies: companiesRes.data.length,
        cars: carsRes.data.length,
        tickets: tickets.length,
        income: dashboardRes.data.total_income || 0,
        activeTickets: active,
        usedTickets: used,
        expiredTickets: expired,
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard data. Please check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
  };

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RWF`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RWF`;
    return `${amount} RWF`;
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1 mt-2 text-xs ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                <TrendingUp size={12} />
                <span>{trend}% from last month</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 dark:bg-opacity-20`}>
            <div className={`${color.replace("bg-", "text-")}`}>{icon}</div>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-full p-4 mb-4">
          <XCircle size={48} className="text-red-500" />
        </div>
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with user avatar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.email?.split("@")[0] || "Admin"}! Here's your system overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Real-time notification badge (reads from layout's localStorage) */}
          <div className="relative">
            <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <Activity size={18} className="text-gray-600 dark:text-gray-300" />
            </div>
            {JSON.parse(localStorage.getItem("notifications") || "[]").filter(n => !n.read).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center">
                {JSON.parse(localStorage.getItem("notifications") || "[]").filter(n => !n.read).length}
              </span>
            )}
          </div>
          {/* Avatar preview (from user data) */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
            {user?.avatar_image ? (
              <img src={user.avatar_image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
            ) : (
              user?.email?.charAt(0).toUpperCase() || "A"
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Total Companies" value={stats.companies} icon={<Building2 size={24} />} color="bg-blue-500" trend={5} />
        <StatCard title="Registered Cars" value={stats.cars} icon={<Bus size={24} />} color="bg-green-500" trend={8} />
        <StatCard title="Tickets Sold" value={stats.tickets} icon={<Ticket size={24} />} color="bg-orange-500" trend={12} />
        <StatCard title="Total Revenue" value={formatCurrency(stats.income)} icon={<Wallet size={24} />} color="bg-purple-500" trend={18} />
      </div>

      {/* Ticket Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-80">Active Tickets</p><p className="text-3xl font-bold mt-1">{stats.activeTickets}</p></div>
            <CheckCircle size={28} className="opacity-80" />
          </div>
          <div className="mt-3 text-xs opacity-75">Currently valid for travel</div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-80">Used Tickets</p><p className="text-3xl font-bold mt-1">{stats.usedTickets}</p></div>
            <Activity size={28} className="opacity-80" />
          </div>
          <div className="mt-3 text-xs opacity-75">Already verified</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <div><p className="text-sm opacity-80">Expired Tickets</p><p className="text-3xl font-bold mt-1">{stats.expiredTickets}</p></div>
            <Clock size={28} className="opacity-80" />
          </div>
          <div className="mt-3 text-xs opacity-75">Past travel date</div>
        </div>
      </div>

      {/* System Health & Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Activity size={20} className="text-indigo-600" /> System Health</h2>
          </div>
          <div className="p-6 space-y-4">
            {[
              { label: "Backend Server", status: "Operational", color: "green" },
              { label: "Database Connection", status: "Connected", color: "green" },
              { label: "Authentication Service", status: "Active", color: "green" },
              { label: "QR Code Engine", status: "Ready", color: "blue" },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-700 dark:text-${item.color}-300`}>
                  <div className={`w-1.5 h-1.5 rounded-full bg-${item.color}-600`}></div>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white flex items-center gap-2"><Building2 size={20} className="text-indigo-600" /> ROT Platform Features</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Online ticket booking", "QR code verification", "Real-time seat management",
                "Multi-company support", "Mobile Money demo payment", "JWT Authentication",
                "Driver location tracking", "Offline ticket storage",
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <CheckCircle size={14} className="text-green-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity placeholder (could be extended with real API) */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent System Activity</h2>
        </div>
        <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          <Activity size={32} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
          Real-time activity feed coming soon.
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;