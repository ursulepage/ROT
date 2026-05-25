// src/pages/admin/Reports.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  TrendingUp,
  Ticket,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Calendar,
  Building2,
  PieChart,
  FileText,
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
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

function Reports() {
  const [tickets, setTickets] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedCompany, setSelectedCompany] = useState("all");
  const [filteredTickets, setFilteredTickets] = useState([]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tickets, dateRange, selectedCompany]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [ticketsRes, companiesRes] = await Promise.all([
        axios.get(`${API_URL}/tickets`, { headers }),
        axios.get(`${API_URL}/company`, { headers }),
      ]);
      setTickets(ticketsRes.data);
      setCompanies(companiesRes.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.response?.data?.message || "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tickets];
    if (dateRange.start) {
      filtered = filtered.filter(t => new Date(t.created_at) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(t => new Date(t.created_at) <= new Date(dateRange.end));
    }
    if (selectedCompany !== "all") {
      filtered = filtered.filter(t => t.company_name === selectedCompany);
    }
    setFilteredTickets(filtered);
  };

  const clearFilters = () => {
    setDateRange({ start: "", end: "" });
    setSelectedCompany("all");
  };

  const getTotalRevenue = () => {
    return filteredTickets.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  };

  const getAverageTicketPrice = () => {
    if (filteredTickets.length === 0) return 0;
    return getTotalRevenue() / filteredTickets.length;
  };

  const getRevenueByDate = () => {
    const grouped = {};
    filteredTickets.forEach(t => {
      const date = new Date(t.created_at).toLocaleDateString();
      grouped[date] = (grouped[date] || 0) + (Number(t.price) || 0);
    });
    const sorted = Object.entries(grouped).sort((a, b) => new Date(a[0]) - new Date(b[0]));
    return {
      labels: sorted.map(item => item[0]),
      datasets: [{
        label: "Revenue (RWF)",
        data: sorted.map(item => item[1]),
        backgroundColor: "rgba(99, 102, 241, 0.7)",
        borderRadius: 8,
      }],
    };
  };

  const getPaymentDistribution = () => {
    const methods = {};
    filteredTickets.forEach(t => {
      const method = t.payment_method || "Cash";
      methods[method] = (methods[method] || 0) + 1;
    });
    return {
      labels: Object.keys(methods),
      datasets: [{
        data: Object.values(methods),
        backgroundColor: ["#f59e0b", "#ef4444", "#10b981", "#3b82f6"],
        borderWidth: 0,
      }],
    };
  };

  const getTopRoutes = () => {
    const routes = {};
    filteredTickets.forEach(t => {
      const route = `${t.travel_from || "?"} → ${t.travel_to || "?"}`;
      routes[route] = (routes[route] || 0) + 1;
    });
    return Object.entries(routes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ["ID", "Passenger", "Phone", "Route", "Amount (RWF)", "Payment Method", "Status", "Date"];
    const rows = filteredTickets.map(t => [
      t.id,
      t.passenger_name,
      t.phone_number,
      `${t.travel_from || ""} → ${t.travel_to || ""}`,
      t.price,
      t.payment_method,
      t.payment_status,
      new Date(t.created_at).toLocaleString(),
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rot_report_${new Date().toISOString().slice(0, 19)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", labels: { color: document.documentElement.classList.contains("dark") ? "#e5e7eb" : "#1f2937" } },
    },
  };

  const pieOptions = { ...chartOptions, plugins: { legend: { position: "right" } } };

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RWF`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RWF`;
    return `${amount.toLocaleString()} RWF`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Comprehensive business insights</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            disabled={filteredTickets.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-semibold shadow-md transition disabled:opacity-50"
          >
            <Download size={18} /> Export CSV
          </button>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            <RefreshCw size={16} className="text-gray-500" /> Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
            />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
            >
              <option value="all">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <Filter size={16} /> Apply
            </button>
            {(dateRange.start || dateRange.end || selectedCompany !== "all") && (
              <button onClick={clearFilters} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p><p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(getTotalRevenue())}</p></div>
            <DollarSign size={28} className="text-indigo-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Tickets Sold</p><p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{filteredTickets.length}</p></div>
            <Ticket size={28} className="text-emerald-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Avg. Ticket Price</p><p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(getAverageTicketPrice())}</p></div>
            <TrendingUp size={28} className="text-amber-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Companies</p><p className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{companies.length}</p></div>
            <Building2 size={28} className="text-purple-500" />
          </div>
        </div>
      </div>

      {/* Charts */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center"><AlertCircle size={40} className="mx-auto text-red-500 mb-3" /><p className="text-red-600 dark:text-red-400">{error}</p><button onClick={fetchData} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button></div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><BarChart3 size={20} className="text-indigo-500" /> Revenue Over Time</h3>
              <div className="h-80"><Bar data={getRevenueByDate()} options={chartOptions} /></div>
              {filteredTickets.length === 0 && <div className="text-center text-gray-500 py-8">No data for selected filters</div>}
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><PieChart size={20} className="text-emerald-500" /> Payment Methods</h3>
              <div className="h-80"><Pie data={getPaymentDistribution()} options={pieOptions} /></div>
            </div>
          </div>

          {/* Top Routes */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center"><h3 className="text-lg font-semibold text-gray-800 dark:text-white">Top 5 Routes by Tickets</h3><FileText size={18} className="text-gray-400" /></div>
            <div className="overflow-x-auto"><table className="w-full"><thead className="bg-gray-50 dark:bg-gray-900/50"><tr><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Route</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Tickets Sold</th><th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Revenue (RWF)</th></tr></thead><tbody>{getTopRoutes().map(([route, count]) => { const revenue = filteredTickets.filter(t => `${t.travel_from || "?"} → ${t.travel_to || "?"}` === route).reduce((sum, t) => sum + (Number(t.price) || 0), 0); return (<tr key={route} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"><td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{route}</td><td className="px-6 py-4 text-gray-600 dark:text-gray-300">{count}</td><td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{revenue.toLocaleString()} RWF</td></tr>);})}{getTopRoutes().length === 0 && <tr><td colSpan="3" className="px-6 py-8 text-center text-gray-500">No data available</td></tr>}</tbody></table></div></div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5"><h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Recent Transactions</h3><div className="space-y-2 max-h-64 overflow-y-auto">{filteredTickets.slice(0, 10).map(t => (<div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl"><div><p className="font-medium text-gray-800 dark:text-gray-200">{t.passenger_name}</p><p className="text-xs text-gray-500">{new Date(t.created_at).toLocaleString()}</p></div><div className="text-right"><p className="font-semibold text-indigo-600 dark:text-indigo-400">{Number(t.price).toLocaleString()} RWF</p><p className="text-xs text-gray-500">{t.payment_method}</p></div></div>))}{filteredTickets.length === 0 && <p className="text-center text-gray-500 py-4">No recent transactions</p>}</div></div>
        </>
      )}
    </div>
  );
}

export default Reports;