// src/components/QRCodeView.jsx

function QRCodeView({ qr }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-lg text-center">

      <h1 className="text-xl font-bold mb-4">
        QR Code
      </h1>

      <img
        src={qr}
        alt="QR"
        className="w-56 h-56 mx-auto"
      />

    </div>
  );
}

export default QRCodeView;