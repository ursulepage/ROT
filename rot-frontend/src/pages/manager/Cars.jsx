// src/pages/manager/Cars.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { Plus, Edit, Trash2, Car, Search, X } from "lucide-react";

function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    car_plate: "",
    car_name: "",
    total_sits: "",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/cars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCars(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (editingCar) {
        await axios.put(`${API_URL}/cars/${editingCar.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/cars`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      fetchCars();
      closeModal();
    } catch (error) {
      console.error("Error saving car:", error);
      alert("Error saving car. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/cars/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchCars();
      } catch (error) {
        console.error("Error deleting car:", error);
        alert("Error deleting car. Please try again.");
      }
    }
  };

  const openModal = (car = null) => {
    if (car) {
      setEditingCar(car);
      setFormData({
        car_plate: car.car_plate,
        car_name: car.car_name,
        total_sits: car.total_sits,
      });
    } else {
      setEditingCar(null);
      setFormData({
        car_plate: "",
        car_name: "",
        total_sits: "",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCar(null);
  };

  const filteredCars = cars.filter(
    (car) =>
      car.car_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.car_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cars Management</h2>
          <p className="text-gray-500">Manage your company's fleet</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 bg-blue-900 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition"
        >
          <Plus size={18} />
          Add Car
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by plate number or car name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-900"
          />
        </div>
      </div>

      {/* Cars Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Car Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Plate</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Seats</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCars.map((car) => (
                <tr key={car.id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{car.car_name}</div>
                    <div className="text-xs text-gray-500">{car.car_plate}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-700">{car.car_plate}</td>
                  <td className="px-4 py-4 text-sm text-gray-700">{car.total_sits}</td>
                  <td className="px-4 py-4 text-right text-sm">
                    <button
                      onClick={() => openModal(car)}
                      className="mr-2 inline-flex items-center justify-center rounded-lg p-2 text-blue-600 hover:bg-blue-50 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(car.id)}
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
                {editingCar ? "Edit Car" : "Add New Car"}
              </h3>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Plate Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.car_plate}
                  onChange={(e) => setFormData({ ...formData, car_plate: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., RAB 123A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Car Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.car_name}
                  onChange={(e) => setFormData({ ...formData, car_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., Toyota Coaster"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Seats *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.total_sits}
                  onChange={(e) => setFormData({ ...formData, total_sits: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                  placeholder="e.g., 30"
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
                  {editingCar ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cars;