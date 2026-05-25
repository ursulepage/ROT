// src/components/Navbar.jsx

import { Link, useNavigate } from "react-router-dom";
import { Globe, ChevronDown, User, LogIn, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

function Navbar({ currentLang, setCurrentLang, languages, showLangDropdown, setShowLangDropdown }) {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const currentLanguage = languages?.find(l => l.code === currentLang) || languages[0];

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

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-xl text-gray-800">ROT</span>
              <p className="text-xs text-gray-500 -mt-1">Transport</p>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown?.(!showLangDropdown)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <Globe size={16} className="text-gray-600" />
                <span>{currentLanguage?.flag} {currentLanguage?.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showLangDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {languages?.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setCurrentLang?.(lang.code);
                        setShowLangDropdown?.(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm ${
                        currentLang === lang.code ? "bg-indigo-50 text-indigo-600" : ""
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
                  className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitial()}
                  </div>
                  <ChevronDown size={14} className="text-gray-600" />
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
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
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-3">
            {/* Language selector for mobile */}
            <div className="flex flex-wrap gap-2">
              {languages?.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setCurrentLang?.(lang.code);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm flex items-center gap-1 ${
                    currentLang === lang.code
                      ? "bg-indigo-100 text-indigo-700"
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
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
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