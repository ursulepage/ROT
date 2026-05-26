// src/pages/Login.jsx

import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { 
  Globe, ChevronDown, LogIn, UserPlus, Building, Mail, Lock, 
  Phone, Globe as GlobeIcon, Eye, EyeOff, ArrowLeft 
} from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [currentLang, setCurrentLang] = useState("en");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetStep, setResetStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
      signup: "Sign Up",
      emailPhone: "Email / Phone / Station Name",
      password: "Password",
      loginBtn: "Login",
      managerEmail: "Manager Email",
      phoneNumber: "Phone Number",
      selectCompany: "Select Company",
      companyWebsite: "Company Website (Optional)",
      createAccount: "Create Manager Account",
      home: "Home",
      forgotPassword: "Forgot Password?",
      resetPassword: "Reset Password",
      enterEmail: "Enter your email address",
      sendCode: "Send Reset Code",
      enterCode: "Enter verification code",
      newPassword: "New Password",
      confirmPassword: "Confirm Password",
      resetBtn: "Reset Password",
      backToLogin: "Back to Login",
      codeSent: "Reset code sent to your email",
      passwordReset: "Password reset successful",
      invalidCode: "Invalid verification code",
      passwordsNotMatch: "Passwords do not match",
      emailRequired: "Email is required",
      resetSuccess: "Password reset successfully! Please login.",
    },
    fr: {
      title: "SYSTÈME ROT",
      subtitle: "Transport en Ligne du Rwanda",
      login: "Connexion",
      signup: "Inscription",
      emailPhone: "Email / Téléphone / Nom de la Gare",
      password: "Mot de passe",
      loginBtn: "Se connecter",
      managerEmail: "Email du Gestionnaire",
      phoneNumber: "Numéro de Téléphone",
      selectCompany: "Sélectionner une Compagnie",
      companyWebsite: "Site Web de la Compagnie (Optionnel)",
      createAccount: "Créer un Compte Gestionnaire",
      home: "Accueil",
      forgotPassword: "Mot de passe oublié?",
      resetPassword: "Réinitialiser",
      enterEmail: "Entrez votre adresse email",
      sendCode: "Envoyer le code",
      enterCode: "Entrez le code de vérification",
      newPassword: "Nouveau mot de passe",
      confirmPassword: "Confirmer",
      resetBtn: "Réinitialiser",
      backToLogin: "Retour",
      codeSent: "Code envoyé à votre email",
      passwordReset: "Réinitialisation réussie",
      invalidCode: "Code invalide",
      passwordsNotMatch: "Les mots de passe ne correspondent pas",
      emailRequired: "Email requis",
      resetSuccess: "Mot de passe réinitialisé! Veuillez vous connecter.",
    },
    rw: {
      title: "ROT SISTEMU",
      subtitle: "Ubwikorezi bwa Rwanda Online",
      login: "Injira",
      signup: "Iyandikishe",
      emailPhone: "E-mail / Telefone / Izina rya Gare",
      password: "Ijambobanga",
      loginBtn: "Injira",
      managerEmail: "E-mail y'Umuyobozi",
      phoneNumber: "Nimero ya Telefone",
      selectCompany: "Hitamo Isosiyete",
      companyWebsite: "Urubuga rwa Isosiyete (Gushaka)",
      createAccount: "Rema Konti y'Umuyobozi",
      home: "Ahabanza",
      forgotPassword: "Wibagiwe ijambobanga?",
      resetPassword: "Subiza ijambobanga",
      enterEmail: "Andika e-mail yawe",
      sendCode: "Ohereza kode",
      enterCode: "Andika kode ya verification",
      newPassword: "Ijambobanga rishya",
      confirmPassword: "Emeza ijambobanga",
      resetBtn: "Subiza",
      backToLogin: "Garuka",
      codeSent: "Kode yoherejwe kuri e-mail",
      passwordReset: "Ijambobanga risubiwe",
      invalidCode: "Kode itari yo",
      passwordsNotMatch: "Ijambobanga ntirihuye",
      emailRequired: "E-mail irakenewe",
      resetSuccess: "Ijambobanga risubiwe! Injira.",
    },
  };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phone_number: "",
    company_id: "",
    link_of_company_web: "",
  });

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/login", {
        identifier: formData.email,
        password: formData.password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user || res.data.driver || res.data.station));

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
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetCode = async () => {
    if (!resetEmail) {
      alert(t[currentLang].emailRequired);
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/send-verification", {
        phoneNumber: resetEmail,
      });
      alert(t[currentLang].codeSent);
      setResetStep(2);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert(t[currentLang].passwordsNotMatch);
      return;
    }
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/verify-code", {
        phoneNumber: resetEmail,
        code: resetCode,
      });
      
      await axios.post("http://localhost:5000/api/reset-password", {
        email: resetEmail,
        newPassword: newPassword,
      });
      
      alert(t[currentLang].resetSuccess);
      setShowForgotPassword(false);
      setResetStep(1);
      setResetEmail("");
      setResetCode("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      alert(error.response?.data?.message || t[currentLang].invalidCode);
    } finally {
      setLoading(false);
    }
  };

  const currentLanguage = languages.find(l => l.code === currentLang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navbar with Shadow */}
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

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition"
              >
                <ArrowLeft size={18} />
                <span className="hidden sm:inline text-sm">{t[currentLang].home}</span>
              </Link>

              {/* Language Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowLangDropdown(!showLangDropdown)}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition"
                >
                  <Globe size={16} />
                  <span>{currentLanguage?.flag}</span>
                  <ChevronDown size={14} />
                </button>

                {showLangDropdown && (
                  <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang.code);
                          setShowLangDropdown(false);
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
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="flex items-center justify-center p-5 min-h-[calc(100vh-65px)]">
        <div className="w-full max-w-md">
          {/* Forgot Password Modal */}
          {showForgotPassword ? (
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-6">
                <img src="/ROT.png" alt="ROT" className="w-16 h-16 mx-auto object-contain" />
                <h2 className="text-2xl font-bold text-gray-800 mt-3">{t[currentLang].resetPassword}</h2>
                <p className="text-gray-500 text-sm mt-1">
                  {resetStep === 1 ? t[currentLang].enterEmail : t[currentLang].enterCode}
                </p>
              </div>

              {resetStep === 1 ? (
                <div className="space-y-4">
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    onClick={handleSendResetCode}
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading ? "Sending..." : t[currentLang].sendCode}
                  </button>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
                  >
                    {t[currentLang].backToLogin}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Verification code"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t[currentLang].newPassword}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-gray-200 p-3 pl-10 pr-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={t[currentLang].confirmPassword}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border border-gray-200 p-3 pl-10 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <button
                    onClick={handleResetPassword}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
                  >
                    {loading ? "Resetting..." : t[currentLang].resetBtn}
                  </button>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetStep(1);
                    }}
                    className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm"
                  >
                    {t[currentLang].backToLogin}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Login/Signup Card
            <div className="bg-white rounded-2xl shadow-xl p-8">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <img
                  src="/ROT.png"
                  alt="ROT"
                  className="w-20 h-20 object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://via.placeholder.com/80?text=ROT";
                  }}
                />
                <h1 className="text-2xl font-bold mt-3 text-gray-800">{t[currentLang].title}</h1>
                <p className="text-gray-500 text-sm mt-1">{t[currentLang].subtitle}</p>
              </div>

              {/* Toggle Buttons */}
              <div className="flex mb-6 bg-gray-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`w-1/2 py-3 font-semibold transition flex items-center justify-center gap-2 ${
                    isLogin
                      ? "bg-indigo-600 text-white"
                      : "bg-transparent text-gray-700 hover:bg-gray-200"
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
                      : "bg-transparent text-gray-700 hover:bg-gray-200"
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

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      {t[currentLang].forgotPassword}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Loading..." : t[currentLang].loginBtn}
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
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? "Creating..." : t[currentLang].createAccount}
                  </button>
                </form>
              )}

              {/* Footer Note */}
              <p className="text-center text-xs text-gray-400 mt-6">
                &copy; {new Date().getFullYear()} ROT System. All rights reserved.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;