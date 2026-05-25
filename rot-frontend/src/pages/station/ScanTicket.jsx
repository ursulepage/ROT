// src/pages/station/ScanTicket.jsx

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Loader2,
  Ticket,
  User,
  MapPin,
  Calendar,
  Car,
  DollarSign,
  Clock,
  AlertCircle,
  Scan,
  Volume2,
  VolumeX,
  History,
  ChevronRight,
  Eye,
} from "lucide-react";

function ScanTicket() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [scanning, setScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recentScans, setRecentScans] = useState([]);
  const [scanHistory, setScanHistory] = useState([]);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Load scan history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("scanHistory");
    if (saved) {
      setScanHistory(JSON.parse(saved));
    }
  }, []);

  // Save to history
  const saveToHistory = (code, success, passengerName = null) => {
    const newRecord = {
      id: Date.now(),
      code,
      success,
      passengerName,
      timestamp: new Date().toISOString(),
    };
    
    const updated = [newRecord, ...scanHistory].slice(0, 20);
    setScanHistory(updated);
    localStorage.setItem("scanHistory", JSON.stringify(updated));
  };

  // Play sound effect
  const playSound = (success) => {
    if (!soundEnabled) return;
    // Use Web Audio API for beep sounds
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = "sine";
    oscillator.frequency.value = success ? 880 : 440;
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.5);
    oscillator.stop(audioContext.currentTime + 0.3);
  };

  // Start camera for scanning
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.play();
      }
      
      setScanning(true);
      startScanning();
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera. Please check permissions.");
      stopCamera();
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setScanning(false);
  };

  // Simulate QR scanning (in production, use a QR scanner library)
  const startScanning = () => {
    // Simulate scanning a QR code after 3 seconds
    // In production, replace with actual QR scanning library like html5-qrcode
    setTimeout(() => {
      if (scanning) {
        const mockCode = "ROT-" + Math.floor(100000 + Math.random() * 900000);
        setScannedCode(mockCode);
        stopCamera();
        // Auto verify after scan
        setTimeout(() => {
          handleVerify(mockCode);
        }, 500);
      }
    }, 3000);
  };

  // Verify the scanned/entered code
  const handleVerify = async (code = null) => {
    const verificationCode = (code || scannedCode).trim().toUpperCase();
    
    if (!verificationCode) {
      alert("Please scan or enter a verification code");
      return;
    }

    setLoading(true);
    setResult(null);
    setTicketDetails(null);

    try {
      const token = localStorage.getItem("token");
      
      const response = await axios.post(
        `${API_URL}/verify-ticket`,
        { verification_code: verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Success
      setResult({
        success: true,
        message: response.data.message || "Passenger verified successfully!",
        code: verificationCode,
      });
      
      playSound(true);
      saveToHistory(verificationCode, true, "Verified");
      
      // Fetch ticket details (you may need additional endpoint)
      // For now, show success message
      setTicketDetails({
        passenger_name: "Verified Passenger",
        route: "Verified Route",
        travel_time: new Date().toISOString(),
      });
      
      setScannedCode("");
      
      // Auto clear result after 5 seconds
      setTimeout(() => {
        setResult(null);
        setTicketDetails(null);
      }, 5000);

    } catch (error) {
      console.error("Verification error:", error);
      
      const errorMessage = error.response?.data?.message || "Invalid or expired ticket";
      
      setResult({
        success: false,
        message: errorMessage,
        code: verificationCode,
      });
      
      playSound(false);
      saveToHistory(verificationCode, false, null);
      
      setTimeout(() => {
        setResult(null);
      }, 5000);
      
    } finally {
      setLoading(false);
    }
  };

  // Clear history
  const clearHistory = () => {
    setScanHistory([]);
    localStorage.removeItem("scanHistory");
  };

  // Quick re-verify from history
  const reVerify = (code) => {
    setScannedCode(code);
    handleVerify(code);
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <QrCode size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Scan Ticket</h1>
                <p className="text-gray-500 mt-1">Scan QR code to verify passenger tickets instantly</p>
              </div>
            </div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition"
            >
              {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <span className="text-sm">{soundEnabled ? "Sound On" : "Sound Off"}</span>
            </button>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* SCANNER SECTION - Main Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              
              {/* Scanner Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">QR Code Scanner</h2>
                    <p className="text-indigo-100 text-sm mt-1">Position the QR code in front of camera</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Scan size={24} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Scanner Body */}
              <div className="p-6">
                {/* Camera View */}
                {!scanning ? (
                  <div 
                    onClick={startCamera}
                    className="relative bg-gray-900 rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <div className="aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-24 h-24 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Camera size={40} className="text-indigo-600" />
                        </div>
                        <p className="text-white font-medium">Click to start scanning</p>
                        <p className="text-gray-400 text-sm mt-1">Allow camera access when prompted</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      ref={videoRef}
                      className="w-full rounded-2xl bg-black"
                      autoPlay
                      playsInline
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Scanning Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-64 h-64 border-2 border-indigo-500 rounded-2xl shadow-lg">
                        <div className="absolute top-0 left-0 w-full h-full bg-indigo-500/10 rounded-2xl"></div>
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500"></div>
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-indigo-500"></div>
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-indigo-500"></div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-indigo-500"></div>
                      </div>
                    </div>
                    
                    {/* Scanning Animation */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-0.5 bg-indigo-500 animate-scan"></div>
                    
                    {/* Stop Button */}
                    <button
                      onClick={stopCamera}
                      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-2 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition"
                    >
                      Stop Scanning
                    </button>
                  </div>
                )}

                {/* Manual Entry Section */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Or enter verification code manually
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Enter verification code (e.g., ROT-123456)"
                      value={scannedCode}
                      onChange={(e) => setScannedCode(e.target.value.toUpperCase())}
                      className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-mono"
                      onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                    />
                    <button
                      onClick={() => handleVerify()}
                      disabled={loading || !scannedCode.trim()}
                      className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                      Verify
                    </button>
                  </div>
                </div>

                {/* Loading Indicator */}
                {loading && (
                  <div className="mt-6 flex items-center justify-center gap-3 text-indigo-600">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Verifying ticket...</span>
                  </div>
                )}

                {/* Result Display */}
                {result && (
                  <div
                    className={`mt-6 rounded-xl p-5 border-2 animate-in slide-in-from-top ${
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

                {/* Ticket Details (if available) */}
                {ticketDetails && result?.success && (
                  <div className="mt-6 bg-gray-50 rounded-xl p-5">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <Ticket size={18} className="text-indigo-600" />
                      Ticket Details
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User size={14} />
                        <span>{ticketDetails.passenger_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin size={14} />
                        <span>{ticketDetails.route}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar size={14} />
                        <span>{new Date(ticketDetails.travel_time).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Instructions Card */}
            <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">How to Scan Tickets</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    1. Click "Start Scanning" to activate camera<br />
                    2. Position the passenger's QR code within the scanning frame<br />
                    3. System will automatically detect and verify the code<br />
                    4. Green checkmark means passenger is allowed entry<br />
                    5. You can also enter the verification code manually
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR - Scan History */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History size={18} className="text-white" />
                    <h3 className="font-bold text-white">Scan History</h3>
                  </div>
                  {scanHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-300 hover:text-white transition"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto">
                {scanHistory.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <QrCode size={40} className="mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No scan history</p>
                    <p className="text-xs mt-1">Scanned tickets will appear here</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {scanHistory.map((record) => (
                      <div
                        key={record.id}
                        className="p-4 hover:bg-gray-50 transition cursor-pointer"
                        onClick={() => reVerify(record.code)}
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
                              ? (record.passengerName || "Verified ✓")
                              : "Failed ✗"}
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
                  {scanHistory.length} scans recorded
                </p>
              </div>
            </div>

            {/* Stats Card */}
            <div className="mt-6 bg-white rounded-2xl shadow-lg border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Today's Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Scans</span>
                  <span className="font-bold text-gray-800">{scanHistory.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Successful</span>
                  <span className="font-bold text-emerald-600">
                    {scanHistory.filter(s => s.success).length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Failed</span>
                  <span className="font-bold text-red-600">
                    {scanHistory.filter(s => !s.success).length}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all"
                      style={{
                        width: `${scanHistory.length > 0 
                          ? (scanHistory.filter(s => s.success).length / scanHistory.length) * 100 
                          : 0}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Success Rate: {scanHistory.length > 0 
                      ? Math.round((scanHistory.filter(s => s.success).length / scanHistory.length) * 100) 
                      : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
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
        
        @keyframes scan {
          0% {
            transform: translate(-50%, -50%) translateY(-120px);
          }
          100% {
            transform: translate(-50%, -50%) translateY(120px);
          }
        }
        
        .animate-in {
          animation: slide-in-from-top 0.3s ease-out;
        }
        
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default ScanTicket;