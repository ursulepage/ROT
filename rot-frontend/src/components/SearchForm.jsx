// src/components/SearchForm.jsx

import { useState } from "react";
import { MapPin, Search, Calendar } from "lucide-react";

function SearchForm({ onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");

  // Popular routes in Rwanda
  const routes = [
    "Kigali",
    "Muhanga",
    "Gisenyi",
    "Huye",
    "Ruhengeri",
    "Gitarama",
    "Kibuye",
  ];

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const handleFromChange = (value) => {
    setFrom(value);
    if (value.length > 0) {
      const filtered = routes.filter((route) =>
        route.toLowerCase().includes(value.toLowerCase())
      );
      setFromSuggestions(filtered);
      setShowFromSuggestions(true);
    } else {
      setShowFromSuggestions(false);
    }
  };

  const handleToChange = (value) => {
    setTo(value);
    if (value.length > 0) {
      const filtered = routes.filter((route) =>
        route.toLowerCase().includes(value.toLowerCase())
      );
      setToSuggestions(filtered);
      setShowToSuggestions(true);
    } else {
      setShowToSuggestions(false);
    }
  };

  const handleSelectFrom = (route) => {
    setFrom(route);
    setShowFromSuggestions(false);
  };

  const handleSelectTo = (route) => {
    setTo(route);
    setShowToSuggestions(false);
  };

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!from || !to) {
      alert("Please select both departure and arrival locations");
      return;
    }

    if (from === to) {
      alert("Departure and arrival locations must be different");
      return;
    }

    onSearch(from, to);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 md:p-8 rounded-2xl shadow-xl"
    >
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-3">
        {/* FROM LOCATION */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            FROM
          </label>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Departure city"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={from}
              onChange={(e) => handleFromChange(e.target.value)}
              onFocus={() => from && setShowFromSuggestions(true)}
            />
            {showFromSuggestions && fromSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                {fromSuggestions.map((route) => (
                  <button
                    key={route}
                    type="button"
                    onClick={() => handleSelectFrom(route)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition text-sm text-gray-700"
                  >
                    {route}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* TO LOCATION */}
        <div className="relative">
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            TO
          </label>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Arrival city"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              onFocus={() => to && setShowToSuggestions(true)}
            />
            {showToSuggestions && toSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 shadow-lg z-10">
                {toSuggestions.map((route) => (
                  <button
                    key={route}
                    type="button"
                    onClick={() => handleSelectTo(route)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 transition text-sm text-gray-700"
                  >
                    {route}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* DATE */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            DATE
          </label>
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
            <input
              type="date"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* SWAP BUTTON (DESKTOP ONLY) */}
        <div className="hidden lg:flex items-end">
          <button
            type="button"
            onClick={handleSwap}
            className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg transition text-gray-600 font-semibold"
          >
            ⇄
          </button>
        </div>

        {/* SEARCH BUTTON */}
        <div className="flex items-end gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-all duration-300 flex items-center justify-center gap-2 text-sm md:text-base"
          >
            <Search size={18} />
            Search
          </button>
        </div>
      </div>

      {/* SWAP BUTTON (MOBILE) */}
      <div className="lg:hidden flex justify-center mt-4">
        <button
          type="button"
          onClick={handleSwap}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition text-gray-600 font-semibold"
        >
          ⇄ Swap
        </button>
      </div>
    </form>
  );
}

export default SearchForm;