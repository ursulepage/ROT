// src/components/TicketForm.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import {
  X,
  Bus,
  MapPin,
  CreditCard,
  Phone,
  User,
} from "lucide-react";

function TicketForm({
  ticket,
  onClose,
  onSuccess,
}) {

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  const [locations, setLocations] = useState([]);
  const [cars, setCars] = useState([]);

  const [formData, setFormData] = useState({
    passenger_name: "",
    phone_number: "",
    location_id: "",
    launch_car_id: "",
    payment_method: "MTN",
    payment_status: "paid",
  });

  const [selectedLocation, setSelectedLocation] =
    useState(null);

  const [selectedCar, setSelectedCar] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  // =====================================================
  // FETCH LOCATIONS
  // =====================================================

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {

    try {

      const token =
        localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/locations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLocations(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // FETCH AVAILABLE CARS
  // =====================================================

  const fetchCars = async (locationId) => {

    try {

      const response = await axios.get(
        `${API_URL}/available-cars/${locationId}`
      );

      setCars(response.data);

    } catch (error) {
      console.error(error);
    }
  };

  // =====================================================
  // HANDLE LOCATION
  // =====================================================

  const handleLocationChange = (e) => {

    const value = e.target.value;

    setFormData({
      ...formData,
      location_id: value,
      launch_car_id: "",
    });

    const location = locations.find(
      (l) => l.id == value
    );

    setSelectedLocation(location);

    fetchCars(value);
  };

  // =====================================================
  // HANDLE CAR
  // =====================================================

  const handleCarChange = (e) => {

    const value = e.target.value;

    setFormData({
      ...formData,
      launch_car_id: value,
    });

    const car = cars.find(
      (c) => c.id == value
    );

    setSelectedCar(car);
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      // ============================================
      // PAYMENT FIRST
      // ============================================

      const payment = await axios.post(
        `${API_URL}/fake-payment`,
        {
          phone_number:
            formData.phone_number,

          amount:
            selectedLocation.price_amount,

          payment_method:
            formData.payment_method,
        }
      );

      // ============================================
      // CREATE TICKET
      // ============================================

      await axios.post(
        `${API_URL}/book-ticket`,
        {
          passenger_name:
            formData.passenger_name,

          phone_number:
            formData.phone_number,

          launch_car_id:
            selectedCar.id,

          price:
            selectedLocation.price_amount,

          location_id:
            selectedLocation.id,

          car_plate:
            selectedCar.car_plate,

          travel_time:
            selectedCar.travel_time,

          payment_method:
            formData.payment_method,

          payment_status:
            payment.data.success
              ? "paid"
              : "failed",
        }
      );

      alert("Ticket Created Successfully");

      if (onSuccess) {
        onSuccess();
      }

      onClose();

    } catch (error) {

      console.error(error);

      alert(
        error.response?.data?.message ||
          "Failed to create ticket"
      );

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">

        {/* HEADER */}

        <div className="bg-purple-900 text-white p-6 flex justify-between items-center">

          <div>
            <h2 className="text-2xl font-bold">
              Create Ticket
            </h2>

            <p className="text-purple-200">
              Rwanda Online Transport
            </p>
          </div>

          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-xl"
          >
            <X size={22} />
          </button>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >

          {/* PASSENGER */}

          <div>

            <label className="font-semibold text-gray-700 mb-2 block">
              Passenger Name
            </label>

            <div className="relative">

              <User
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />

              <input
                type="text"
                required
                value={formData.passenger_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    passenger_name:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-900"
                placeholder="Enter passenger name"
              />
            </div>
          </div>

          {/* PHONE */}

          <div>

            <label className="font-semibold text-gray-700 mb-2 block">
              Phone Number
            </label>

            <div className="relative">

              <Phone
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />

              <input
                type="text"
                required
                value={formData.phone_number}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone_number:
                      e.target.value,
                  })
                }
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-900"
                placeholder="07XXXXXXXX"
              />
            </div>
          </div>

          {/* LOCATION */}

          <div>

            <label className="font-semibold text-gray-700 mb-2 block">
              Select Route
            </label>

            <div className="relative">

              <MapPin
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />

              <select
                required
                value={formData.location_id}
                onChange={handleLocationChange}
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-900"
              >

                <option value="">
                  Choose route
                </option>

                {locations.map((location) => (

                  <option
                    key={location.id}
                    value={location.id}
                  >
                    {location.travel_from}
                    {" → "}
                    {location.travel_to}
                    {" | "}
                    {location.price_amount} RWF
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* CAR */}

          <div>

            <label className="font-semibold text-gray-700 mb-2 block">
              Available Cars
            </label>

            <div className="relative">

              <Bus
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />

              <select
                required
                value={formData.launch_car_id}
                onChange={handleCarChange}
                className="w-full border rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-purple-900"
              >

                <option value="">
                  Choose car
                </option>

                {cars.map((car) => (

                  <option
                    key={car.id}
                    value={car.id}
                  >
                    {car.car_name}
                    {" | "}
                    {car.car_plate}
                    {" | "}
                    Seats:
                    {" "}
                    {car.available_sits}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PAYMENT */}

          <div>

            <label className="font-semibold text-gray-700 mb-3 block">
              Payment Method
            </label>

            <div className="grid grid-cols-2 gap-4">

              {/* MTN */}

              <label
                className={`border-2 rounded-2xl p-4 cursor-pointer transition ${
                  formData.payment_method ===
                  "MTN"
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200"
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="MTN"
                  checked={
                    formData.payment_method ===
                    "MTN"
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_method:
                        e.target.value,
                    })
                  }
                  hidden
                />

                <div className="flex items-center gap-3">

                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/9/93/New-mtn-logo.jpg"
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div>
                    <h3 className="font-bold">
                      MTN Mobile Money
                    </h3>

                    <p className="text-sm text-gray-500">
                      Instant payment
                    </p>
                  </div>
                </div>
              </label>

              {/* AIRTEL */}

              <label
                className={`border-2 rounded-2xl p-4 cursor-pointer transition ${
                  formData.payment_method ===
                  "AIRTEL"
                    ? "border-red-400 bg-red-50"
                    : "border-gray-200"
                }`}
              >

                <input
                  type="radio"
                  name="payment"
                  value="AIRTEL"
                  checked={
                    formData.payment_method ===
                    "AIRTEL"
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      payment_method:
                        e.target.value,
                    })
                  }
                  hidden
                />

                <div className="flex items-center gap-3">

                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Airtel_logo.svg"
                    alt=""
                    className="w-12 h-12 rounded-full object-cover bg-white p-1"
                  />

                  <div>
                    <h3 className="font-bold">
                      Airtel Money
                    </h3>

                    <p className="text-sm text-gray-500">
                      Secure payment
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* SUMMARY */}

          {selectedLocation && selectedCar && (

            <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5 space-y-2">

              <h3 className="font-bold text-purple-900 text-lg">
                Ticket Summary
              </h3>

              <div className="flex justify-between">
                <span>Route</span>

                <span className="font-semibold">
                  {selectedLocation.travel_from}
                  {" → "}
                  {selectedLocation.travel_to}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Car</span>

                <span className="font-semibold">
                  {selectedCar.car_plate}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Travel Time</span>

                <span className="font-semibold">
                  {new Date(
                    selectedCar.travel_time
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Total Price</span>

                <span className="font-black text-2xl text-purple-900">
                  {selectedLocation.price_amount} RWF
                </span>
              </div>
            </div>
          )}

          {/* BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-900 hover:bg-purple-800 text-white py-4 rounded-2xl font-bold text-lg transition"
          >

            {loading
              ? "Processing Payment..."
              : "Pay & Create Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TicketForm;