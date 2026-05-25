// src/pages/manager/LaunchCars.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Navigation, 
  Search, 
  X, 
  Clock, 
  MapPin, 
  Users, 
  Car, 
  Calendar,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Eye,
  UserCheck,
  Truck
} from "lucide-react";

function LaunchCars() {
  const [launchCars, setLaunchCars] = useState([]);
  const [cars, setCars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [editingLaunch, setEditingLaunch] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    assigned: 0,
    available: 0
  });
  
  const [formData, setFormData] = useState({
    car_plate: "",
    location_id: "",
    travel_time: "",
    available_sits: "",
    status: "active",
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      const [launchRes, carsRes, locationsRes, driversRes] = await Promise.all([
        axios.get(`${API_URL}/launch-cars`, config),
        axios.get(`${API_URL}/cars`, config),
        axios.get(`${API_URL}/locations`, config),
        axios.get(`${API_URL}/drivers`, config),
      ]);
      
      // Enhance launch cars with driver assignment info
      const enhancedLaunches = await Promise.all(launchRes.data.map(async (launch) => {
        // Check if this car is assigned to a driver
        try {
          const assignmentRes = await axios.get(`${API_URL}/car-assignment/${launch.car_plate}`, config);
          return {
            ...launch,
            assigned_driver: assignmentRes.data?.driver_name || null,
            assigned_driver_id: assignmentRes.data?.driver_id || null
          };
        } catch {
          return { ...launch, assigned_driver: null, assigned_driver_id: null };
        }
      }));
      
      setLaunchCars(enhancedLaunches);
      setCars(carsRes.data);
      setLocations(locationsRes.data);
      setDrivers(driversRes.data);
      
      // Calculate stats
      const total = enhancedLaunches.length;
      const active = enhancedLaunches.filter(l => l.status === "active").length;
      const inactive = enhancedLaunches.filter(l => l.status === "inactive").length;
      const assigned = enhancedLaunches.filter(l => l.assigned_driver).length;
      const available = enhancedLaunches.filter(l => l.status === "active" && !l.assigned_driver).length;
      
      setStats({ total, active, inactive, assigned, available });
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      let response;
      
      if (editingLaunch) {
        response = await axios.put(`${API_URL}/launch-cars/${editingLaunch.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        response = await axios.post(`${API_URL}/launch-cars`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      
      if (response.data.success) {
        alert(editingLaunch ? "Launch car updated successfully!" : "Car launched successfully! It is now available for driver assignment.");
        fetchData();
        closeModal();
      }
    } catch (error) {
      console.error("Error saving launch car:", error);
      alert(error.response?.data?.message || "Error saving launch car. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this launch car? This will remove it from driver availability.")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${API_URL}/launch-cars/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Launch car deleted successfully");
        fetchData();
      } catch (error) {
        console.error("Error deleting launch car:", error);
        alert("Error deleting launch car. Please try again.");
      }
    }
  };

  const openModal = (launch = null) => {
    if (launch) {
      setEditingLaunch(launch);
      setFormData({
        car_plate: launch.car_plate,
        location_id: launch.location_id,
        travel_time: launch.travel_time,
        available_sits: launch.available_sits,
        status: launch.status,
      });
    } else {
      setEditingLaunch(null);
      setFormData({
        car_plate: "",
        location_id: "",
        travel_time: "",
        available_sits: "",
        status: "active",
      });
    }
    setShowModal(true);
  };

  const openDetailsModal = (launch) => {
    setSelectedLaunch(launch);
    setShowDetailsModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowDetailsModal(false);
    setEditingLaunch(null);
    setSelectedLaunch(null);
  };

  const getCarName = (carPlate) => {
    const car = cars.find(c => c.car_plate === carPlate);
    return car ? car.car_name : carPlate;
  };

  const getCarSeats = (carPlate) => {
    const car = cars.find(c => c.car_plate === carPlate);
    return car ? car.total_sits : 0;
  };

  const getLocationRoute = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    return location ? `${location.travel_from} → ${location.travel_to}` : "Unknown";
  };

  const getLocationPrice = (locationId) => {
    const location = locations.find(l => l.id === locationId);
    return location ? location.price_amount : 0;
  };

  const isTripExpired = (travelTime) => {
    return new Date(travelTime) < new Date();
  };

  const getStatusBadge = (status, assignedDriver, travelTime) => {
    const expired = isTripExpired(travelTime);
    
    if (expired) {
      return { color: "bg-gray-100 text-gray-600", text: "Expired", icon: <Clock size={12} /> };
    }
    if (assignedDriver) {
      return { color: "bg-purple-100 text-purple-700", text: "Assigned", icon: <UserCheck size={12} /> };
    }
    if (status === "active") {
      return { color: "bg-green-100 text-green-700", text: "Available", icon: <CheckCircle size={12} /> };
    }
    return { color: "bg-red-100 text-red-700", text: "Inactive", icon: <AlertCircle size={12} /> };
  };

  const filteredLaunchCars = launchCars.filter((launch) => {
    const matchesSearch = 
      launch.car_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCarName(launch.car_plate).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationRoute(launch.location_id).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || 
      (filterStatus === "available" && launch.status === "active" && !launch.assigned_driver && !isTripExpired(launch.travel_time)) ||
      (filterStatus === "assigned" && launch.assigned_driver) ||
      (filterStatus === "expired" && isTripExpired(launch.travel_time)) ||
      (filterStatus === launch.status && !launch.assigned_driver && !isTripExpired(launch.travel_time));
    
    return matchesSearch && matchesFilter;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Launch Cars Management</h2>
          <p className="text-gray-500">Schedule cars for routes and manage driver assignments</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition"
          >
            <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition shadow-sm"
          >
            <Plus size={18} />
            Launch Car
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Total Launches</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <Truck size={18} className="text-gray-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={18} className="text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Assigned</p>
              <p className="text-2xl font-bold text-purple-600">{stats.assigned}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <UserCheck size={18} className="text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Active</p>
              <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Navigation size={18} className="text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase">Inactive</p>
              <p className="text-2xl font-bold text-gray-400">{stats.inactive}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <AlertCircle size={18} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by car plate, car name, or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: "all", label: "All", icon: null },
              { id: "available", label: "Available", icon: <CheckCircle size={14} /> },
              { id: "assigned", label: "Assigned", icon: <UserCheck size={14} /> },
              { id: "active", label: "Active", icon: <Navigation size={14} /> },
              { id: "expired", label: "Expired", icon: <Clock size={14} /> },
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setFilterStatus(filter.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                  filterStatus === filter.id
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Launch Cars Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Car</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Route</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Departure</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Seats</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Price</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Driver</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredLaunchCars.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-12 text-center text-gray-400">
                    <Truck size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>No launch cars found</p>
                    <p className="text-sm mt-1">Click "Launch Car" to schedule a new bus</p>
                  </td>
                </tr>
              ) : (
                filteredLaunchCars.map((launch) => {
                  const expired = isTripExpired(launch.travel_time);
                  const statusInfo = getStatusBadge(launch.status, launch.assigned_driver, launch.travel_time);
                  
                  return (
                    <tr key={launch.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <Car size={16} className="text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{getCarName(launch.car_plate)}</div>
                            <div className="text-xs text-gray-500">{launch.car_plate}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <MapPin size={14} className="text-gray-400" />
                          {getLocationRoute(launch.location_id)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-sm text-gray-700">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(launch.travel_time).toLocaleString()}
                        </div>
                        {expired && (
                          <span className="text-xs text-red-500 mt-1 block">Expired</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Users size={14} className="text-gray-400" />
                          {launch.available_sits} / {getCarSeats(launch.car_plate)}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-semibold text-indigo-600">
                        {getLocationPrice(launch.location_id).toLocaleString()} RWF
                      </td>
                      <td className="px-4 py-4">
                        {launch.assigned_driver ? (
                          <div className="flex items-center gap-1 text-sm text-purple-700">
                            <UserCheck size={14} />
                            {launch.assigned_driver}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Not assigned</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => openDetailsModal(launch)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {!expired && (
                            <button
                              onClick={() => openModal(launch)}
                              className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(launch.id)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  {editingLaunch ? "Edit Schedule" : "Launch New Car"}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingLaunch ? "Update car schedule" : "Schedule a car for a route"}
                </p>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-gray-100 rounded-lg transition">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Car *
                </label>
                <select
                  required
                  value={formData.car_plate}
                  onChange={(e) => setFormData({ ...formData, car_plate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a car</option>
                  {cars.map((car) => (
                    <option key={car.id} value={car.car_plate}>
                      {car.car_name} ({car.car_plate}) - {car.total_sits} seats
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Route *
                </label>
                <select
                  required
                  value={formData.location_id}
                  onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a route</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.travel_from} → {location.travel_to} ({location.price_amount?.toLocaleString()} RWF)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.travel_time}
                  onChange={(e) => setFormData({ ...formData, travel_time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Seats *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max={getCarSeats(formData.car_plate) || 60}
                  value={formData.available_sits}
                  onChange={(e) => setFormData({ ...formData, available_sits: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g., 30"
                />
                {formData.car_plate && (
                  <p className="text-xs text-gray-400 mt-1">
                    Max seats: {getCarSeats(formData.car_plate)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active (Available for drivers)</option>
                  <option value="inactive">Inactive (Not available)</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  {editingLaunch ? "Update Schedule" : "Launch Car"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedLaunch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 sticky top-0">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-white">Launch Details</h3>
                  <p className="text-indigo-100 text-xs">Car schedule information</p>
                </div>
                <button onClick={closeModal} className="p-1 hover:bg-white/10 rounded-lg transition">
                  <X size={20} className="text-white" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Car size={24} className="text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{getCarName(selectedLaunch.car_plate)}</h4>
                  <p className="text-sm text-gray-500">{selectedLaunch.car_plate}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Route</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <MapPin size={14} />
                    {getLocationRoute(selectedLaunch.location_id)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Departure</span>
                  <span className="font-medium text-gray-800 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(selectedLaunch.travel_time).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Seats</span>
                  <span className="font-medium text-gray-800">{selectedLaunch.available_sits} / {getCarSeats(selectedLaunch.car_plate)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Price</span>
                  <span className="font-bold text-indigo-600">{getLocationPrice(selectedLaunch.location_id).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Assigned Driver</span>
                  <span className="font-medium text-gray-800">
                    {selectedLaunch.assigned_driver || "Not assigned"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedLaunch.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {selectedLaunch.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaunchCars;