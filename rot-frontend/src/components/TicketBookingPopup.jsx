// src/components/TicketBookingPopup.jsx

import { useState, useEffect } from "react";
import { X, MapPin, Clock, Users, CreditCard, Phone, User } from "lucide-react";
import { searchAvailableCars, bookTicket } from "../services/ticket.js";
import { fakePayment } from "../services/payment.js";

function TicketBookingPopup({ isOpen, onClose, locationId, routeInfo }) {
  const [step, setStep] = useState(1); // 1: Route, 2: Car, 3: Passenger, 4: Payment
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [passengerData, setPassengerData] = useState({
    passenger_name: "",
    phone_number: "",
  });

  const [paymentData, setPaymentData] = useState({
    payment_method: "MTN",
    payment_status: "pending",
  });

  // Fetch available cars when route is selected
  useEffect(() => {
    if (isOpen && step === 2 && locationId) {
      fetchAvailableCars();
    }
  }, [isOpen, step, locationId]);

  const fetchAvailableCars = async () => {
    try {
      setLoading(true);
      const response = await searchAvailableCars(locationId);
      if (response.success) {
        setAvailableCars(response.cars || response.data || []);
      }
    } catch (error) {
      setBookingError("Failed to load available cars");
    } finally {
      setLoading(false);
    }
  };

  const handlePassengerChange = (e) => {
    const { name, value } = e.target;
    setPassengerData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectCar = (car) => {
    setSelectedCar(car);
    setStep(3);
  };

  const handleContinueToPayment = () => {
    if (!passengerData.passenger_name || !passengerData.phone_number) {
      setBookingError("Please fill in all passenger details");
      return;
    }
    setStep(4);
  };

  const handleBookTicket = async () => {
    if (!selectedCar) {
      setBookingError("No car selected");
      return;
    }

    try {
      setLoading(true);
      setBookingError("");

      // Process payment first (fake payment)
      const paymentResponse = await fakePayment(selectedCar.price_amount);

      if (!paymentResponse.success) {
        setBookingError("Payment failed");
        return;
      }

      // Book ticket
      const ticketData = {
        passenger_name: passengerData.passenger_name,
        phone_number: passengerData.phone_number,
        launch_car_id: selectedCar.id,
        price: selectedCar.price_amount,
        location_id: locationId,
        car_plate: selectedCar.car_plate,
        travel_time: selectedCar.travel_time,
        payment_method: paymentData.payment_method,
        payment_status: "completed",
      };

      const bookingResponse = await bookTicket(ticketData);

      if (bookingResponse.success) {
        alert(
          `Ticket booked successfully!\nVerification Code: ${bookingResponse.verificationCode}`
        );
        // Show ticket details
        console.log("Ticket booked:", bookingResponse);
        handleClose();
      } else {
        setBookingError(bookingResponse.message || "Booking failed");
      }
    } catch (error) {
      setBookingError(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedCar(null);
    setAvailableCars([]);
    setPassengerData({ passenger_name: "", phone_number: "" });
    setPaymentData({ payment_method: "MTN", payment_status: "pending" });
    setBookingError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Book Your Ticket</h2>
            <p className="text-sm text-gray-500">Step {step} of 4</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* PROGRESS BAR */}
        <div className="flex gap-2 px-6 py-4 bg-gray-50">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-all ${
                s <= step ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        <div className="p-6 space-y-6">
          {/* ERROR MESSAGE */}
          {bookingError && (
            <div className="p-4 bg-red-100 border border-red-300 rounded-lg text-red-700">
              {bookingError}
            </div>
          )}

          {/* STEP 1: ROUTE INFO (Display Only) */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-4">
                  <MapPin size={24} className="text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Route</p>
                    <p className="text-lg font-bold text-gray-800">
                      {routeInfo?.from} → {routeInfo?.to}
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Select a Bus
              </button>
            </div>
          )}

          {/* STEP 2: SELECT CAR */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800">Available Buses</h3>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto"></div>
                  <p className="text-gray-600 mt-2">Loading buses...</p>
                </div>
              ) : availableCars.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {availableCars.map((car) => (
                    <div
                      key={car.id}
                      onClick={() => handleSelectCar(car)}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 cursor-pointer transition"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-bold text-gray-800">{car.car_name}</p>
                          <p className="text-sm text-gray-600">Plate: {car.car_plate}</p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {car.price_amount || car.price} RWF
                        </p>
                      </div>
                      <div className="flex gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {car.travel_time}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} />
                          {car.available_sits} seats available
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No available buses for this route
                </div>
              )}
            </div>
          )}

          {/* STEP 3: PASSENGER INFO */}
          {step === 3 && selectedCar && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-gray-600">Selected Bus</p>
                <p className="font-bold text-green-700">{selectedCar.car_name}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Passenger Name
                  </label>
                  <input
                    type="text"
                    name="passenger_name"
                    value={passengerData.passenger_name}
                    onChange={handlePassengerChange}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone size={16} className="inline mr-2" />
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone_number"
                    value={passengerData.phone_number}
                    onChange={handlePassengerChange}
                    placeholder="Enter your phone number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                onClick={handleContinueToPayment}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* STEP 4: PAYMENT */}
          {step === 4 && selectedCar && (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Passenger:</span>
                    <span className="font-semibold">{passengerData.passenger_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700">Bus:</span>
                    <span className="font-semibold">{selectedCar.car_name}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-yellow-700">
                    <span>Total:</span>
                    <span>{selectedCar.price_amount || selectedCar.price} RWF</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard size={16} className="inline mr-2" />
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={paymentData.payment_method}
                  onChange={handlePaymentChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MTN">MTN Mobile Money</option>
                  <option value="AIRTEL">Airtel Money</option>
                  <option value="CASH">Cash at Station</option>
                </select>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={handleBookTicket}
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? "Processing..." : "Complete Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketBookingPopup;
