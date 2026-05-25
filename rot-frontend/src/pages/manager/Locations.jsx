// src/pages/manager/Locations.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, MapPin, Search, X, TrendingUp } from "lucide-react";

function Locations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    travel_from: "",
    travel_to: "",
    price_amount: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLocations(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingLocation) {
        await axios.put(`${API_URL}/locations/${editingLocation.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/locations`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchLocations();
      closeModal();
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error saving location. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this route?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/locations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchLocations();
      } catch (error) {
        console.error("Error deleting location:", error);
        alert("Error deleting location. Please try again.");
      }
    }
  };

  const openModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        travel_from: location.travel_from,
        travel_to: location.travel_to,
        price_amount: location.price_amount,
      });
    } else {
      setEditingLocation(null);
      setFormData({
        travel_from: "",
        travel_to: "",
        price_amount: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingLocation(null);
  };

  const filteredLocations = locations.filter(
    (location) =>
      location.travel_from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.travel_to?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Locations Management</h2>
          <p className="text-gray-500">Manage routes and pricing</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition"
        >
          <Plus size={18} />
          Add Route
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by departure or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Locations Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Route</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLocations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {location.travel_from} → {location.travel_to}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{location.price_amount?.toLocaleString()} RWF</td>
                  <td className="px-4 py-4 text-right text-sm">
                    <button
                      onClick={() => openModal(location)}
                      className="mr-2 inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(location.id)}
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
                {editingLocation ? "Edit Route" : "Add New Route"}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel From *
                </label>
                <input
                  type="text"
                  required
                  value={formData.travel_from}
                  onChange={(e) => setFormData({ ...formData, travel_from: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., Kigali"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Travel To *
                </label>
                <input
                  type="text"
                  required
                  value={formData.travel_to}
                  onChange={(e) => setFormData({ ...formData, travel_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., Huye"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price Amount (RWF) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.price_amount}
                  onChange={(e) => setFormData({ ...formData, price_amount: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., 5000"
                />
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
                  {editingLocation ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Locations;