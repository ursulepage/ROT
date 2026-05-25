// src/pages/station/StationDashboard.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Ticket,
  Users,
  CheckCircle,
  DollarSign,
  Clock,
  MapPin,
  TrendingUp,
  Activity,
  QrCode,
  AlertCircle,
  RefreshCw,
  CreditCard,
  Smartphone,
} from "lucide-react";

function StationDashboard() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalTickets: 0,
    activeTickets: 0,
    usedTickets: 0,
    revenue: 0,
    todayPassengers: 0,
    peakHour: "--:--",
  });
  const [recentTickets, setRecentTickets] = useState([]);
  const [topRoutes, setTopRoutes] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const ticketsRes = await axios.get(`${API_URL}/tickets`, config);
      const tickets = ticketsRes.data || [];

      const now = new Date();
      const today = now.toISOString().split("T")[0];

      const activeTickets = tickets.filter(t => t.ticket_life_cycle === "active").length;
      const usedTickets = tickets.filter(t => t.ticket_life_cycle === "used").length;
      const totalTickets = tickets.length;
      const totalRevenue = tickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
      const todayPassengers = tickets.filter(t => {
        if (t.ticket_life_cycle !== "used") return false;
        const date = new Date(t.updated_at || t.created_at).toISOString().split("T")[0];
        return date === today;
      }).length;

      // Peak hour
      const hourCounts = {};
      tickets.forEach(ticket => {
        if (ticket.travel_time) {
          const hour = new Date(ticket.travel_time).getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      });
      let peakHour = "--:--", maxCount = 0;
      for (const [hour, count] of Object.entries(hourCounts)) {
        if (count > maxCount) { maxCount = count; peakHour = `${hour}:00`; }
      }

      setStats({ totalTickets, activeTickets, usedTickets, revenue: totalRevenue, todayPassengers, peakHour });

      // Top routes
      const routeMap = new Map();
      tickets.forEach(t => {
        const route = `${t.travel_from || "?"} → ${t.travel_to || "?"}`;
        if (routeMap.has(route)) routeMap.get(route).count++;
        else routeMap.set(route, { route, count: 1 });
      });
      const topRoutesArray = Array.from(routeMap.values()).sort((a,b) => b.count - a.count).slice(0,5);
      setTopRoutes(topRoutesArray);

      // Payment methods
      const payMap = new Map();
      tickets.forEach(t => {
        const method = t.payment_method || "Cash";
        payMap.set(method, (payMap.get(method) || 0) + 1);
      });
      const total = tickets.length || 1;
      const methods = Array.from(payMap.entries()).map(([method, count]) => ({
        method,
        count,
        percentage: Math.round((count / total) * 100),
        icon: method === "MTN Mobile Money" ? <Smartphone size={14} className="text-yellow-600" /> :
               method === "Airtel Money" ? <Smartphone size={14} className="text-red-600" /> :
               <CreditCard size={14} className="text-green-600" />,
      }));
      setPaymentMethods(methods);

      // Recent tickets
      const recent = [...tickets]
        .sort((a,b) => new Date(b.created_at || b.id) - new Date(a.created_at || a.id))
        .slice(0,10)
        .map(t => ({
          id: t.id,
          passenger: t.passenger_name,
          phone: t.phone_number,
          route: `${t.travel_from || "?"} → ${t.travel_to || "?"}`,
          time: t.travel_time ? new Date(t.travel_time).toLocaleTimeString() : "N/A",
          status: t.ticket_life_cycle === "used" ? "verified" : t.ticket_life_cycle,
        }));
      setRecentTickets(recent);

      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RWF`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RWF`;
    return `${amount.toLocaleString()} RWF`;
  };

  if (loading) return (
    <div className="flex justify-center items-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
    </div>
  );
  if (error) return (
    <div className="bg-red-50 rounded-2xl p-6 text-center">
      <AlertCircle size={48} className="mx-auto text-red-500 mb-3" />
      <p className="text-red-600">{error}</p>
      <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg">Retry</button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-gray-800">Station Dashboard</h1><p className="text-gray-500">Real‑time verification & analytics</p></div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 px-4 py-2 bg-white border rounded-xl hover:bg-gray-50">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Total Tickets</p><p className="text-2xl font-bold mt-1">{stats.totalTickets}</p><div className="flex gap-2 text-xs mt-2"><span className="text-emerald-600">✓ Used {stats.usedTickets}</span><span className="text-amber-600">⏳ Active {stats.activeTickets}</span></div></div><Ticket size={28} className="text-indigo-500" /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Verified Today</p><p className="text-2xl font-bold mt-1">{stats.todayPassengers}</p><p className="text-xs text-emerald-600 mt-2">{stats.totalTickets ? Math.round((stats.todayPassengers/stats.totalTickets)*100) : 0}% of total</p></div><Users size={28} className="text-emerald-500" /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold mt-1">{formatCurrency(stats.revenue)}</p></div><DollarSign size={28} className="text-amber-500" /></div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <div className="flex justify-between"><div><p className="text-sm text-gray-500">Peak Hour</p><p className="text-2xl font-bold mt-1">{stats.peakHour}</p><p className="text-xs text-gray-500 mt-2">Highest booking time</p></div><Clock size={28} className="text-purple-500" /></div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 flex gap-4">
          <QrCode size={28} className="text-blue-600" />
          <div><h3 className="font-semibold">Quick Verification</h3><p className="text-sm text-gray-600">Scan QR codes or enter verification codes.</p><p className="text-xs text-blue-600 mt-2">{stats.activeTickets} active tickets waiting</p></div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 flex gap-4">
          <Activity size={28} className="text-emerald-600" />
          <div><h3 className="font-semibold">System Status</h3><p className="text-sm text-gray-600">Backend online • API ready</p><p className="text-xs text-emerald-600 mt-2">Peak hour: {stats.peakHour}</p></div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50 flex justify-between"><h2 className="font-semibold">Recent Tickets</h2><span className="text-xs text-gray-500">{recentTickets.length} latest</span></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b"><tr><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Passenger</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Route</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Time</th><th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th></tr></thead>
            <tbody className="divide-y">
              {recentTickets.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><p className="font-medium">{t.passenger}</p><p className="text-xs text-gray-500">{t.phone}</p></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2"><MapPin size={14} className="text-gray-400"/>{t.route}</div></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{t.time}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${t.status === "verified" || t.status === "used" ? "bg-emerald-100 text-emerald-700" : t.status === "active" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-500"}`}>{t.status === "used" ? <CheckCircle size={12}/> : <Clock size={12}/>}{t.status === "used" ? "Verified" : t.status === "active" ? "Pending" : t.status}</span></td>
                </tr>
              ))}
              {recentTickets.length===0 && <tr><td colSpan="4" className="text-center py-8 text-gray-400">No tickets yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Analytics */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-indigo-500"/> Top Routes</h3>
          {topRoutes.length===0 ? <p className="text-gray-400 text-center">No data</p> : topRoutes.map((r,i)=>(
            <div key={i} className="mb-3"><div className="flex justify-between text-sm"><span>{r.route}</span><span>{r.count} tickets</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{width:`${(r.count/topRoutes[0].count)*100}%`}}/></div></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><CreditCard size={18} className="text-emerald-500"/> Payment Methods</h3>
          {paymentMethods.length===0 ? <p className="text-gray-400 text-center">No data</p> : paymentMethods.map((pm,i)=>(
            <div key={i} className="mb-3"><div className="flex justify-between text-sm items-center"><span className="flex items-center gap-2">{pm.icon} {pm.method}</span><span>{pm.percentage}%</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className={`h-2 rounded-full ${pm.method==="MTN Mobile Money"?"bg-yellow-500":pm.method==="Airtel Money"?"bg-red-500":"bg-green-500"}`} style={{width:`${pm.percentage}%`}}/></div></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StationDashboard;