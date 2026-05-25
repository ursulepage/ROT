// src/components/PaymentPopup.jsx

function PaymentPopup({
  open,
  onClose,
  onPay,
}) {

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-2xl p-8 w-full max-w-md">

        <h1 className="text-2xl font-bold text-center mb-6">
          Select Payment
        </h1>

        <div className="space-y-4">

          <button
            onClick={() => onPay("mtn")}
            className="w-full bg-yellow-400 py-3 rounded-xl font-bold"
          >
            Pay with MTN
          </button>

          <button
            onClick={() => onPay("airtel")}
            className="w-full bg-red-500 text-white py-3 rounded-xl font-bold"
          >
            Pay with Airtel
          </button>

          <button
            onClick={() => onPay("cash")}
            className="w-full bg-slate-700 text-white py-3 rounded-xl font-bold"
          >
            Cash Payment
          </button>

          <button
            onClick={onClose}
            className="w-full border py-3 rounded-xl font-bold"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
}

export default PaymentPopup;