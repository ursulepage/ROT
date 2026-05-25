// src/pages/manager/Tickets.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Ticket,
  Search,
  Eye,
  Download,
  X,
  Calendar,
  User,
  Phone,
  MapPin,
  DollarSign,
  CreditCard,
  QrCode,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketCard, setShowTicketCard] = useState(false);
  const [filter, setFilter] = useState("all");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTickets();
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "active":
        return { color: "bg-yellow-100 text-yellow-700", icon: <Clock size={14} />, text: "Pending" };
      case "used":
        return { color: "bg-green-100 text-green-700", icon: <CheckCircle size={14} />, text: "Used" };
      case "cancelled":
        return { color: "bg-red-100 text-red-700", icon: <XCircle size={14} />, text: "Cancelled" };
      default:
        return { color: "bg-gray-100 text-gray-700", icon: null, text: status };
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.passenger_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.phone_number?.includes(searchTerm) ||
      ticket.car_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${ticket.travel_from}→${ticket.travel_to}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || ticket.ticket_life_cycle === filter;
    return matchesSearch && matchesFilter;
  });

  const viewTicketCard = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketCard(true);
  };

  const downloadTicketImage = async (ticket) => {
    // Create a temporary div with the ticket layout
    const ticketHtml = `
      <div id="ticket-to-download" style="background: white; padding: 24px; border-radius: 24px; width: 450px; font-family: system-ui, -apple-system, sans-serif; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="background: #3b82f6; width: 60px; height: 60px; border-radius: 30px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px;">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M15 5v2M9 5v2M5 9h14M5 13h14M5 17h14"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
          </div>
          <h2 style="font-size: 24px; font-weight: bold; margin: 0; color: #1f2937;">ROT Transport</h2>
          <p style="font-size: 12px; color: #6b7280; margin: 4px 0 0;">Rwanda Online Transport</p>
        </div>
        <div style="background: #f9fafb; border-radius: 16px; padding: 16px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #6b7280;">Ticket ID</span><strong style="color: #1f2937;">#${ticket.id}</strong></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #6b7280;">Passenger</span><strong style="color: #1f2937;">${ticket.passenger_name}</strong></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #6b7280;">Phone</span><span style="color: #4b5563;">${ticket.phone_number}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #6b7280;">Route</span><strong style="color: #1f2937;">${ticket.travel_from} → ${ticket.travel_to}</strong></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #6b7280;">Car</span><span style="color: #4b5563;">${ticket.car_plate}</span></div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span style="color: #6b7280;">Departure</span><span style="color: #4b5563;">${new Date(ticket.travel_time).toLocaleString()}</span></div>
          <div style="display: flex; justify-content: space-between;"><span style="color: #6b7280;">Price</span><strong style="color: #f59e0b;">${Number(ticket.price).toLocaleString()} RWF</strong></div>
        </div>
        ${ticket.qr_code ? `<div style="text-align: center; margin: 16px 0;"><img src="${ticket.qr_code}" style="width: 120px; height: 120px; border-radius: 12px;" /></div>` : ''}
        <div style="text-align: center; font-size: 11px; color: #9ca3af;">Scan QR at boarding • Valid only on date shown</div>
      </div>
    `;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = ticketHtml;
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const element = document.getElementById('ticket-to-download');
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
      const link = document.createElement('a');
      link.download = `ROT_Ticket_${ticket.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error('Download error:', err);
      alert('Could not generate image. You can take a screenshot.');
    } finally {
      document.body.removeChild(tempDiv);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tickets Management</h2>
          <p className="text-gray-500 mt-1">View and manage all passenger tickets</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by passenger name, phone, car plate, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {["all", "active", "used", "cancelled"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl capitalize transition ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Ticket size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No tickets found</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Passenger</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Route</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Car</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTickets.map((ticket, idx) => {
                  const statusInfo = getStatusInfo(ticket.ticket_life_cycle);
                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-800">{ticket.passenger_name}</td>
                      <td className="px-4 py-3 text-gray-600">{ticket.phone_number}</td>
                      <td className="px-4 py-3 text-gray-600">{ticket.travel_from} → {ticket.travel_to}</td>
                      <td className="px-4 py-3 text-gray-600">{ticket.car_plate}</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">{Number(ticket.price).toLocaleString()} RWF</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.icon}
                          {statusInfo.text}
                        </span>
                       </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => viewTicketCard(ticket)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                          title="View Ticket"
                        >
                          <Eye size={18} />
                        </button>
                       </td>
                     </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
            Showing {filteredTickets.length} of {tickets.length} tickets
          </div>
        </div>
      )}

      {/* Professional Ticket Card Modal */}
      {showTicketCard && selectedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">Ticket Card</h3>
                <p className="text-indigo-100 text-xs">Ticket #{selectedTicket.id}</p>
              </div>
              <button onClick={() => setShowTicketCard(false)} className="text-white hover:bg-white/20 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            {/* Ticket Body */}
            <div className="p-5 space-y-4">
              {/* Route + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin size={16} className="text-indigo-500" />
                  <span className="font-medium">{selectedTicket.travel_from}</span>
                  <span>→</span>
                  <MapPin size={16} className="text-emerald-500" />
                  <span className="font-medium">{selectedTicket.travel_to}</span>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusInfo(selectedTicket.ticket_life_cycle).color}`}>
                  {getStatusInfo(selectedTicket.ticket_life_cycle).icon}
                  {getStatusInfo(selectedTicket.ticket_life_cycle).text}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-dashed border-gray-200"></div>

              {/* Passenger Details */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Passenger</span>
                  <span className="font-medium text-gray-800">{selectedTicket.passenger_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-700">{selectedTicket.phone_number}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Car</span>
                  <span className="text-gray-700">{selectedTicket.car_plate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Departure</span>
                  <span className="text-gray-700">{new Date(selectedTicket.travel_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Price</span>
                  <span className="font-semibold text-indigo-600">{Number(selectedTicket.price).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Payment</span>
                  <span className="text-gray-700">{selectedTicket.payment_method || "Cash"}</span>
                </div>
              </div>

              {/* QR Code */}
              {selectedTicket.qr_code && (
                <div className="flex flex-col items-center pt-2">
                  <p className="text-xs text-gray-500 mb-2">Scan to verify</p>
                  <img src={selectedTicket.qr_code} alt="QR Code" className="w-32 h-32 border rounded-xl" />
                </div>
              )}

              {/* Verification Code */}
              {selectedTicket.verification_code && (
                <div className="bg-gray-100 rounded-lg p-2 text-center">
                  <p className="text-xs text-gray-500">Verification Code</p>
                  <p className="text-sm font-mono font-bold text-indigo-600">{selectedTicket.verification_code}</p>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => downloadTicketImage(selectedTicket)}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Download size={16} /> Download
              </button>
              <button
                onClick={() => setShowTicketCard(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;