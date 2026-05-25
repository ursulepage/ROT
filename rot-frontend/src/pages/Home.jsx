// src/pages/Home.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Zap,
  Shield,
  Users,
  MapPin,
  Clock,
  Smartphone,
  Search,
  Bus,
  DollarSign,
  CreditCard,
  Ticket,
  CheckCircle,
  X,
  Download,
  Phone,
  User,
  Building,
  ArrowRight,
  RefreshCw,
  XCircle,
  Loader2,
  Navigation,
  Trash2,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import RouteMap from "../components/RouteMap";
import PaymentModal from "../components/PaymentModal";

function Home() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Language options
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  ];
  
  const [currentLang, setCurrentLang] = useState("en");
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Translations
  const translations = {
    en: {
      title: "Book Your Ticket in Seconds",
      subtitle: "No Registration Needed • Instant Booking • Demo Payment",
      searchByRoute: "Search by Route",
      searchByTime: "Search by Time",
      searchByCompany: "Search by Company",
      from: "From",
      to: "To",
      search: "Search",
      availableBuses: "Available Buses",
      found: "found",
      seatsLeft: "seats left",
      departure: "Departure",
      company: "Agency",
      price: "Price",
      bookNow: "Book Now",
      viewRoute: "View Route",
      yourRecentTickets: "Your Tickets",
      expired: "Expired",
      active: "Active",
      verified: "Verified",
      bookTicket: "Book Your Ticket",
      step: "Step",
      of: "of",
      route: "Route",
      fullName: "Full Name",
      phoneNumber: "Phone Number",
      paymentMethod: "Payment Method",
      continueToPayment: "Continue to Payment",
      processingPayment: "Processing Payment",
      pleaseWait: "Please wait while we confirm your booking...",
      bookingConfirmed: "Booking Confirmed!",
      ticketIssued: "Your ticket has been issued",
      downloadTicket: "Download Ticket",
      close: "Close",
      scanToVerify: "Scan to Verify",
      presentThisTicket: "Present this ticket at boarding",
      whyChoose: "Why Choose ROT?",
      readyToTravel: "Ready to Travel?",
      bookNowCTA: "Book your ticket now and enjoy a smooth journey across Rwanda",
      searchRoutes: "Search Routes",
      easyBooking: "Easy Booking",
      easyBookingDesc: "Book your ticket instantly without registration",
      securePayments: "Secure Payments",
      securePaymentsDesc: "Demo payment system - test booking",
      realTimeUpdates: "Real-time Updates",
      realTimeUpdatesDesc: "Get instant notifications about your trip",
      wideCoverage: "Wide Coverage",
      wideCoverageDesc: "Travel across Rwanda with our network",
      alwaysAvailable: "Always Available",
      alwaysAvailableDesc: "Book 24/7 from your phone",
      trustedService: "Trusted Service",
      trustedServiceDesc: "Thousands of satisfied passengers",
      viewTicket: "View Ticket",
      refreshStatus: "Refresh",
      tickets: "tickets",
      routeMap: "Route Map",
      duration: "Duration",
      hours: "hours",
    },
    fr: {
      title: "Réservez Votre Billet en Quelques Secondes",
      subtitle: "Pas d'inscription nécessaire • Paiement de démonstration",
      searchByRoute: "Rechercher par Itinéraire",
      searchByTime: "Rechercher par Heure",
      searchByCompany: "Rechercher par Compagnie",
      from: "De",
      to: "À",
      search: "Rechercher",
      availableBuses: "Bus Disponibles",
      found: "trouvé(s)",
      seatsLeft: "places restantes",
      departure: "Départ",
      company: "Agence",
      price: "Prix",
      bookNow: "Réserver",
      viewRoute: "Voir l'itinéraire",
      yourRecentTickets: "Vos Billets",
      expired: "Expiré",
      active: "Actif",
      verified: "Vérifié",
      bookTicket: "Réserver",
      step: "Étape",
      of: "de",
      route: "Itinéraire",
      fullName: "Nom Complet",
      phoneNumber: "Téléphone",
      paymentMethod: "Moyen de Paiement",
      continueToPayment: "Continuer",
      processingPayment: "Traitement...",
      pleaseWait: "Veuillez patienter",
      bookingConfirmed: "Réservation Confirmée!",
      ticketIssued: "Votre billet a été émis",
      downloadTicket: "Télécharger",
      close: "Fermer",
      scanToVerify: "Scanner pour Vérifier",
      presentThisTicket: "Présentez ce billet",
      whyChoose: "Pourquoi Choisir ROT?",
      readyToTravel: "Prêt à Voyager?",
      bookNowCTA: "Réservez maintenant",
      searchRoutes: "Rechercher",
      easyBooking: "Réservation Facile",
      easyBookingDesc: "Réservez sans inscription",
      securePayments: "Paiements Sécurisés",
      securePaymentsDesc: "Système de paiement de démonstration",
      realTimeUpdates: "Mises à jour",
      realTimeUpdatesDesc: "Notifications instantanées",
      wideCoverage: "Large Couverture",
      wideCoverageDesc: "Voyagez à travers le Rwanda",
      alwaysAvailable: "Toujours Disponible",
      alwaysAvailableDesc: "Réservez 24/7",
      trustedService: "Service de Confiance",
      trustedServiceDesc: "Des milliers de clients satisfaits",
      viewTicket: "Voir",
      refreshStatus: "Actualiser",
      tickets: "billets",
      routeMap: "Carte",
      duration: "Durée",
      hours: "heures",
    },
    rw: {
      title: "Kanda Itike mu Masegonda",
      subtitle: "Ntabwo ukeneye Kwiyandikisha • Kwishyura kwa Demo",
      searchByRoute: "Shakisha Inzira",
      searchByTime: "Shakisha Igihe",
      searchByCompany: "Shakisha Isosiyete",
      from: "Kuva",
      to: "Kugera",
      search: "Shakisha",
      availableBuses: "Amabasi Aboneka",
      found: "yabonetse",
      seatsLeft: "imyanya isigaye",
      departure: "Igihe cyo Kuva",
      company: "Isosiyete",
      price: "Igiciro",
      bookNow: "Kanda",
      viewRoute: "Reba Inzira",
      yourRecentTickets: "Itike Zawe",
      expired: "Yarangije",
      active: "Ikiriho",
      verified: "Yemejwe",
      bookTicket: "Kanda Itike",
      step: "Intambwe",
      of: "muri",
      route: "Inzira",
      fullName: "Izina Ryuzuye",
      phoneNumber: "Nimero ya Telefone",
      paymentMethod: "Uburyo bwo Kwishyura",
      continueToPayment: "Komeza",
      processingPayment: "Birimo...",
      pleaseWait: "Duhaba umwanya",
      bookingConfirmed: "Kwemejwe!",
      ticketIssued: "Itike yawe yasohotse",
      downloadTicket: "Kurura",
      close: "Funga",
      scanToVerify: "Skanyera",
      presentThisTicket: "Tanga iyi tike",
      whyChoose: "Kuki Wahitamo ROT?",
      readyToTravel: "Uriteguye Ingendo?",
      bookNowCTA: "Kanda Itike None",
      searchRoutes: "Shakisha",
      easyBooking: "Kwiyandikisha Byoroshye",
      easyBookingDesc: "Kanda itike utabanje kwiyandikisha",
      securePayments: "Kwishyura kwa Demo",
      securePaymentsDesc: "Sisitemu yo kwishyura igerageza",
      realTimeUpdates: "Amakuru ya Vuba",
      realTimeUpdatesDesc: "Habwa amakuru ako kanya",
      wideCoverage: "Ibice Byinshi",
      wideCoverageDesc: "Ingendo mu Rwanda hose",
      alwaysAvailable: "Bihora Bihari",
      alwaysAvailableDesc: "Kanda 24/7",
      trustedService: "Serivisi Yizerwa",
      trustedServiceDesc: "Abagenzi benshi barabyizeye",
      viewTicket: "Reba",
      refreshStatus: "Vugurura",
      tickets: "itike",
      routeMap: "Ikarita",
      duration: "Igihe",
      hours: "amasaha",
    },
  };

  const t = translations[currentLang];

  // State
  const [locations, setLocations] = useState([]);
  const [availableCars, setAvailableCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchType, setSearchType] = useState("route");
  const [searchFrom, setSearchFrom] = useState("");
  const [searchTo, setSearchTo] = useState("");
  const [searchTime, setSearchTime] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingStep, setBookingStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    passenger_name: "",
    phone_number: "",
    payment_method: "MTN Mobile Money",
  });
  const [submitting, setSubmitting] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  
  // Map and Payment States
  const [showMap, setShowMap] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [selectedRouteMap, setSelectedRouteMap] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentRoute, setPaymentRoute] = useState("");

  // Features data
  const features = [
    { icon: <Smartphone size={28} />, title: t.easyBooking, description: t.easyBookingDesc },
    { icon: <Shield size={28} />, title: t.securePayments, description: t.securePaymentsDesc },
    { icon: <Zap size={28} />, title: t.realTimeUpdates, description: t.realTimeUpdatesDesc },
    { icon: <MapPin size={28} />, title: t.wideCoverage, description: t.wideCoverageDesc },
    { icon: <Clock size={28} />, title: t.alwaysAvailable, description: t.alwaysAvailableDesc },
    { icon: <Users size={28} />, title: t.trustedService, description: t.trustedServiceDesc },
  ];

  // Fetch data on load
  useEffect(() => {
    fetchLocations();
    fetchAvailableCars();
    fetchCompanies();
    loadRecentTickets();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/locations`);
      setLocations(response.data);
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([
        { id: 1, travel_from: "Kigali", travel_to: "Huye", price_amount: 3500 },
        { id: 2, travel_from: "Kigali", travel_to: "Musanze", price_amount: 5000 },
        { id: 3, travel_from: "Kigali", travel_to: "Rubavu", price_amount: 7000 },
      ]);
    }
  };

  const fetchAvailableCars = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/launch-cars`);
      setAvailableCars(response.data);
      setFilteredCars(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching cars:", error);
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/companies`);
      setCompanies(response.data);
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const loadRecentTickets = () => {
    const saved = localStorage.getItem("recentTickets");
    if (saved) {
      const tickets = JSON.parse(saved);
      const updatedTickets = tickets.map(ticket => ({
        ...ticket,
        isExpired: new Date(ticket.travel_time) < new Date(),
      }));
      setRecentTickets(updatedTickets);
    }
  };

  const refreshTicketStatus = () => {
    const updatedTickets = recentTickets.map(ticket => ({
      ...ticket,
      isExpired: new Date(ticket.travel_time) < new Date(),
    }));
    setRecentTickets(updatedTickets);
    localStorage.setItem("recentTickets", JSON.stringify(updatedTickets));
    alert("Ticket status refreshed!");
  };

  const saveRecentTicket = (ticket) => {
    const newTicket = {
      ...ticket,
      isExpired: false,
      verified: false,
    };
    const updated = [newTicket, ...recentTickets].slice(0, 10);
    setRecentTickets(updated);
    localStorage.setItem("recentTickets", JSON.stringify(updated));
  };

  const handleSearch = async () => {
    setLoading(true);
    
    try {
      let url = `${API_URL}/public/available-cars`;
      const params = new URLSearchParams();
      
      if (searchType === "route" && searchFrom && searchTo) {
        params.append("from", searchFrom);
        params.append("to", searchTo);
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      let filtered = response.data;
      
      if (searchType === "time" && searchTime) {
        filtered = filtered.filter((car) => {
          const carTime = new Date(car.travel_time).toLocaleTimeString();
          return carTime.includes(searchTime);
        });
      }
      
      if (searchType === "company" && searchCompany) {
        filtered = filtered.filter((car) =>
          car.company_name?.toLowerCase().includes(searchCompany.toLowerCase())
        );
      }
      
      setFilteredCars(filtered);
    } catch (error) {
      console.error("Search error:", error);
      setFilteredCars(availableCars);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    setBookingStep(1);
    setShowBookingForm(true);
  };

  const handleShowRoute = (car) => {
    setSelectedRouteMap(car);
    setShowMap(true);
  };

  const handleProceedToPayment = (car) => {
    if (!bookingData.passenger_name.trim()) {
      alert("Please enter your full name");
      return;
    }
    if (!bookingData.phone_number.trim()) {
      alert("Please enter your phone number");
      return;
    }
    setSelectedCar(car);
    setPaymentAmount(car.price_amount);
    setPaymentRoute(`${car.travel_from} → ${car.travel_to}`);
    setShowPayment(true);
  };

  const handlePaymentSuccess = async (paymentData) => {
    await completeBooking(selectedCar, paymentData);
  };

  const completeBooking = async (car, paymentData) => {
    setSubmitting(true);
    try {
      const ticketData = {
        passenger_name: bookingData.passenger_name,
        phone_number: bookingData.phone_number,
        launch_car_id: car.id,
        price: car.price_amount,
        car_plate: car.car_plate,
        travel_time: car.travel_time,
        payment_method: paymentData.paymentMethod === "mtn" ? "MTN Mobile Money" : 
                        paymentData.paymentMethod === "airtel" ? "Airtel Money" : "Cash",
        payment_status: "paid",
        transaction_id: paymentData.transactionId,
      };

      const response = await axios.post(`${API_URL}/public/book-ticket`, ticketData);
      
      if (response.data.success) {
        const newTicket = {
          id: response.data.ticket_id,
          passenger_name: bookingData.passenger_name,
          phone_number: bookingData.phone_number,
          car_plate: car.car_plate,
          car_name: car.car_name || "Bus",
          travel_time: car.travel_time,
          travel_from: car.travel_from,
          travel_to: car.travel_to,
          price: car.price_amount,
          company_name: car.company_name || "ROT Transport",
          verification_code: response.data.verificationCode,
          qr_code: response.data.qrImage,
          status: "active",
          booking_date: new Date().toISOString(),
        };
        
        setGeneratedTicket(newTicket);
        saveRecentTicket(newTicket);
        setShowTicketModal(true);
        setShowBookingForm(false);
        setShowPayment(false);
        setBookingStep(1);
        setBookingData({
          passenger_name: "",
          phone_number: "",
          payment_method: "MTN Mobile Money",
        });
      }
    } catch (error) {
      console.error("Booking error:", error);
      alert(error.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingInputChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value,
    });
  };

  const downloadTicket = async (ticket) => {
    const targetTicket = ticket || generatedTicket;
    if (!targetTicket) return;
    
    try {
      const html2canvas = (await import("html2canvas")).default;
      const element = document.getElementById("ticket-content");
      if (element) {
        const clone = element.cloneNode(true);
        clone.style.backgroundColor = "#ffffff";
        clone.style.padding = "20px";
        clone.style.borderRadius = "16px";
        clone.style.position = "absolute";
        clone.style.top = "-9999px";
        clone.style.left = "-9999px";
        document.body.appendChild(clone);
        const canvas = await html2canvas(clone, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
        document.body.removeChild(clone);
        const link = document.createElement("a");
        link.download = `ROT_Ticket_${targetTicket.id}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("Download failed. You can take a screenshot.");
    }
  };

  const deleteTicket = (ticketId) => {
    if (window.confirm("Delete this ticket?")) {
      const updated = recentTickets.filter(t => t.id !== ticketId);
      setRecentTickets(updated);
      localStorage.setItem("recentTickets", JSON.stringify(updated));
      if (generatedTicket?.id === ticketId) setGeneratedTicket(null);
    }
  };

  const getDuration = (from, to) => {
    const durations = {
      "Kigali→Huye": "3.5",
      "Kigali→Musanze": "2.5",
      "Kigali→Rubavu": "2",
    };
    return durations[`${from}→${to}`] || "2";
  };

  const isTicketExpired = (travelTime) => new Date(travelTime) < new Date();
  const uniqueFromCities = [...new Set(locations.map(l => l.travel_from))];
  const uniqueToCities = [...new Set(locations.map(l => l.travel_to))];

  const activeTickets = recentTickets.filter(t => !t.isExpired);
  const expiredTickets = recentTickets.filter(t => t.isExpired);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang} 
        languages={languages}
        showLangDropdown={showLangDropdown}
        setShowLangDropdown={setShowLangDropdown}
      />

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">{t.title}</h1>
          <p className="text-lg md:text-xl text-indigo-100">{t.subtitle}</p>
          <div className="inline-block bg-yellow-500/20 rounded-full px-4 py-1 text-sm">
            🎫 Demo Mode - Test Booking Available
          </div>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap gap-2 mb-6 border-b">
            {[
              { id: "route", label: t.searchByRoute, icon: <MapPin size={18} /> },
              { id: "time", label: t.searchByTime, icon: <Clock size={18} /> },
              { id: "company", label: t.searchByCompany, icon: <Building size={18} /> },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSearchType(type.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition ${
                  searchType === type.id
                    ? "bg-indigo-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {searchType === "route" && (
              <>
                <select
                  value={searchFrom}
                  onChange={(e) => setSearchFrom(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t.from}</option>
                  {uniqueFromCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <select
                  value={searchTo}
                  onChange={(e) => setSearchTo(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">{t.to}</option>
                  {uniqueToCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </>
            )}

            {searchType === "time" && (
              <input
                type="time"
                value={searchTime}
                onChange={(e) => setSearchTime(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            )}

            {searchType === "company" && (
              <select
                value={searchCompany}
                onChange={(e) => setSearchCompany(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">{t.company}</option>
                {companies.map(company => (
                  <option key={company.id} value={company.name}>{company.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={handleSearch}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition"
            >
              <Search size={18} />
              {t.search}
            </button>
          </div>
        </div>
      </div>

      {/* AVAILABLE CARS SECTION */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Bus className="text-indigo-600" />
          {t.availableBuses}
          <span className="text-sm font-normal text-gray-500 ml-2">({filteredCars.length} {t.found})</span>
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-12 w-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
          </div>
        ) : filteredCars.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
            <Bus size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No buses available for your search criteria.</p>
            <button onClick={() => setFilteredCars(availableCars)} className="mt-4 text-indigo-600 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCars.map((car) => (
              <div
                key={car.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                        <Bus size={20} className="text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{car.car_name || "Bus"}</h3>
                        <p className="text-xs text-gray-500">{car.car_plate}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                      {car.available_sits} {t.seatsLeft}
                    </span>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={14} className="text-indigo-600" />
                      <span className="font-medium">{car.travel_from}</span>
                      <ArrowRight size={14} className="text-gray-400" />
                      <MapPin size={14} className="text-emerald-600" />
                      <span className="font-medium">{car.travel_to}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Clock size={14} /> {t.departure}
                      </span>
                      <span className="font-medium">
                        {new Date(car.travel_time).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Building size={14} /> {t.company}
                      </span>
                      <span className="font-medium">{car.company_name || "ROT Transport"}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2 mt-2">
                      <span className="text-gray-500 flex items-center gap-1">
                        <DollarSign size={14} /> {t.price}
                      </span>
                      <span className="font-bold text-indigo-600 text-lg">
                        {parseFloat(car.price_amount).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleShowRoute(car)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition flex items-center justify-center gap-2"
                    >
                      <MapPin size={16} />
                      {t.viewRoute}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCar(car);
                        setShowBookingForm(true);
                      }}
                      className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                    >
                      {t.bookNow}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TICKETS SECTION */}
      {recentTickets.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Ticket size={20} className="text-indigo-600" />
              {t.yourRecentTickets}
              <span className="text-xs font-normal text-gray-400 ml-2">
                ({recentTickets.length} {t.tickets})
              </span>
            </h2>
            <div className="flex gap-2">
              <button
                onClick={refreshTicketStatus}
                className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
              >
                <RefreshCw size={12} />
                {t.refreshStatus}
              </button>
              <button
                onClick={() => {
                  if (window.confirm("Clear all tickets?")) {
                    localStorage.removeItem("recentTickets");
                    setRecentTickets([]);
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1 bg-red-50 px-3 py-1.5 rounded-lg"
              >
                <Trash2 size={12} />
                Clear All
              </button>
            </div>
          </div>

          {/* Active Tickets */}
          {activeTickets.length > 0 && (
            <div className="mb-6">
              <h3 className="text-md font-semibold text-green-600 mb-3 flex items-center gap-2">
                <CheckCircle size={16} /> Active Tickets ({activeTickets.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-xl p-4 border border-green-200 shadow-sm hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Ticket size={16} className="text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">
                            {ticket.travel_from} → {ticket.travel_to}
                          </p>
                          <p className="text-xs text-gray-500">#{ticket.id}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle size={12} /> Active
                      </span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between"><span className="text-gray-500">Passenger:</span><span>{ticket.passenger_name}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Car:</span><span>{ticket.car_plate}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Departure:</span><span>{new Date(ticket.travel_time).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Price:</span><span className="font-semibold text-indigo-600">{Number(ticket.price).toLocaleString()} RWF</span></div>
                    </div>
                    {ticket.verification_code && (
                      <div className="mt-3 pt-2 border-t text-center">
                        <p className="text-xs text-gray-500">Verification Code</p>
                        <p className="text-sm font-mono font-bold text-indigo-600">{ticket.verification_code}</p>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => {
                          setGeneratedTicket(ticket);
                          setShowTicketModal(true);
                        }}
                        className="flex-1 text-xs bg-indigo-50 text-indigo-600 py-1.5 rounded-lg hover:bg-indigo-100 transition"
                      >
                        View Ticket
                      </button>
                      <button
                        onClick={() => downloadTicket(ticket)}
                        className="flex-1 text-xs bg-gray-100 text-gray-700 py-1.5 rounded-lg hover:bg-gray-200 transition flex items-center justify-center gap-1"
                      >
                        <Download size={12} /> Download
                      </button>
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="text-xs text-red-600 hover:bg-red-50 p-1.5 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expired Tickets */}
          {expiredTickets.length > 0 && (
            <div>
              <h3 className="text-md font-semibold text-red-600 mb-3 flex items-center gap-2">
                <XCircle size={16} /> Expired Tickets ({expiredTickets.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-75">
                {expiredTickets.map((ticket) => (
                  <div key={ticket.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <XCircle size={16} className="text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm line-through">
                            {ticket.travel_from} → {ticket.travel_to}
                          </p>
                          <p className="text-xs text-gray-500">#{ticket.id}</p>
                        </div>
                      </div>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">Expired</span>
                    </div>
                    <div className="space-y-1 text-xs text-gray-500">
                      <div className="flex justify-between"><span>Passenger:</span><span>{ticket.passenger_name}</span></div>
                      <div className="flex justify-between"><span>Car:</span><span>{ticket.car_plate}</span></div>
                      <div className="flex justify-between"><span>Departure:</span><span>{new Date(ticket.travel_time).toLocaleString()}</span></div>
                      <div className="flex justify-between"><span>Price:</span><span>{Number(ticket.price).toLocaleString()} RWF</span></div>
                    </div>
                    <div className="mt-3">
                      <button
                        onClick={() => deleteTicket(ticket.id)}
                        className="w-full text-xs text-red-500 border border-red-200 py-1.5 rounded-lg hover:bg-red-50 transition"
                      >
                        Remove Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FEATURES SECTION */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">{t.whyChoose}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 border border-gray-100 rounded-xl hover:shadow-lg transition">
                <div className="text-indigo-600 mb-4 flex justify-center">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">{t.readyToTravel}</h2>
        <p className="text-lg mb-6">{t.bookNowCTA}</p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-white text-indigo-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition"
        >
          {t.searchRoutes}
        </button>
      </div>

      {/* BOOKING FORM MODAL */}
      {showBookingForm && selectedCar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">{t.bookTicket}</h2>
                <p className="text-indigo-100 text-xs">{t.step} 1 {t.of} 2</p>
              </div>
              <button onClick={() => setShowBookingForm(false)} className="p-1 rounded-lg hover:bg-white/10">
                <X size={18} className="text-white" />
              </button>
            </div>

            <div className="p-5">
              <form className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-3 text-sm mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">{t.route}:</span>
                    <span className="font-medium">{selectedCar.travel_from} → {selectedCar.travel_to}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-500">{t.departure}:</span>
                    <span className="font-medium">{new Date(selectedCar.travel_time).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t.price}:</span>
                    <span className="font-bold text-indigo-600">{parseFloat(selectedCar.price_amount).toLocaleString()} RWF</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.fullName} *</label>
                  <input
                    type="text"
                    name="passenger_name"
                    required
                    value={bookingData.passenger_name}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.phoneNumber} *</label>
                  <input
                    type="tel"
                    name="phone_number"
                    required
                    value={bookingData.phone_number}
                    onChange={handleBookingInputChange}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., 0788123456"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleProceedToPayment(selectedCar)}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
                >
                  {t.continueToPayment}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      <PaymentModal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        amount={paymentAmount}
        onSuccess={handlePaymentSuccess}
        passengerName={bookingData.passenger_name}
        phoneNumber={bookingData.phone_number}
        route={paymentRoute}
      />

      {/* MAP MODAL */}
      {showMap && selectedRouteMap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">{t.routeMap}</h2>
                <p className="text-indigo-100 text-sm">
                  {selectedRouteMap.travel_from} → {selectedRouteMap.travel_to}
                </p>
              </div>
              <button onClick={() => setShowMap(false)} className="text-white hover:bg-white/20 p-1 rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <RouteMap 
                from={selectedRouteMap.travel_from} 
                to={selectedRouteMap.travel_to}
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">{t.departure}</p>
                  <p className="font-semibold">{new Date(selectedRouteMap.travel_time).toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500">{t.duration}</p>
                  <p className="font-semibold">~{getDuration(selectedRouteMap.travel_from, selectedRouteMap.travel_to)} {t.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TICKET MODAL */}
      {showTicketModal && generatedTicket && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-4 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">✓ {t.bookingConfirmed}</h2>
                <p className="text-emerald-100 text-xs">{t.ticketIssued}</p>
              </div>
              <button onClick={() => setShowTicketModal(false)} className="text-white hover:bg-white/10 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div id="ticket-content" className="p-5">
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                  <Ticket size={28} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">ROT Transport Ticket</h3>
                <p className="text-xs text-gray-500">Rwanda Online Transport</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b">
                  <span className="text-gray-500">Ticket ID:</span>
                  <span className="font-mono font-bold">#{generatedTicket.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Passenger:</span>
                  <span className="font-medium">{generatedTicket.passenger_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Phone:</span>
                  <span>{generatedTicket.phone_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.route}:</span>
                  <span className="font-medium">{generatedTicket.travel_from} → {generatedTicket.travel_to}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Car:</span>
                  <span>{generatedTicket.car_plate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.departure}:</span>
                  <span>{new Date(generatedTicket.travel_time).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.company}:</span>
                  <span>{generatedTicket.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{t.price}:</span>
                  <span className="font-bold text-indigo-600">{parseFloat(generatedTicket.price).toLocaleString()} RWF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-emerald-600 font-medium">{t.active}</span>
                </div>
              </div>

              {generatedTicket.qr_code && (
                <div className="mt-4 pt-4 border-t text-center">
                  <p className="text-xs text-gray-500 mb-2">{t.scanToVerify}</p>
                  <img src={generatedTicket.qr_code} alt="QR Code" className="w-32 h-32 mx-auto border rounded-lg" />
                </div>
              )}

              {generatedTicket.verification_code && (
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">Verification Code</p>
                  <p className="text-sm font-mono font-bold text-indigo-600">{generatedTicket.verification_code}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-xs text-gray-400">{t.presentThisTicket}</p>
              </div>
            </div>

            <div className="p-5 pt-0 flex gap-3">
              <button
                onClick={() => downloadTicket(generatedTicket)}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2"
              >
                <Download size={16} />
                {t.downloadTicket}
              </button>
              <button
                onClick={() => setShowTicketModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />

      <style>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 75%; }
        }
        .animate-progress {
          animation: progress 2s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Home;