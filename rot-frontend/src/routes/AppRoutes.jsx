import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import PassengerTickets from "../pages/PassengerTickets";
import TicketDetails from "../pages/TicketDetails";
import PaymentPage from "../pages/PaymentPage";

// ADMIN
import AdminDashboard from "../pages/admin/AdminDashboard";
import Companies from "../pages/admin/Companies";
import Managers from "../pages/admin/Managers";
import Reports from "../pages/admin/Reports";
import Payments from "../pages/admin/Payments";

// MANAGER
import ManagerDashboard from "../pages/manager/ManagerDashboard";
import Cars from "../pages/manager/Cars";
import Drivers from "../pages/manager/Drivers";
import Stations from "../pages/manager/Stations";
import LaunchCars from "../pages/manager/LaunchCars";
import Locations from "../pages/manager/Locations";
import Tickets from "../pages/manager/Tickets";
import ManagerReports from "../pages/manager/Reports";
import Analytics from "../pages/manager/Analytics";

// STATION
import StationDashboard from "../pages/station/StationDashboard";
import StationTickets from "../pages/station/Tickets";
import ScanTicket from "../pages/station/ScanTicket";
import VerifyPassenger from "../pages/station/VerifyPassenger";

// DRIVER
import DriverDashboard from "../pages/driver/DriverDashboard";
import AssignedTrips from "../pages/driver/AssignedTrips";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/tickets" element={<PassengerTickets />} />
        <Route path="/ticket-details" element={<TicketDetails />} />
        <Route path="/payment" element={<PaymentPage />} />

        {/* ADMIN */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/companies" element={<Companies />} />
        <Route path="/admin/managers" element={<Managers />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/payments" element={<Payments />} />

        {/* MANAGER */}
        <Route path="/manager/dashboard" element={<ManagerDashboard />} />
        <Route path="/manager/cars" element={<Cars />} />
        <Route path="/manager/drivers" element={<Drivers />} />
        <Route path="/manager/stations" element={<Stations />} />
        <Route path="/manager/launch-cars" element={<LaunchCars />} />
        <Route path="/manager/locations" element={<Locations />} />
        <Route path="/manager/tickets" element={<Tickets />} />
        <Route path="/manager/reports" element={<ManagerReports />} />
        <Route path="/manager/analytics" element={<Analytics />} />

        {/* STATION */}
        <Route path="/station/dashboard" element={<StationDashboard />} />
        <Route path="/station/tickets" element={<StationTickets />} />
        <Route path="/station/scan-ticket" element={<ScanTicket />} />
        <Route path="/station/verify-passenger" element={<VerifyPassenger />} />

        {/* DRIVER */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/assigned-trips" element={<AssignedTrips />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;