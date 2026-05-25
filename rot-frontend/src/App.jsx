// src/App.jsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= PUBLIC PAGES =================
import Home from "./pages/Home";
import Login from "./pages/Login";
import PassengerTickets from "./pages/PassengerTickets";
import TicketDetails from "./pages/TicketDetails";
import PaymentPage from "./pages/PaymentPage";

// ================= ADMIN PAGES =================
import AdminDashboard from "./pages/admin/AdminDashboard";
import Companies from "./pages/admin/Companies";
import Managers from "./pages/admin/Managers";
import Reports from "./pages/admin/Reports";
import Payments from "./pages/admin/Payments";

// ================= MANAGER PAGES =================
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import Cars from "./pages/manager/Cars";
import Drivers from "./pages/manager/Drivers";
// in manager routes
import DriverTracking from "./pages/manager/DriverTracking";
import Stations from "./pages/manager/Stations";
import LaunchCars from "./pages/manager/LaunchCars";
import Locations from "./pages/manager/Locations";
import Tickets from "./pages/manager/Tickets";
import ManagerReports from "./pages/manager/Reports";
import Analytics from "./pages/manager/Analytics";

// ================= STATION PAGES =================
import StationDashboard from "./pages/station/StationDashboard";
import StationTickets from "./pages/station/Tickets";
import ScanTicket from "./pages/station/ScanTicket";
import VerifyPassenger from "./pages/station/VerifyPassenger";

// ================= DRIVER PAGES =================
import DriverDashboard from "./pages/driver/DriverDashboard";
import AssignedTrips from "./pages/driver/AssignedTrips";

// ================= LAYOUTS =================
import AdminLayout from "./layouts/AdminLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import StationLayout from "./layouts/StationLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ================= PUBLIC ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tickets" element={<PassengerTickets />} />
        <Route path="/ticket-details" element={<TicketDetails />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* ================= ADMIN ================= */}
        <Route path="/admin" element={<AdminLayout />}>

          <Route index element={<AdminDashboard />} />

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="companies" element={<Companies />} />
          <Route path="managers" element={<Managers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="payments" element={<Payments />} />

        </Route>

        {/* ================= MANAGER ================= */}
        <Route path="/manager" element={<ManagerLayout />}>

          <Route index element={<ManagerDashboard />} />

          <Route path="dashboard" element={<ManagerDashboard />} />
          <Route path="cars" element={<Cars />} />
          <Route path="drivers" element={<Drivers />} />

<Route path="driver-tracking" element={<DriverTracking />} />
          <Route path="stations" element={<Stations />} />
          <Route path="launch-cars" element={<LaunchCars />} />
          <Route path="locations" element={<Locations />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="reports" element={<ManagerReports />} />
          <Route path="analytics" element={<Analytics />} />

        </Route>

        {/* ================= STATION ================= */}
        <Route path="/station" element={<StationLayout />}>

          <Route index element={<StationDashboard />} />

          <Route path="dashboard" element={<StationDashboard />} />
          <Route path="tickets" element={<StationTickets />} />
          <Route path="scan-ticket" element={<ScanTicket />} />
          <Route path="verify-passenger" element={<VerifyPassenger />} />

        </Route>

        {/* ================= DRIVER ================= */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/assigned-trips" element={<AssignedTrips />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;

