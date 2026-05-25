// src/pages/manager/ManagerDashboard.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Car,
  Users,
  MapPin,
  Ticket,
  DollarSign,
  Navigation,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  AlertCircle,
  Calendar,
  Clock,
  CreditCard,
  Smartphone,
} from "lucide-react";

function ManagerDashboard() {
  const [stats, setStats] = useState({
    cars: 0,
    drivers: 0,
    stations: 0,
    tickets: 0,
    income: 0,
    launchCars: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [ticketStatus, setTicketStatus] = useState({ used: 0, pending: 0, cancelled: 0 });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [companyInfo, setCompanyInfo] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch all required data in parallel
      const [carsRes, driversRes, stationsRes, ticketsRes, launchCarsRes] = await Promise.all([
        axios.get(`${API_URL}/cars`, config),
        axios.get(`${API_URL}/drivers`, config),
        axios.get(`${API_URL}/stations`, config),
        axios.get(`${API_URL}/tickets`, config),
        axios.get(`${API_URL}/launch-cars`, config),
      ]);

      const tickets = ticketsRes.data;
      const totalIncome = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
      const usedTickets = tickets.filter(t => t.ticket_life_cycle === "used").length;
      const pendingTickets = tickets.filter(t => t.ticket_life_cycle === "active").length;
      const cancelledTickets = tickets.filter(t => t.ticket_life_cycle === "cancelled").length;
      const totalTickets = tickets.length;

      // Calculate top routes from real ticket data
      const routeMap = new Map();
      tickets.forEach(ticket => {
        const route = `${ticket.travel_from || "?"} → ${ticket.travel_to || "?"}`;
        if (routeMap.has(route)) {
          routeMap.set(route, routeMap.get(route) + 1);
        } else {
          routeMap.set(route, 1);
        }
      });
      const sortedRoutes = Array.from(routeMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([route, count]) => ({ route, count }));

      // Calculate payment methods from real data
      const methodMap = new Map();
      tickets.forEach(ticket => {
        const method = ticket.payment_method || "Cash";
        methodMap.set(method, (methodMap.get(method) || 0) + 1);
      });
      const totalPayments = tickets.length || 1;
      const paymentStats = Array.from(methodMap.entries()).map(([method, count]) => ({
        method,
        count,
        percentage: Math.round((count / totalPayments) * 100),
      }));

      // Build recent activities from latest tickets and other events
      const recentTickets = [...tickets]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      const activities = recentTickets.map(ticket => ({
        id: ticket.id,
        action: "New ticket booked",
        detail: `${ticket.travel_from || "?"} → ${ticket.travel_to || "?"} by ${ticket.car_plate || "unknown"}`,
        time: ticket.created_at ? new Date(ticket.created_at).toLocaleString() : "recent",
      }));
      // Add extra sample activities if needed (can be extended)
      if (activities.length < 4) {
        activities.push(
          { id: "sample1", action: "System update", detail: "Dashboard optimized", time: "1 hour ago" },
          { id: "sample2", action: "Payment received", detail: "High volume of payments", time: "2 hours ago" }
        );
      }
      setRecentActivities(activities.slice(0, 5));

      setStats({
        cars: carsRes.data.length,
        drivers: driversRes.data?.length || 0,
        stations: stationsRes.data?.length || 0,
        tickets: totalTickets,
        income: totalIncome,
        launchCars: launchCarsRes.data?.length || 0,
      });

      setTopRoutes(sortedRoutes);
      setTicketStatus({
        used: usedTickets,
        pending: pendingTickets,
        cancelled: cancelledTickets,
      });
      setPaymentMethods(paymentStats);

      // Get company info from user data (optional)
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.company_id) {
        try {
          const companyRes = await axios.get(`${API_URL}/company/${user.company_id}`, config);
          setCompanyInfo(companyRes.data);
        } catch (err) {
          console.error("Company info fetch failed", err);
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RWF`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RWF`;
    return `${amount.toLocaleString()} RWF`;
  };

  const getMethodIcon = (method) => {
    if (method === "MTN Mobile Money") return <Smartphone size={14} className="text-yellow-600" />;
    if (method === "Airtel Money") return <Smartphone size={14} className="text-red-600" />;
    return <CreditCard size={14} className="text-green-600" />;
  };

  const StatCard = ({ title, value, icon, change, color }) => (
    <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 mt-2 text-xs ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
              {change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(change)}% this month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <div className={`${color.replace("bg-", "text-")}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="bg-red-50 rounded-full p-4 mb-4">
          <AlertCircle size={48} className="text-red-500" />
        </div>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">
            {companyInfo?.name ? `${companyInfo.name} – ` : ""}Real-time business insights
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title="Registered Cars" value={stats.cars} icon={<Car size={22} />} change={3} color="bg-blue-500" />
        <StatCard title="Drivers" value={stats.drivers} icon={<Users size={22} />} change={2} color="bg-green-500" />
        <StatCard title="Stations" value={stats.stations} icon={<MapPin size={22} />} change={1} color="bg-purple-500" />
        <StatCard title="Tickets Sold" value={stats.tickets} icon={<Ticket size={22} />} change={18} color="bg-orange-500" />
        <StatCard title="Total Income" value={formatCurrency(stats.income)} icon={<DollarSign size={22} />} change={22} color="bg-amber-500" />
        <StatCard title="Launch Cars" value={stats.launchCars} icon={<Navigation size={22} />} change={4} color="bg-pink-500" />
      </div>

      {/* Revenue Overview */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Revenue Overview</h3>
            <p className="text-sm text-gray-500">Total income from ticket sales</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.income)}</p>
            <p className="text-sm text-green-600 flex items-center justify-end gap-1">
              <TrendingUp size={14} /> +22% vs last month
            </p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "65%" }} />
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
        </div>
      </div>

      {/* Two column sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Routes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-indigo-500" /> Top Routes
          </h3>
          {topRoutes.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No route data available yet</p>
          ) : (
            <div className="space-y-3">
              {topRoutes.map((route, idx) => {
                const maxCount = topRoutes[0]?.count || 1;
                const width = (route.count / maxCount) * 100;
                return (
                  <div key={idx}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-800">{route.route}</span>
                      <span className="text-sm text-gray-500">{route.count} tickets</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Ticket Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Ticket size={18} className="text-indigo-500" /> Ticket Status
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Used</span>
                <span className="font-semibold">{ticketStatus.used} ({stats.tickets ? Math.round((ticketStatus.used / stats.tickets) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.tickets ? (ticketStatus.used / stats.tickets) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pending</span>
                <span className="font-semibold">{ticketStatus.pending} ({stats.tickets ? Math.round((ticketStatus.pending / stats.tickets) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${stats.tickets ? (ticketStatus.pending / stats.tickets) * 100 : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Cancelled</span>
                <span className="font-semibold">{ticketStatus.cancelled} ({stats.tickets ? Math.round((ticketStatus.cancelled / stats.tickets) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${stats.tickets ? (ticketStatus.cancelled / stats.tickets) * 100 : 0}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CreditCard size={18} className="text-indigo-500" /> Payment Methods
          </h3>
          {paymentMethods.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No payment data available</p>
          ) : (
            <div className="space-y-3">
              {paymentMethods.map((method, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {getMethodIcon(method.method)}
                      <span className="font-medium text-gray-800">{method.method}</span>
                    </div>
                    <span className="text-sm text-gray-500">{method.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        method.method === "MTN Mobile Money" ? "bg-yellow-500" :
                        method.method === "Airtel Money" ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={18} className="text-indigo-500" /> Recent Activities
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivities.length === 0 ? (
              <p className="text-gray-500 text-center py-6">No recent activity</p>
            ) : (
              recentActivities.map(activity => (
                <div key={activity.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  <div className="w-1.5 h-1.5 mt-2 rounded-full bg-indigo-500" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.detail}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerDashboard;