// src/pages/admin/Payments.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Wallet,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Filter,
  TrendingUp,
  CreditCard,
  Smartphone,
  DollarSign,
} from "lucide-react";

function Payments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Filter payments
  useEffect(() => {
    let filtered = [...payments];
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone_number?.includes(searchTerm)
      );
    }
    if (methodFilter !== "all") {
      filtered = filtered.filter(p => p.payment_method === methodFilter);
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.payment_status === statusFilter);
    }
    setFilteredPayments(filtered);
  }, [searchTerm, methodFilter, statusFilter, payments]);

  const fetchPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/tickets`, { headers });
      setPayments(res.data);
      setFilteredPayments(res.data);
    } catch (err) {
      console.error("Fetch payments error:", err);
      setError(err.response?.data?.message || "Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setMethodFilter("all");
    setStatusFilter("all");
  };

  // CORRECTED: Summing prices properly
  const getTotalAmount = () => {
    const total = filteredPayments.reduce((sum, p) => sum + (Number(p.price) || 0), 0);
    return total;
  };

  const formatCurrency = (amount) => {
    if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M RWF`;
    if (amount >= 1_000) return `${(amount / 1_000).toFixed(0)}K RWF`;
    return `${amount.toLocaleString()} RWF`;
  };

  const getMethodIcon = (method) => {
    if (method === "MTN Mobile Money") return <Smartphone size={14} className="text-yellow-600 dark:text-yellow-400" />;
    if (method === "Airtel Money") return <Smartphone size={14} className="text-red-600 dark:text-red-400" />;
    return <CreditCard size={14} className="text-green-600 dark:text-green-400" />;
  };

  const getStatusBadge = (status) => {
    if (status === "paid") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <CheckCircle size={12} /> Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        <AlertCircle size={12} /> Pending
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">All transport payments and transactions</p>
        </div>
        <button
          onClick={fetchPayments}
          className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <RefreshCw size={16} className="text-gray-500" />
          Refresh
        </button>
      </div>

      {/* Total Revenue Card - FIXED */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total Revenue</p>
            <p className="text-3xl font-bold mt-1">{formatCurrency(getTotalAmount())}</p>
            <p className="text-xs opacity-75 mt-1">From {filteredPayments.length} transactions</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by passenger name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
            <Filter size={16} className="text-gray-400" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Methods</option>
              <option value="MTN Mobile Money">MTN Mobile Money</option>
              <option value="Airtel Money">Airtel Money</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
            <Filter size={16} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          {(searchTerm || methodFilter !== "all" || statusFilter !== "all") && (
            <button onClick={clearFilters} className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchPayments} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg">Retry</button>
        </div>
      ) : filteredPayments.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-100 dark:border-gray-700">
          <Wallet size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No payment records found</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Passenger</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{payment.passenger_name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{payment.phone_number}</td>
                    <td className="px-6 py-4 font-semibold text-indigo-600 dark:text-indigo-400">{Number(payment.price).toLocaleString()} RWF</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        {getMethodIcon(payment.payment_method)}
                        <span className="text-gray-600 dark:text-gray-300">{payment.payment_method || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(payment.payment_status)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>Showing {filteredPayments.length} of {payments.length} transactions</span>
            <span className="font-medium">Total: {formatCurrency(getTotalAmount())}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;