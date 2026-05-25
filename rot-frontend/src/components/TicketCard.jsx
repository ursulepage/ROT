// src/components/TicketCard.jsx
import { useState, useEffect } from "react";
import { generateQRCodeWithInactiveOverlay } from "../utils/generateQR";

function TicketCard({ ticket }) {
  const [qrCode, setQrCode] = useState(null);
  const [emergencyContact, setEmergencyContact] = useState("");

  useEffect(() => {
    const generateQR = async () => {
      if (ticket?.id) {
        const isInactive =
          ticket.ticket_life_cycle === "cancelled" ||
          ticket.ticket_life_cycle === "inactive";
        const qrData = `Ticket#${ticket.id}-${ticket.passenger_name}`;
        const qr = await generateQRCodeWithInactiveOverlay(qrData, isInactive);
        setQrCode(qr);
      }
    };
    generateQR();
  }, [ticket]);

  // Format travel time
  const formatTravelTime = (travelTime) => {
    if (!travelTime) return "N/A";
    try {
      const date = new Date(travelTime);
      const departure = date.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      const arrival = new Date(date.getTime() + 2.75 * 60 * 60 * 1000); // Add 2.75 hours
      const arrivalTime = arrival.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        month: "short",
        day: "2-digit",
        year: "numeric",
      });

      return `DEPARTS: ${departure} | ARRIVES: ${arrivalTime}`;
    } catch {
      return travelTime;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-300";
      case "used":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "ACTIVE";
      case "confirmed":
        return "CONFIRMED";
      case "used":
        return "USED";
      case "cancelled":
        return "CANCELLED";
      default:
        return status?.toUpperCase();
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100 max-w-2xl mx-auto" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Ctext x="10" y="50" font-size="60" fill="rgba(0,0,0,0.03)" font-weight="bold"%3E✓%3C/text%3E%3C/svg%3E)' }}>
      {/* Header with Company Info */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-4xl font-black text-amber-900 leading-tight">
            ROYAL OVERLAND
            <br />
            TRANSPORT
          </h1>
          <p className="text-sm text-black font-bold mt-1">TICKET</p>
        </div>
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-900 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            ◆
          </div>
          <p className="text-xs font-bold text-amber-900 mt-2">ROYAL OVERLAND</p>
          <p className="text-xs font-bold text-amber-900">TRANSPORT</p>
        </div>
      </div>

      {/* Passenger Name */}
      <div className="border-2 border-amber-900 rounded-xl p-4 mb-4 bg-gray-50">
        <p className="text-xs font-black text-amber-900">PASSENGER NAME:</p>
        <p className="text-2xl font-black text-black">{ticket?.passenger_name || "N/A"}</p>
      </div>

      {/* From and To */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 border-2 border-amber-900 rounded-xl p-4 bg-gray-50">
          <p className="text-xs font-black text-amber-900">FROM:</p>
          <p className="text-xl font-black text-black">{ticket?.travel_from || "N/A"}</p>
        </div>
        <div className="flex items-center justify-center -mx-2">
          <span className="text-3xl text-amber-900 font-bold">➜</span>
        </div>
        <div className="flex-1 border-2 border-amber-900 rounded-xl p-4 bg-gray-50">
          <p className="text-xs font-black text-amber-900">TO:</p>
          <p className="text-xl font-black text-black">{ticket?.travel_to || "N/A"}</p>
        </div>
      </div>

      {/* Travel Time */}
      <div className="border-2 border-amber-900 rounded-xl p-4 mb-4 bg-gray-50">
        <p className="text-xs font-black text-amber-900">TRAVEL TIME:</p>
        <p className="text-sm font-black text-black">{formatTravelTime(ticket?.travel_time)}</p>
      </div>

      {/* Status and QR Code Row */}
      <div className="flex gap-4 mb-4">
        {/* Status Badge */}
        <div className={`flex-1 border-2 border-amber-900 rounded-xl p-4 ${getStatusBadgeColor(ticket?.ticket_life_cycle)}`}>
          <p className="text-xs font-black mb-1">ACTIVE STATUS:</p>
          <p className="text-xs font-black mb-1">ACTIVE STATUS:</p>
          <p className="text-2xl font-black">{getStatusText(ticket?.ticket_life_cycle)}</p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center justify-center">
          <p className="text-sm font-black text-black mb-2">QR CODE</p>
          {qrCode ? (
            <img src={qrCode} alt="QR Code" className="w-32 h-32 border-2 border-black" />
          ) : (
            <div className="w-32 h-32 border-2 border-black bg-gray-100 flex items-center justify-center">
              <span className="text-xs text-gray-500">Loading...</span>
            </div>
          )}
          <p className="text-xs font-bold text-black mt-2 text-center">SCAN FOR BOARDING</p>
        </div>
      </div>

      {/* Car Plate */}
      <div className="border-2 border-amber-900 rounded-xl p-4 mb-4 bg-gray-50">
        <p className="text-xs font-black text-amber-900">CAR PLATE / VEHICLE ID:</p>
        <div className="flex items-center gap-2">
          <p className="text-2xl font-black text-black">{ticket?.car_plate || "N/A"}</p>
          <p className="text-xs text-gray-600">(for a bus or shuttle, for instance)</p>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="border-2 border-amber-900 rounded-xl p-4 bg-gray-50">
        <p className="text-xs font-black text-amber-900">EMERGENCY CALLER ID / CONTACT:</p>
        <p className="text-sm font-medium text-black">
          In case of emergency, call: {ticket?.phone_number || "N/A"}
        </p>
      </div>

      {/* Ticket ID Footer */}
      <div className="mt-6 pt-4 border-t-2 border-gray-200 text-center">
        <p className="text-xs text-gray-500">Ticket ID: #{ticket?.id}</p>
        <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
}

export default TicketCard;