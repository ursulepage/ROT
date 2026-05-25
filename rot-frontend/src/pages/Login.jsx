// src/pages/Login.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Globe, ChevronDown, Home, LogIn, UserPlus, Building, Mail, Lock, Phone, Globe as GlobeIcon } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");

  // Language options
  const languages = [
    { code: "en", name: "English", flag: "🇬🇧" },
    { code: "fr", name: "Français", flag: "🇫🇷" },
    { code: "rw", name: "Kinyarwanda", flag: "🇷🇼" },
  ];

  // Translations
  const t = {
    en: {
      title: "ROT SYSTEM",
      subtitle: "Rwanda Online Transport",
      login: "Login",
      signup: "Signup",
      emailPhone: "Email / Phone / Station Name",
      password: "Password",
      loginBtn: "LOGIN",
      managerEmail: "Manager Email",
      phoneNumber: "Phone Number",
      selectCompany: "Select Company",
      companyWebsite: "Company Website",
      createAccount: "CREATE MANAGER ACCOUNT",
      home: "Home",
    },
    fr: {
      title: "SYSTÈME ROT",
      subtitle: "Transport en Ligne du Rwanda",
      login: "Connexion",
      signup: "Inscription",
      emailPhone: "Email / Téléphone / Nom de la Gare",
      password: "Mot de passe",
      loginBtn: "CONNEXION",
      managerEmail: "Email du Gestionnaire",
      phoneNumber: "Numéro de Téléphone",
      selectCompany: "Sélectionner une Compagnie",
      companyWebsite: "Site Web de la Compagnie",
      createAccount: "CRÉER UN COMPTE GESTIONNAIRE",
      home: "Accueil",
    },
    rw: {
      title: "ROT SISTEMU",
      subtitle: "Ubwikorezi bwa Rwanda Online",
      login: "Injira",
      signup: "Iyandikishe",
      emailPhone: "E-mail / Telefone / Izina rya Gare",
      password: "Ijambobanga",
      loginBtn: "INJIRA",
      managerEmail: "E-mail y'Umuyobozi",
      phoneNumber: "Nimero ya Telefone",
      selectCompany: "Hitamo Isosiyete",
      companyWebsite: "Urubuga rwa Isosiyete",
      createAccount: "REMA KONTI Y'UMUYOBOZI",
      home: "Ahabanza",
    },
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone_number: "",
    company_id: "",
    link_of_company_web: "",
  });

  // =========================================
  // GET COMPANIES
  // =========================================

  useEffect(() => {
    axios
      .get("http://localhost:5000/company")
      .then((res) => {
        setCompanies(res.data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // =========================================
  // HANDLE INPUT
  // =========================================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================================
  // LOGIN
  // =========================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:5000/login", {
        identifier: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || res.data.driver || res.data.station));

      // =====================================
      // ROLE NAVIGATION
      // =====================================

      if (res.data.role === "admin") {
        navigate("/admin/dashboard");
      } else if (res.data.role === "company-manager") {
        navigate("/manager/dashboard");
      } else if (res.data.role === "station") {
        navigate("/station/dashboard");
      } else if (res.data.role === "driver") {
        navigate("/driver/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.log(error);
      alert(error?.response?.data?.message || "Invalid credentials");
    }
  };

  // =========================================
  // REGISTER MANAGER
  // =========================================

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/manager", formData);
      alert("Manager account created successfully! Please login.");
      setIsLogin(true);
      setFormData({
        email: "",
        password: "",
        phone_number: "",
        company_id: "",
        link_of_company_web: "",
      });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* NAVBAR */}
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

            {/* Right side - Home button and Language */}
            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <Home size={18} />
                <span className="hidden sm:inline">{t[currentLang].home}</span>
              </Link>

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  <Globe size={16} className="text-gray-600" />
                  <span>{currentLanguage?.flag} {currentLanguage?.name}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setShowLangDropdown(false);
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
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex items-center justify-center p-5 min-h-[calc(100vh-73px)]">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

          {/* LOGO */}
          <div className="flex flex-col items-center mb-6">
            <img
              src="/ROT.png"
              alt="ROT"
              className="w-24 h-24 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://via.placeholder.com/96?text=ROT";
              }}
            />
            <h1 className="text-3xl font-bold mt-3 text-slate-800">{t[currentLang].title}</h1>
            <p className="text-gray-500 text-sm mt-1">{t[currentLang].subtitle}</p>
          </div>

          {/* TOGGLE */}
          <div className="flex mb-6 bg-slate-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsLogin(true)}
              className={`w-1/2 py-3 font-semibold transition flex items-center justify-center gap-2 ${
                isLogin
                  ? "bg-indigo-600 text-white"
                  : "bg-transparent text-slate-700 hover:bg-slate-100"
              }`}
            >
              <LogIn size={16} />
              {t[currentLang].login}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`w-1/2 py-3 font-semibold transition flex items-center justify-center gap-2 ${
                !isLogin
                  ? "bg-emerald-600 text-white"
                  : "bg-transparent text-slate-700 hover:bg-slate-100"
              }`}
            >
              <UserPlus size={16} />
              {t[currentLang].signup}
            </button>
          </div>

          {/* LOGIN FORM */}
          {isLogin ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="email"
                  placeholder={t[currentLang].emailPhone}
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder={t[currentLang].password}
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <LogIn size={18} />
                {t[currentLang].loginBtn}
              </button>
            </form>
          ) : (
            // SIGNUP FORM
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder={t[currentLang].managerEmail}
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder={t[currentLang].password}
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="phone_number"
                  placeholder={t[currentLang].phoneNumber}
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* COMPANY SELECT */}
              <div className="relative">
                <Building size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  name="company_id"
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                  onChange={handleChange}
                  required
                >
                  <option value="">{t[currentLang].selectCompany}</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <GlobeIcon size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="link_of_company_web"
                  placeholder={t[currentLang].companyWebsite}
                  className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  onChange={handleChange}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2"
              >
                <UserPlus size={18} />
                {t[currentLang].createAccount}
              </button>
            </form>
          )}

          {/* Footer Note */}
          <p className="text-center text-xs text-gray-400 mt-6">
            &copy; {new Date().getFullYear()} ROT System. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;