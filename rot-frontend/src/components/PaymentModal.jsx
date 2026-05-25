// src/components/PaymentModal.jsx

import { useState, useEffect } from "react";
import { CreditCard, Smartphone, X, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

function PaymentModal({ isOpen, onClose, amount, onSuccess, passengerName, phoneNumber, route }) {
  const [paymentMethod, setPaymentMethod] = useState("mtn");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [verificationCode, setVerificationCode] = useState("");
  const [mobileNumber, setMobileNumber] = useState(phoneNumber || "");
  const [transactionId, setTransactionId] = useState(null);
  const [error, setError] = useState("");
  const [generatedCode, setGeneratedCode] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Generate a random demo code
  const generateDemoCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Send demo code (simulated - no real SMS)
  const sendDemoCode = () => {
    if (!mobileNumber) {
      setError("Please enter your phone number");
      return false;
    }
    
    const demoCode = generateDemoCode();
    setGeneratedCode(demoCode);
    setCodeSent(true);
    
    // Start countdown for resend
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    setError(`🔐 DEMO MODE: Your verification code is ${demoCode}. Enter this code to complete payment.`);
    return true;
  };

  const handlePayment = async () => {
    if (!mobileNumber) {
      setError("Please enter your phone number");
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^0[0-9]{9}$/;
    if (!phoneRegex.test(mobileNumber)) {
      setError("Please enter a valid Rwanda phone number (e.g., 0788123456)");
      return;
    }
    
    setError("");
    setProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Send demo code
      sendDemoCode();
      
      // Generate transaction ID
      const newTransactionId = "TXN" + Date.now() + Math.floor(Math.random() * 1000);
      setTransactionId(newTransactionId);
      setStep(2);
      setProcessing(false);
    }, 1500);
  };

  const handleVerify = () => {
    if (!verificationCode) {
      setError("Please enter the verification code");
      return;
    }
    
    if (verificationCode === generatedCode) {
      // Code matches - payment successful
      onSuccess({
        transactionId,
        paymentMethod,
        amount,
        passengerName,
        route,
        mobileNumber,
        verified: true
      });
      onClose();
    } else {
      setError("Invalid verification code. Please try again.");
    }
  };

  const resendCode = () => {
    if (countdown > 0) return;
    sendDemoCode();
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setVerificationCode("");
      setGeneratedCode("");
      setCodeSent(false);
      setError("");
      setProcessing(false);
      setMobileNumber(phoneNumber || "");
    }
  }, [isOpen, phoneNumber]);

  if (!isOpen) return null;

  const paymentIcon = {
    mtn: { bg: "bg-yellow-500", text: "MTN", icon: <Smartphone size={20} /> },
    airtel: { bg: "bg-red-500", text: "AIRTEL", icon: <Smartphone size={20} /> },
    cash: { bg: "bg-green-500", text: "CASH", icon: <CreditCard size={20} /> }
  }[paymentMethod];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">
              {step === 1 ? "Complete Payment" : "Verify Payment"}
            </h2>
            <p className="text-indigo-100 text-sm">
              {route} • {amount.toLocaleString()} RWF
            </p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-1 rounded-lg transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Amount Display */}
              <div className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                <p className="text-sm text-gray-500">Total Amount</p>
                <p className="text-3xl font-bold text-indigo-600">{amount.toLocaleString()} RWF</p>
                <p className="text-xs text-gray-400 mt-1">Passenger: {passengerName}</p>
              </div>

              {/* Payment Methods */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Select Payment Method</label>
                
                <button
                  onClick={() => setPaymentMethod("mtn")}
                  className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all ${
                    paymentMethod === "mtn" ? "border-yellow-500 bg-yellow-50" : "border-gray-200"
                  }`}
                >
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-white font-bold">MTN</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">MTN Mobile Money</p>
                    <p className="text-xs text-gray-500">Pay with MTN MoMo</p>
                  </div>
                  {paymentMethod === "mtn" && <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>}
                </button>

                <button
                  onClick={() => setPaymentMethod("airtel")}
                  className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all ${
                    paymentMethod === "airtel" ? "border-red-500 bg-red-50" : "border-gray-200"
                  }`}
                >
                  <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold">AIR</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Airtel Money</p>
                    <p className="text-xs text-gray-500">Pay with Airtel Money</p>
                  </div>
                  {paymentMethod === "airtel" && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                </button>

                <button
                  onClick={() => setPaymentMethod("cash")}
                  className={`w-full flex items-center gap-3 p-3 border rounded-xl transition-all ${
                    paymentMethod === "cash" ? "border-green-500 bg-green-50" : "border-gray-200"
                  }`}
                >
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold">$</div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">Cash at Station</p>
                    <p className="text-xs text-gray-500">Pay at the station counter</p>
                  </div>
                  {paymentMethod === "cash" && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                </button>
              </div>

              {/* Mobile Number Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g., 0788123456"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-blue-500 mt-1">
                  You will receive a verification code (DEMO MODE - code shown on screen)
                </p>
              </div>

              {error && (
                <div className={`rounded-lg p-3 flex items-center gap-2 text-sm ${
                  error.includes("DEMO MODE") ? "bg-blue-50 border border-blue-200 text-blue-600" : "bg-red-50 border border-red-200 text-red-600"
                }`}>
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Pay {amount.toLocaleString()} RWF
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Success Message */}
              <div className="bg-emerald-50 rounded-xl p-4 text-center border border-emerald-200">
                <CheckCircle size={48} className="mx-auto text-emerald-500 mb-2" />
                <p className="font-semibold text-emerald-700">Demo Code Generated!</p>
                <p className="text-sm text-emerald-600 mt-1">A demo code has been created for {mobileNumber}</p>
                <div className="mt-3 bg-white rounded-lg p-3 border border-emerald-300">
                  <p className="text-xs text-gray-500">Your Demo Code</p>
                  <p className="text-3xl font-bold text-indigo-600 tracking-widest">{generatedCode}</p>
                </div>
              </div>

              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enter Verification Code
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-center text-2xl font-mono tracking-widest"
                  maxLength={6}
                  autoFocus
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Enter the demo code shown above
                  </p>
                  <button
                    onClick={resendCode}
                    disabled={countdown > 0}
                    className="text-xs text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                  >
                    {countdown > 0 ? `Resend in ${countdown}s` : "Generate New Code"}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={!verificationCode}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                Verify & Complete Booking
              </button>

              <p className="text-center text-xs text-gray-400">
                This is a DEMO MODE. No actual payment is processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;