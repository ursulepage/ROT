// src/pages/station/VerifyPassenger.jsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  ShieldCheck,
  QrCode,
  CheckCircle,
  XCircle,
  Loader2,
  User,
  MapPin,
  Calendar,
  Car,
  DollarSign,
  Clock,
  AlertCircle,
  Camera,
  Scan,
  ChevronRight,
  History,
  ArrowLeft,
} from "lucide-react";

function VerifyPassenger() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recentVerifications, setRecentVerifications] = useState([]);
  const [showScanner, setShowScanner] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [scanning, setScanning] = useState(false);
  
  const inputRef = useRef(null);

  // Load recent verifications from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentVerifications");
    if (saved) {
      setRecentVerifications(JSON.parse(saved));
    }
    
    // Focus input on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Save verification to history
  const saveToHistory = (verificationCode, success, passengerName) => {
    const newRecord = {
      id: Date.now(),
      code: verificationCode,
      success,
      passengerName,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newRecord, ...recentVerifications].slice(0, 10);
    setRecentVerifications(updated);
    localStorage.setItem("recentVerifications", JSON.stringify(updated));
  };

  // Clear history
  const clearHistory = () => {
    setRecentVerifications([]);
    localStorage.removeItem("recentVerifications");
  };

  // Fetch ticket details before verification
  const fetchTicketDetails = async (code) => {
    try {
      const token = localStorage.getItem("token");
      // You may need to add an endpoint to get ticket details by verification code
      // For now, we'll just verify directly
      return null;
    } catch (error) {
      console.error("Error fetching ticket details:", error);
      return null;
    }
  };

  // Handle verification
  const handleVerify = async (e) => {
    e.preventDefault();

    if (!verificationCode || verificationCode.trim() === "") {
      alert("Please enter a verification code");
      return;
    }

    const code = verificationCode.trim().toUpperCase();
    setLoading(true);
    setTicketDetails(null);

    try {
      const token = localStorage.getItem("token");

      const response = await axios.post(
        `${API_URL}/verify-ticket`,
        { verification_code: code },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Success - passenger allowed
      setResult({
        success: true,
        message: response.data.message || "Passenger verified successfully!",
        code: code,
      });

      // Play success sound (optional - can be removed)
      // new Audio('/success.mp3').play();

      saveToHistory(code, true, "Verified Passenger");
      setVerificationCode("");
      
      // Auto clear result after 5 seconds
      setTimeout(() => {
        setResult(null);
      }, 5000);

    } catch (error) {
      console.error("Verification error:", error);
      
      const errorMessage = error.response?.data?.message || "Verification failed. Invalid or expired ticket.";
      
      setResult({
        success: false,
        message: errorMessage,
        code: code,
      });

      saveToHistory(code, false, null);
      
      // Auto clear error after 5 seconds
      setTimeout(() => {
        setResult(null);
      }, 5000);
      
    } finally {
      setLoading(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // Handle quick verification from history
  const quickVerify = (code) => {
    setVerificationCode(code);
    // Auto-submit after a short delay
    setTimeout(() => {
      handleVerify(new Event("submit"));
    }, 100);
  };

  // Simulate QR scan (for demo - integrates with camera)
  const handleScanClick = () => {
    setShowScanner(true);
    setScanning(true);
    
    // Simulate scanning - in production, integrate with actual QR scanner
    setTimeout(() => {
      setScanning(false);
      // Mock scanned code - in real app, this would come from camera
      const mockScannedCode = "ROT-" + Math.floor(100000 + Math.random() * 900000);
      setVerificationCode(mockScannedCode);
      setShowScanner(false);
      // Auto verify after scan
      setTimeout(() => {
        handleVerify(new Event("submit"));
      }, 500);
    }, 2000);
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* HEADER */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Verify Passenger</h1>
              <p className="text-gray-500 mt-1">Scan QR code or enter verification code to allow passenger entry</p>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* VERIFICATION FORM - Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Ticket Verification</h2>
                    <p className="text-indigo-100 text-sm mt-1">Enter the 6-digit verification code</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Scan size={24} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Form Body */}
              <div className="p-6">
                <form onSubmit={handleVerify} className="space-y-6">
                  {/* Input Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <QrCode size={20} className="text-gray-400" />
                      </div>
                      <input
                        ref={inputRef}
                        type="text"
                        placeholder="Example: ROT-123456 or 123456"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                        className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-mono"
                        autoComplete="off"
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Format: ROT-XXXXXX or just the 6-digit number
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading || !verificationCode.trim()}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={22} className="animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={22} />
                          Verify Passenger
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleScanClick}
                      disabled={scanning}
                      className="px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-4 rounded-xl font-semibold transition-all flex items-center gap-2"
                    >
                      <Camera size={20} />
                      Scan
                    </button>
                  </div>
                </form>

                {/* Scanning Modal */}
                {showScanner && (
                  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center">
                      {scanning ? (
                        <>
                          <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <Camera size={40} className="text-indigo-600" />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">Scanning QR Code</h3>
                          <p className="text-gray-500">Position the QR code in frame...</p>
                          <div className="mt-4 w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-indigo-300">
                            <div className="w-32 h-32 border-2 border-indigo-500 rounded-lg"></div>
                          </div>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={48} className="mx-auto text-emerald-500 mb-4" />
                          <h3 className="text-xl font-bold text-gray-800 mb-2">QR Code Scanned!</h3>
                          <p className="text-gray-500">Code detected. Verifying...</p>
                        </>
                      )}
                      <button
                        onClick={() => setShowScanner(false)}
                        className="mt-6 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* RESULT DISPLAY */}
                {result && (
                  <div
                    className={`mt-6 rounded-xl p-5 border-2 animate-in slide-in-from-top duration-300 ${
                      result.success
                        ? "bg-emerald-50 border-emerald-300"
                        : "bg-red-50 border-red-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                          result.success
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {result.success ? (
                          <CheckCircle size={32} />
                        ) : (
                          <XCircle size={32} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`text-xl font-bold ${
                            result.success ? "text-emerald-700" : "text-red-700"
                          }`}
                        >
                          {result.success ? "✓ Passenger Allowed" : "✗ Verification Failed"}
                        </h3>
                        <p className="text-gray-600 mt-1">{result.message}</p>
                        <p className="text-xs font-mono text-gray-400 mt-2">
                          Code: {result.code}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Verification Rules */}
                <div className="mt-6 bg-gray-50 rounded-xl p-5">
                  <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <AlertCircle size={18} className="text-indigo-600" />
                    Verification Rules
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      Active tickets are accepted
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      Expired tickets are rejected
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Each ticket used only once
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Code must match system record
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR - Recent Verifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-white" />
                    <h3 className="font-bold text-white">Recent Activity</h3>
                  </div>
                  {recentVerifications.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-300 hover:text-white transition"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {recentVerifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <History size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No recent verifications</p>
                    <p className="text-xs mt-1">Verifications will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {recentVerifications.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => quickVerify(record.code)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {record.success ? (
                              <CheckCircle size={16} className="text-emerald-500" />
                            ) : (
                              <XCircle size={16} className="text-red-500" />
                            )}
                            <span className="text-xs font-mono text-gray-600">
                              {record.code}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatTime(record.timestamp)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-700">
                            {record.success 
                              ? (record.passengerName || "Passenger verified")
                              : "Verification failed"}
                          </p>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                  Click any record to re-verify
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* INSTRUCTION CARD */}
        <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={20} className="text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-800">How to Verify a Passenger</h4>
              <p className="text-sm text-gray-600 mt-1">
                1. Ask passenger for their verification code (found on their ticket or SMS)<br />
                2. Enter the code above or scan the QR code from their phone<br />
                3. System will instantly verify if the ticket is valid<br />
                4. Allow passenger entry only when verification is successful
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes slide-in-from-top {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default VerifyPassenger;