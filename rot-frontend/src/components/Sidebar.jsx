// src/components/Sidebar.jsx

import {
  LayoutDashboard,
  Bus,
  Users,
  Ticket,
  MapPin,
  Wallet,
} from "lucide-react";

function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-5">

      <div className="flex items-center gap-3 mb-10">
        <img
          src="/ROT.png"
          alt="ROT"
          className="w-12 h-12 bg-white rounded-full p-1"
        />

        <h1 className="text-2xl font-bold">
          ROT
        </h1>
      </div>

      <div className="space-y-4">

        <button className="w-full flex items-center gap-3 bg-blue-600 p-3 rounded-xl">
          <LayoutDashboard />
          Dashboard
        </button>

        <button className="w-full flex items-center gap-3 hover:bg-slate-700 p-3 rounded-xl">
          <Bus />
          Cars
        </button>

        <button className="w-full flex items-center gap-3 hover:bg-slate-700 p-3 rounded-xl">
          <Users />
          Drivers
        </button>

        <button className="w-full flex items-center gap-3 hover:bg-slate-700 p-3 rounded-xl">
          <Ticket />
          Tickets
        </button>

        <button className="w-full flex items-center gap-3 hover:bg-slate-700 p-3 rounded-xl">
          <MapPin />
          Locations
        </button>

        <button className="w-full flex items-center gap-3 hover:bg-slate-700 p-3 rounded-xl">
          <Wallet />
          Payments
        </button>

      </div>
    </div>
  );
}

export default Sidebar;