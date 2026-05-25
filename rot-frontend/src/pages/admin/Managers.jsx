// src/pages/admin/Managers.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Users,
  UserPlus,
  Trash2,
  Pencil,
  X,
  Search,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Filter,
  Mail,
  Phone,
  Building2,
  Globe,
  Image,
} from "lucide-react";

function Managers() {
  const [companies, setCompanies] = useState([]);
  const [managers, setManagers] = useState([]);
  const [filteredManagers, setFilteredManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [form, setForm] = useState({
    email: "",
    password: "",
    company_id: "",
    phone_number: "",
    link_of_company_web: "",
    avatar_image: null,
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchCompanies();
    fetchManagers();
  }, []);

  // Filter managers
  useEffect(() => {
    let filtered = [...managers];
    if (searchTerm) {
      filtered = filtered.filter(m =>
        m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (companyFilter !== "all") {
      filtered = filtered.filter(m => m.company_id?.toString() === companyFilter);
    }
    setFilteredManagers(filtered);
  }, [searchTerm, companyFilter, managers]);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get(`${API_URL}/company`);
      setCompanies(res.data);
    } catch (err) {
      console.error("Fetch companies error:", err);
    }
  };

  const fetchManagers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_URL}/managers`, { headers });
      setManagers(res.data);
      setFilteredManagers(res.data);
    } catch (err) {
      console.error("Fetch managers error:", err);
      setError(err.response?.data?.message || "Failed to load managers");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar_image: file });
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (form[key] !== null && form[key] !== undefined) {
          formData.append(key, form[key]);
        }
      });
      if (editingId) {
        await axios.put(`${API_URL}/manager/${editingId}`, formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_URL}/manager`, formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
        });
      }
      await fetchManagers();
      closeModal();
    } catch (err) {
      console.error("Save error:", err);
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this manager? This action cannot be undone.")) return;
    try {
      await axios.delete(`${API_URL}/manager/${id}`, { headers });
      await fetchManagers();
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  const openEdit = (manager) => {
    setEditingId(manager.id);
    setForm({
      email: manager.email,
      password: "",
      company_id: manager.company_id?.toString() || "",
      phone_number: manager.phone_number || "",
      link_of_company_web: manager.link_of_company_web || "",
      avatar_image: null,
    });
    setAvatarPreview(manager.avatar_image ? `${API_URL}/uploads/${manager.avatar_image}` : null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm({
      email: "",
      password: "",
      company_id: "",
      phone_number: "",
      link_of_company_web: "",
      avatar_image: null,
    });
    setAvatarPreview(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setCompanyFilter("all");
  };

  const getAvatarUrl = (avatar) => {
    if (!avatar) return null;
    return avatar.startsWith("http") ? avatar : `${API_URL}/uploads/${avatar}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Managers Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage company managers and their access</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition"
        >
          <UserPlus size={18} />
          Add Manager
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Search by email, phone or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-1.5">
            <Filter size={16} className="text-gray-400" />
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="bg-transparent text-sm focus:outline-none text-gray-700 dark:text-gray-300"
            >
              <option value="all">All Companies</option>
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {(searchTerm || companyFilter !== "all") && (
            <button onClick={clearFilters} className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline">
              Clear filters
            </button>
          )}
          <button
            onClick={fetchManagers}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading managers...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="mx-auto text-red-500 mb-3" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button onClick={fetchManagers} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
            Try Again
          </button>
        </div>
      ) : filteredManagers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-12 text-center">
          <Users size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No managers found</p>
          {(searchTerm || companyFilter !== "all") && (
            <button onClick={clearFilters} className="mt-3 text-emerald-600 dark:text-emerald-400 text-sm">
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avatar</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4">
                      {manager.avatar_image ? (
                        <img
                          src={getAvatarUrl(manager.avatar_image)}
                          alt="Avatar"
                          className="w-10 h-10 rounded-full object-cover bg-gray-100"
                          onError={(e) => { e.target.src = "https://placehold.co/40x40?text=U"; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                          <Users size={18} className="text-gray-500 dark:text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{manager.email}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{manager.phone_number || "—"}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{manager.company_name || "—"}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          onClick={() => openEdit(manager)}
                          className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(manager.id)}
                          className="p-2 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredManagers.length} of {managers.length} managers
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                  <Users size={20} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                    {editingId ? "Edit Manager" : "Add Manager"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {editingId ? "Update manager information" : "Create a new manager account"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
              >
                <X size={18} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Mail size={14} className="inline mr-1" /> Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password {!editingId && "*"}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder={editingId ? "Leave blank to keep unchanged" : "Enter password"}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                    required={!editingId}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Phone size={14} className="inline mr-1" /> Phone Number *
                  </label>
                  <input
                    type="text"
                    name="phone_number"
                    value={form.phone_number}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                {/* Company Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Building2 size={14} className="inline mr-1" /> Company *
                  </label>
                  <select
                    name="company_id"
                    value={form.company_id}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Globe size={14} className="inline mr-1" /> Company Website
                  </label>
                  <input
                    type="text"
                    name="link_of_company_web"
                    value={form.link_of_company_web}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-emerald-500"
                    placeholder="https://..."
                  />
                </div>

                {/* Avatar Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <Image size={14} className="inline mr-1" /> Avatar Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {avatarPreview && (
                    <div className="mt-2 flex items-center gap-2">
                      <img src={avatarPreview} alt="Preview" className="w-10 h-10 rounded-full object-cover" />
                      <span className="text-xs text-gray-500">Preview</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2.5 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2 ${
                  editingId
                    ? "bg-amber-600 hover:bg-amber-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {editingId ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  editingId ? "Update Manager" : "Create Manager"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes zoom-in {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        .animate-in {
          animation: fade-in 0.2s ease-out, zoom-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Managers;