// src/pages/manager/Drivers.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Users, Search, X, Key } from "lucide-react";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    driver_name: "",
    phone_number: "",
    password_code: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/drivers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrivers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching drivers:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingDriver) {
        await axios.put(`${API_URL}/drivers/${editingDriver.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/drivers`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchDrivers();
      closeModal();
    } catch (error) {
      console.error("Error saving driver:", error);
      alert("Error saving driver. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/drivers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchDrivers();
      } catch (error) {
        console.error("Error deleting driver:", error);
        alert("Error deleting driver. Please try again.");
      }
    }
  };

  const openModal = (driver = null) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        driver_name: driver.driver_name,
        phone_number: driver.phone_number,
        password_code: driver.password_code,
      });
    } else {
      setEditingDriver(null);
      setFormData({
        driver_name: "",
        phone_number: "",
        password_code: Math.floor(1000 + Math.random() * 9000).toString(),
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDriver(null);
  };

  const generatePassword = () => {
    const password = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData({ ...formData, password_code: password });
  };

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.phone_number?.includes(searchTerm)
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Drivers Management</h2>
          <p className="text-gray-500">Manage your company's drivers</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition"
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Drivers Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Phone</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Password</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{driver.driver_name}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{driver.phone_number}</td>
                  <td className="px-4 py-4 text-sm font-mono text-gray-700">{driver.password_code}</td>
                  <td className="px-4 py-4 text-right text-sm">
                    <button
                      onClick={() => openModal(driver)}
                      className="mr-2 inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(driver.id)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 hover:bg-red-50 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.driver_name}
                  onChange={(e) => setFormData({ ...formData, driver_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., 0788123456"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Code *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.password_code}
                    onChange={(e) => setFormData({ ...formData, password_code: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 font-mono"
                    placeholder="4-digit code"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <Key size={18} />
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition"
                >
                  {editingDriver ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Drivers;