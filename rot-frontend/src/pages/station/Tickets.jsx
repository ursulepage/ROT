// src/pages/station/StationTickets.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Eye,
  Search,
  X,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Phone,
  Car,
  Calendar,
  DollarSign,
  MapPin,
  RefreshCw,
  CreditCard,
  Smartphone,
  Plus,
  CheckSquare,
  Square,
  Trash2,
  Check,
} from "lucide-react";
import TicketCard from "../../components/TicketCard";

function StationTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketCard, setShowTicketCard] = useState(false);
  const [filter, setFilter] = useState("all");
  
  // Selection state for bulk actions
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    passenger_name: "",
    phone_number: "",
    payment_method: "Cash",
  });
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
      setSelectedTickets([]);
      setSelectAll(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  // Selection handlers
  const toggleSelectTicket = (ticketId) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, ticketId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
    setSelectAll(!selectAll);
  };

  const clearSelection = () => {
    setSelectedTickets([]);
    setSelectAll(false);
  };

  // Bulk verify selected tickets
  const bulkVerifyTickets = async () => {
    if (selectedTickets.length === 0) {
      alert("Please select tickets to verify");
      return;
    }
    
    if (!window.confirm(`Verify ${selectedTickets.length} ticket(s)?`)) return;
    
    try {
      const token = localStorage.getItem("token");
      for (const ticketId of selectedTickets) {
        const ticket = tickets.find(t => t.id === ticketId);
        if (ticket?.verification_code) {
          await axios.post(
            `${API_URL}/verify-ticket`,
            { verification_code: ticket.verification_code },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      }
      alert(`${selectedTickets.length} ticket(s) verified successfully!`);
      fetchTickets();
      clearSelection();
    } catch (error) {
      console.error("Bulk verify error:", error);
      alert("Failed to verify some tickets");
    }
  };

  // Bulk delete selected tickets
  const bulkDeleteTickets = async () => {
    if (selectedTickets.length === 0) {
      alert("Please select tickets to delete");
      return;
    }
    
    if (!window.confirm(`Delete ${selectedTickets.length} ticket(s) permanently? This cannot be undone.`)) return;
    
    try {
      const token = localStorage.getItem("token");
      for (const ticketId of selectedTickets) {
        await axios.delete(`${API_URL}/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      alert(`${selectedTickets.length} ticket(s) deleted successfully!`);
      fetchTickets();
      clearSelection();
    } catch (error) {
      console.error("Bulk delete error:", error);
      alert("Failed to delete some tickets");
    }
  };

  // Single ticket operations
  const handleDeleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket permanently?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTickets();
    } catch (error) {
      console.error(error);
      alert("Failed to delete ticket");
    }
  };

  const verifyTicket = async (verificationCode, ticketId) => {
    if (!verificationCode) {
      alert("No verification code found");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_URL}/verify-ticket`,
        { verification_code: verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Ticket verified successfully!");
      fetchTickets();
    } catch (error) {
      alert(error.response?.data?.message || "Verification failed");
    }
  };

  // Booking functions
  const fetchAvailableCars = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/station/available-cars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableCars(response.data);
    } catch (err) {
      console.error("Failed to fetch available cars:", err);
      alert("Could not load available buses. Please refresh.");
    }
  };

  const openBookingModal = () => {
    fetchAvailableCars();
    setSelectedCar(null);
    setBookingForm({ passenger_name: "", phone_number: "", payment_method: "Cash" });
    setShowBookingModal(true);
  };

  const handleCarSelect = (carId) => {
    const car = availableCars.find(c => c.id == carId);
    setSelectedCar(car);
  };

  const handleBookingInputChange = (e) => {
    setBookingForm({ ...bookingForm, [e.target.name]: e.target.value });
  };

  const submitBooking = async (e) => {
    e.preventDefault();
    if (!selectedCar) {
      alert("Please select a bus");
      return;
    }
    if (!bookingForm.passenger_name || !bookingForm.phone_number) {
      alert("Please fill passenger name and phone number");
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        passenger_name: bookingForm.passenger_name,
        phone_number: bookingForm.phone_number,
        launch_car_id: selectedCar.id,
        price: selectedCar.price_amount,
        location_id: selectedCar.location_id,
        car_plate: selectedCar.car_plate,
        travel_time: selectedCar.travel_time,
        payment_method: bookingForm.payment_method,
        payment_status: "paid",
      };
      await axios.post(`${API_URL}/book-ticket`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Ticket booked successfully!");
      setShowBookingModal(false);
      fetchTickets();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setSubmitting(false);
    }
  };

  // UI Helpers
  const getPaymentIcon = (method) => {
    if (method === "MTN Mobile Money") return <Smartphone size={14} className="text-yellow-600" />;
    if (method === "Airtel Money") return <Smartphone size={14} className="text-red-600" />;
    return <CreditCard size={14} className="text-green-600" />;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case "active": return "bg-yellow-100 text-yellow-800";
      case "used": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active": return <Clock size={14} />;
      case "used": return <CheckCircle size={14} />;
      default: return <XCircle size={14} />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active": return "Active";
      case "used": return "Used";
      case "expired": return "Expired";
      default: return status;
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const searchMatch =
      (ticket.passenger_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.phone_number || "").includes(searchTerm) ||
      (ticket.car_plate || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${ticket.travel_from || ""}→${ticket.travel_to || ""}`.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = filter === "all" || ticket.ticket_life_cycle === filter;
    return searchMatch && statusMatch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ticket Management</h1>
          <p className="text-sm text-gray-500 mt-1">View, verify and book passenger tickets</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium transition"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={openBookingModal}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-sm transition"
          >
            <Plus size={18} />
            Book Ticket (Station)
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total Tickets</p>
          <h2 className="text-2xl font-bold text-gray-800 mt-1">{tickets.length}</h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Active</p>
          <h2 className="text-2xl font-bold text-yellow-600 mt-1">
            {tickets.filter((t) => t.ticket_life_cycle === "active").length}
          </h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Used</p>
          <h2 className="text-2xl font-bold text-green-600 mt-1">
            {tickets.filter((t) => t.ticket_life_cycle === "used").length}
          </h2>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Expired</p>
          <h2 className="text-2xl font-bold text-red-600 mt-1">
            {tickets.filter((t) => t.ticket_life_cycle === "expired").length}
          </h2>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedTickets.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              {selectedTickets.length} ticket(s) selected
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={bulkVerifyTickets}
              className="px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition flex items-center gap-1"
            >
              <Check size={14} /> Verify All
            </button>
            <button
              onClick={bulkDeleteTickets}
              className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition flex items-center gap-1"
            >
              <Trash2 size={14} /> Delete All
            </button>
            <button
              onClick={clearSelection}
              className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by passenger, phone, car plate, or route..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {["all", "active", "used", "expired"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition ${
                  filter === item
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="h-10 w-10 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-500 hover:text-indigo-600"
                    >
                      {selectAll ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Passenger</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Car</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Travel Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Payment</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelectTicket(ticket.id)}
                        className="text-gray-500 hover:text-indigo-600"
                      >
                        {selectedTickets.includes(ticket.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">#{ticket.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 text-sm">{ticket.passenger_name}</p>
                      <p className="text-xs text-gray-400">{ticket.phone_number}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-700">{ticket.travel_from} → {ticket.travel_to}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{ticket.car_plate}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {ticket.travel_time ? new Date(ticket.travel_time).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-600">
                      {Number(ticket.price).toLocaleString()} RWF
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {getPaymentIcon(ticket.payment_method)}
                        <span className="text-xs text-gray-600">{ticket.payment_method || "Cash"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeStyle(ticket.ticket_life_cycle)}`}>
                        {getStatusIcon(ticket.ticket_life_cycle)}
                        {getStatusText(ticket.ticket_life_cycle)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setShowTicketCard(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="View Ticket Card"
                        >
                          <Eye size={16} />
                        </button>
                        {ticket.ticket_life_cycle === "active" && (
                          <button
                            onClick={() => verifyTicket(ticket.verification_code, ticket.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-medium"
                          >
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete Ticket"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTickets.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm">No tickets found</div>
            )}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Book Ticket (Station)</h2>
                <p className="text-xs text-gray-500 mt-0.5">For passengers without online access</p>
              </div>
              <button onClick={() => setShowBookingModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <form onSubmit={submitBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Bus *</label>
                  <select
                    required
                    onChange={(e) => handleCarSelect(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Choose a bus</option>
                    {availableCars.map((car) => (
                      <option key={car.id} value={car.id}>
                        {car.car_name} ({car.car_plate}) – {car.travel_from} → {car.travel_to} – {new Date(car.travel_time).toLocaleString()} – {car.available_sits} seats
                      </option>
                    ))}
                  </select>
                  {availableCars.length === 0 && (
                    <p className="text-xs text-amber-600 mt-1">Loading buses... If none appear, no active launches.</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Passenger Name *</label>
                  <input
                    type="text"
                    name="passenger_name"
                    required
                    value={bookingForm.passenger_name}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    value={bookingForm.phone_number}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    placeholder="e.g., 0788123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select
                    name="payment_method"
                    value={bookingForm.payment_method}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  >
                    <option value="Cash">💵 Cash at Station</option>
                    <option value="MTN Mobile Money">📱 MTN Mobile Money</option>
                    <option value="Airtel Money">📱 Airtel Money</option>
                  </select>
                </div>
                {selectedCar && (
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <span className="text-gray-600">Total: </span>
                    <span className="font-bold text-indigo-600">{Number(selectedCar.price_amount).toLocaleString()} RWF</span>
                  </div>
                )}
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowBookingModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting || !selectedCar} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                    {submitting ? "Booking..." : "Book Ticket"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Professional Ticket Card Modal */}
      {showTicketCard && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-4xl w-full">
            <button
              onClick={() => setShowTicketCard(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-200 transition flex items-center gap-2 bg-black/50 px-4 py-2 rounded-lg"
            >
              <X size={18} />
              Close
            </button>
            <TicketCard ticket={selectedTicket} />
          </div>
        </div>
      )}
    </div>
  );
}

export default StationTickets;