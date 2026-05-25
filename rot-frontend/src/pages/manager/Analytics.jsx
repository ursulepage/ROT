// src/pages/manager/Analytics.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Users,
  Car,
  Ticket,
  DollarSign,
  MapPin,
  Clock,
  Award,
  RefreshCw,
  AlertCircle,
  Brain,
  Target,
  Zap,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

function Analytics() {
  const [tickets, setTickets] = useState([]);
  const [cars, setCars] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filteredTickets, setFilteredTickets] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, dateRange]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsRes, carsRes, driversRes] = await Promise.all([
        axios.get(`${API_URL}/tickets`, { headers }),
        axios.get(`${API_URL}/cars`, { headers }),
        axios.get(`${API_URL}/drivers`, { headers }),
      ]);
      setTickets(ticketsRes.data);
      setCars(carsRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError(err.response?.data?.message || "Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];
    if (dateRange.start) {
      filtered = filtered.filter((t) => new Date(t.created_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter((t) => new Date(t.created_at) <= new Date(dateRange.end));
    }
    setFilteredTickets(filtered);
  };

  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Core metrics
  const totalRevenue = filteredTickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  const totalTickets = filteredTickets.length;
  const avgTicketPrice = totalTickets ? totalRevenue / totalTickets : 0;
  const totalSeats = cars.reduce((sum, c) => sum + (Number(c.total_sits) || 30), 0);
  const occupancyRate = totalSeats ? Math.min(100, Math.round((totalTickets / totalSeats) * 100)) : 0;

  // Daily revenue for trend line
  const dailyRevenue = () => {
    const grouped = {};
    filteredTickets.forEach((t) => {
      const date = new Date(t.created_at).toISOString().split("T")[0];
      grouped[date] = (grouped[date] || 0) + (Number(t.price) || 0);
    });
    const sorted = Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]));
    return {
      labels: sorted.map((item) => item[0]),
      data: sorted.map((item) => item[1]),
    };
  };

  // Linear regression prediction (next 7 days)
  const predictNextWeek = () => {
    const rev = dailyRevenue();
    const n = rev.data.length;
    if (n < 2) return { dates: [], values: [], message: "Insufficient data for prediction" };
    // Simple linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += rev.data[i];
      sumXY += i * rev.data[i];
      sumX2 += i * i;
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    const predictions = [];
    const futureDates = [];
    for (let i = 1; i <= 7; i++) {
      const pred = slope * (n + i - 1) + intercept;
      predictions.push(Math.max(0, pred));
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + i);
      futureDates.push(nextDate.toLocaleDateString());
    }
    return { dates: futureDates, values: predictions, message: null };
  };

  const prediction = predictNextWeek();

  // Peak hour demand (based on travel_time)
  const peakHours = () => {
    const hours = Array(24).fill(0);
    filteredTickets.forEach((t) => {
      if (t.travel_time) {
        const hour = new Date(t.travel_time).getHours();
        hours[hour]++;
      }
    });
    return hours;
  };

  // Route demand forecast – which routes are growing
  const routeGrowth = () => {
    const routes = {};
    filteredTickets.forEach((t) => {
      const route = `${t.travel_from || "?"} → ${t.travel_to || "?"}`;
      if (!routes[route]) routes[route] = { count: 0, dates: [] };
      routes[route].count++;
      if (t.created_at) routes[route].dates.push(new Date(t.created_at));
    });
    // For simplicity, return top 5 routes with demand score
    return Object.entries(routes)
      .map(([route, data]) => ({ route, count: data.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  // Simple demand prediction: next month expected tickets
  const avgDailyTickets = totalTickets / Math.max(1, Object.keys(dailyRevenue().labels).length);
  const predictedNextMonthTickets = Math.round(avgDailyTickets * 30 * 1.1); // 10% growth
  const predictedNextMonthRevenue = predictedNextMonthTickets * avgTicketPrice;

  // Seasonal insight (weekday vs weekend)
  const weekendVsWeekday = () => {
    let weekday = 0, weekend = 0;
    filteredTickets.forEach((t) => {
      if (t.created_at) {
        const day = new Date(t.created_at).getDay();
        if (day === 0 || day === 6) weekend++;
        else weekday++;
      }
    });
    const total = weekday + weekend;
    return { weekday: total ? Math.round((weekday / total) * 100) : 0, weekend: total ? Math.round((weekend / total) * 100) : 0 };
  };
  const season = weekendVsWeekday();

  // Recommendations based on data
  const recommendations = [];
  if (occupancyRate > 85) recommendations.push("Increase fleet size on popular routes – high demand detected.");
  if (occupancyRate < 40) recommendations.push("Run promotions to boost ticket sales during low occupancy periods.");
  if (season.weekend > 60) recommendations.push("Weekend demand is strong – consider adding extra buses on Saturdays and Sundays.");
  if (peakHours().slice(6, 10).reduce((a, b) => a + b, 0) > totalTickets * 0.4) recommendations.push("Morning peak (6-10 AM) is very busy – add more departures.");
  if (peakHours().slice(16, 20).reduce((a, b) => a + b, 0) > totalTickets * 0.4) recommendations.push("Evening peak (4-8 PM) is crowded – increase frequency.");
  if (recommendations.length === 0) recommendations.push("Current operations are balanced. Monitor trends weekly.");

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RWF`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RWF`;
    return `${amount.toLocaleString()} RWF`;
  };

  const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "top" } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };
  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "right" } } };

  // Prediction chart data
  const predictionChartData = {
    labels: prediction.dates,
    datasets: [
      {
        label: "Predicted Revenue (RWF)",
        data: prediction.values,
        borderColor: "#f97316",
        backgroundColor: "rgba(249, 115, 22, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Payment methods data
  const paymentMethodsData = () => {
    const methods = {};
    filteredTickets.forEach((t) => {
      const method = t.payment_method || "Cash";
      methods[method] = (methods[method] || 0) + 1;
    });
    return {
      labels: Object.keys(methods),
      datasets: [{ data: Object.values(methods), backgroundColor: ["#f59e0b", "#ef4444", "#10b981", "#3b82f6"], borderWidth: 0 }],
    };
  };

  // Peak hours bar data
  const peakHoursData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [{ label: "Bookings", data: peakHours(), backgroundColor: "#f59e0b", borderRadius: 6 }],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
        <p className="text-red-600">{error}</p>
        <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Key business insights & AI predictions</p>
        </div>
        <button onClick={handleRefresh} disabled={refreshing} className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-50">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]"><label className="block text-sm font-medium text-gray-700 mb-1">From Date</label><input type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex-1 min-w-[180px]"><label className="block text-sm font-medium text-gray-700 mb-1">To Date</label><input type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} className="w-full px-3 py-2 border rounded-lg" /></div>
          <div className="flex gap-2"><button onClick={applyFilters} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2"><Filter size={16} /> Apply</button>{(dateRange.start || dateRange.end) && <button onClick={clearFilters} className="px-4 py-2 border rounded-lg">Clear</button>}</div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Total Revenue</p><p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p></div><DollarSign size={28} className="text-indigo-500" /></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Tickets Sold</p><p className="text-2xl font-bold mt-1">{totalTickets}</p></div><Ticket size={28} className="text-emerald-500" /></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Occupancy Rate</p><p className="text-2xl font-bold mt-1">{occupancyRate}%</p></div><Users size={28} className="text-amber-500" /></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><div className="flex justify-between items-start"><div><p className="text-sm text-gray-500">Avg. Ticket Price</p><p className="text-2xl font-bold mt-1">{formatCurrency(avgTicketPrice)}</p></div><TrendingUp size={28} className="text-purple-500" /></div></div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><LineChart size={20} className="text-indigo-500" /> Revenue Trend</h3><div className="h-72"><Line data={{ labels: dailyRevenue().labels, datasets: [{ label: "Revenue (RWF)", data: dailyRevenue().data, borderColor: "#4f46e5", backgroundColor: "rgba(79,70,229,0.1)", fill: true, tension: 0.4 }] }} options={lineOptions} /></div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><PieChart size={20} className="text-emerald-500" /> Payment Methods</h3><div className="h-72"><Pie data={paymentMethodsData()} options={pieOptions} /></div></div>
      </div>

      {/* Prediction Section (NEW) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Brain size={20} className="text-purple-600" /> AI Revenue Forecast</h3>
        {prediction.message ? (
          <p className="text-gray-500">{prediction.message}</p>
        ) : (
          <div className="h-72"><Line data={predictionChartData} options={lineOptions} /></div>
        )}
        <div className="mt-4 grid grid-cols-2 gap-4 text-center">
          <div className="bg-indigo-50 rounded-xl p-3"><p className="text-sm text-gray-600">Predicted Next Month Tickets</p><p className="text-2xl font-bold text-indigo-700">{predictedNextMonthTickets}</p></div>
          <div className="bg-emerald-50 rounded-xl p-3"><p className="text-sm text-gray-600">Predicted Next Month Revenue</p><p className="text-2xl font-bold text-emerald-700">{formatCurrency(predictedNextMonthRevenue)}</p></div>
        </div>
      </div>

      {/* Route Demand & Peak Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><MapPin size={20} className="text-emerald-500" /> Top Routes by Demand</h3><div className="space-y-3">{routeGrowth().map((r, idx) => (<div key={idx}><div className="flex justify-between text-sm mb-1"><span>{r.route}</span><span>{r.count} tickets</span></div><div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${(r.count / routeGrowth()[0]?.count) * 100}%` }} /></div></div>))}</div></div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5"><h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Clock size={20} className="text-amber-500" /> Peak Hours (Bookings)</h3><div className="h-72"><Bar data={peakHoursData} options={barOptions} /></div></div>
      </div>

      {/* Seasonal Insight */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2"><Calendar size={20} className="text-sky-500" /> Seasonal Demand</h3>
        <div className="flex gap-4 items-center">
          <div className="flex-1"><div className="flex justify-between text-sm mb-1"><span>Weekday</span><span>{season.weekday}%</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-blue-500 h-3 rounded-full" style={{ width: `${season.weekday}%` }} /></div></div>
          <div className="flex-1"><div className="flex justify-between text-sm mb-1"><span>Weekend</span><span>{season.weekend}%</span></div><div className="w-full bg-gray-200 rounded-full h-3"><div className="bg-orange-500 h-3 rounded-full" style={{ width: `${season.weekend}%` }} /></div></div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 mb-3"><Target size={24} /><h3 className="text-xl font-semibold">AI Recommendations</h3></div>
        <ul className="list-disc list-inside space-y-2 text-sm">
          {recommendations.map((rec, i) => (<li key={i}>{rec}</li>))}
        </ul>
        <div className="mt-4 pt-4 border-t border-white/20 text-xs opacity-80 flex items-center gap-2"><Zap size={14} /> Based on real-time data analysis</div>
      </div>
    </div>
  );
}

export default Analytics;