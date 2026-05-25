// src/pages/driver/DriverTickets.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { Ticket, User, MapPin, Calendar, DollarSign, Search, Phone, CheckCircle } from "lucide-react";

function DriverTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/driver/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "used":
        return "bg-blue-100 text-blue-700";
      case "expired":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
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

  const filteredTickets = tickets.filter(ticket => {
    const search = ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   ticket.phone_number?.includes(searchTerm);
    const status = filter === "all" || ticket.ticket_life_cycle === filter;
    return search && status;
  });

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-10 w-10 rounded-full border-4 border-orange-200 border-t-orange-600 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Passenger Tickets</h1>
        <p className="text-sm text-gray-500">View and manage tickets for your bus</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500">Active</p>
          <p className="text-xl font-bold text-green-600">
            {tickets.filter(t => t.ticket_life_cycle === "active").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500">Used</p>
          <p className="text-xl font-bold text-blue-600">
            {tickets.filter(t => t.ticket_life_cycle === "used").length}
          </p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <p className="text-xs text-gray-500">Expired</p>
          <p className="text-xl font-bold text-red-600">
            {tickets.filter(t => t.ticket_life_cycle === "expired").length}
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by passenger name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="flex gap-2">
            {["all", "active", "used", "expired"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition ${
                  filter === item ? "bg-orange-600 text-white" : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
          <Ticket size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredTickets.map((ticket) => (
            <div key={ticket.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition">
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                    <User size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{ticket.passenger_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Phone size={12} className="text-gray-400" />
                      <p className="text-xs text-gray-500">{ticket.phone_number}</p>
                    </div>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadge(ticket.ticket_life_cycle)}`}>
                  {getStatusText(ticket.ticket_life_cycle)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} />
                  <span>{ticket.travel_from} → {ticket.travel_to}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} />
                  <span>{new Date(ticket.travel_time).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <DollarSign size={14} />
                  <span>{ticket.price?.toLocaleString()} RWF</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Ticket size={14} />
                  <span>Seat: {ticket.seat_number || "N/A"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DriverTickets;