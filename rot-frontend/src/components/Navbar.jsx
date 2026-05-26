// src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { Globe, ChevronDown, LogIn, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

function Navbar({ currentLang, setCurrentLang, languages, showLangDropdown, setShowLangDropdown }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentLanguage = languages?.find(l => l.code === currentLang) || languages?.[0];

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    if (token && user) {
      setIsLoggedIn(true);
      try {
        const userData = JSON.parse(user);
        setUserRole(userData.role || userData.roles);
      } catch (e) {
        console.error("Error parsing user:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setUserRole(null);
    navigate("/");
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case "admin":
        return "/admin/dashboard";
      case "company-manager":
        return "/manager/dashboard";
      case "station":
        return "/station/dashboard";
      case "driver":
        return "/driver/dashboard";
      default:
        return "/login";
    }
  };

  const getUserInitial = () => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        const name = userData.email || userData.driver_name || userData.station_name || "U";
        return name.charAt(0).toUpperCase();
      } catch (e) {
        return "U";
      }
    }
    return "U";
  };

  // Format date and time
  const formattedDate = currentTime.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
  const formattedTime = currentTime.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <img 
              src="/ROT.png" 
              alt="ROT Logo" 
              className="w-10 h-10 rounded-lg object-cover shadow-sm"
            />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-gray-800">ROT</span>
              <p className="text-xs text-gray-500 -mt-0.5">Transport</p>
            </div>
          </Link>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center gap-4">
            {/* Date & Time */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-700">{formattedTime}</div>
              <div className="text-xs text-gray-400">{formattedDate}</div>
            </div>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown?.(!showLangDropdown)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
              >
                <Globe size={16} />
                <span>{currentLanguage?.flag}</span>
                <ChevronDown size={14} />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {languages?.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang?.(lang.code);
                        setShowLangDropdown?.(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${
                        currentLang === lang.code ? "bg-gray-50 text-indigo-600" : "text-gray-700"
                      }`}
                    >
                      <span>{lang.flag}</span>
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* User Section */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition"
                >
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm">
                    {getUserInitial()}
                  </div>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <Link
                      to={getDashboardLink()}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition shadow-sm"
              >
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            {/* Date & Time for mobile */}
            <div className="flex justify-between items-center px-2 py-2 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">Current Time</span>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">{formattedTime}</div>
                <div className="text-xs text-gray-500">{formattedDate}</div>
              </div>
            </div>

            {/* Language selector for mobile */}
            <div className="flex flex-wrap gap-2 px-2">
              {languages?.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang?.(lang.code);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                    currentLang === lang.code
                      ? "bg-indigo-50 text-indigo-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <span>{lang.flag}</span>
                  {lang.name}
                </button>
              ))}
            </div>

            {/* User section for mobile */}
            {isLoggedIn ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg text-indigo-700"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LogIn size={18} />
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;