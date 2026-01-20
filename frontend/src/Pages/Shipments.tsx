import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaBarcode, FaCheckCircle, FaTruck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const ShipmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [shipmentData, setShipmentData] = useState<any>(null);

  useEffect(() => {
    //cand venim din istoric
    if (location.state?.isAlreadyFinalized) {
      const data = location.state;
      setOrderId(data.orderId);
      setShipmentData({
        trackingNumber: `AWB-${data.orderId?.split("-")[1] || Math.floor(100000 + Math.random() * 900000)}`,
        carrier: "DHL EXPRESS",
        customerName: data.customerId || data.customer,
        address: `${data.street || "Adresă Nespecificată"}, ${data.city || ""}`,
        postalCode: data.postalCode || "N/A",
        quantity: data.quantity || 1,
        productId: data.productId || "PROD-GEN",
      });
      setShowSuccess(true);
    }
    // 2. Fluxul normal
    else {
      const savedId = localStorage.getItem("lastOrderId");
      if (!savedId) {
        toast.error("Nicio expediție activă!");
        navigate("/orders");
      } else {
        setOrderId(savedId);

        // Căutăm detaliile comenzii în localStorage pentru a completa factura
        const allOrders = JSON.parse(
          localStorage.getItem("userCreatedOrders") || "[]",
        );
        const currentOrder = allOrders.find(
          (o: any) =>
            o.internalId === savedId ||
            o.orderId === savedId ||
            o.id === savedId,
        );

        if (currentOrder) {
          setShipmentData({
            trackingNumber: `AWB-${savedId.split("-")[1] || Math.floor(100000 + Math.random() * 900000)}`,
            carrier: "DHL EXPRESS",
            customerName: currentOrder.customerId || currentOrder.customer,
            address: `${currentOrder.street || "Adresă Nespecificată"}, ${currentOrder.city || ""}`,
            postalCode: currentOrder.postalCode || "N/A",
            quantity: currentOrder.quantity || 1,
            productId: currentOrder.productId || "PROD-GEN",
          });
        }
      }
    }
  }, [location, navigate]);

  const handleDownloadPDF = async () => {
    const element = document.getElementById("invoice-printable");
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Factura_${orderId}.pdf`);
  };

  const handleFinalizeManual = () => {
    setLoading(true);
    setTimeout(() => {
      // ACTUALIZARE STATUS
      const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
      const updated = history.map((o: any) =>
        o.id === orderId ? { ...o, status: "Livrată" } : o,
      );
      localStorage.setItem("ordersHistory", JSON.stringify(updated));

      setLoading(false);
      setShowSuccess(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#ffffff"],
      });
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-12 max-w-5xl mx-auto text-center font-sans"
    >
      <AnimatePresence mode="wait">
        {!showSuccess ? (
          <motion.div
            key="step-processing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="font-heading text-3xl font-extrabold uppercase mb-4 italic tracking-tighter text-white">
              Pasul 3:{" "}
              <span className="text-blue-500 italic">
                LOGISTICĂ & EXPEDIȚIE
              </span>
            </h1>

            <div className="bg-[#11131f] p-16 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <FaTruck className="mx-auto text-7xl mb-8 text-white/5 group-hover:text-blue-500/20 transition-all duration-700" />
              <p className="font-heading text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">
                Validare ID Flux
              </p>
              <div className="bg-white/5 p-8 rounded-2xl border border-white/5 inline-block mb-12">
                <span className="font-mono text-5xl font-black tracking-tighter text-blue-400">
                  {orderId}
                </span>
              </div>
              <button
                onClick={handleFinalizeManual}
                disabled={loading}
                className="w-full py-6 bg-blue-600 rounded-2xl font-heading font-extrabold text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-600/30 text-white"
              >
                {loading
                  ? "GENERARE DOCUMENTE..."
                  : "PREGĂTEȘTE ȘI EXPEDIAZĂ →"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="step-success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-emerald-500/10 p-4 rounded-full mb-6 no-print">
              <FaCheckCircle className="text-emerald-500 text-6xl" />
            </div>
            <h2 className="font-heading text-4xl font-extrabold mb-2 text-white no-print uppercase">
              Expediție Finalizată
            </h2>
            <p className="text-white/40 font-mono text-sm mb-12 no-print">
              Documentele au fost generate cu succes pentru ID: {orderId}
            </p>

            {/* FACTURA CURATĂ - Stil foaie albă */}
            <div
              id="invoice-printable"
              className="bg-white p-12 w-full max-w-2xl text-black text-left font-mono border border-gray-200 shadow-2xl relative"
            >
              {/* Element decorativ factura */}
              <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>

              <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
                <div>
                  <h3 className="font-bold text-2xl tracking-tighter">
                    FACTURĂ FISCALĂ / AWB
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                    Sistem Gestiune Core Log
                  </p>
                </div>
                <FaBarcode size={60} className="opacity-80" />
              </div>

              <div className="grid grid-cols-2 gap-12 text-sm">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                    Destinatar
                  </h4>
                  <p className="font-bold text-lg leading-tight">
                    {shipmentData?.customerName}
                  </p>
                  <p className="text-gray-600 mt-1">{shipmentData?.address}</p>
                  <p className="text-gray-600">{shipmentData?.postalCode}</p>
                  <p className="text-gray-600 uppercase text-[10px] mt-4">
                    România
                  </p>
                </div>
                <div className="text-right">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-3">
                    Detalii Expediție
                  </h4>
                  <div className="space-y-1">
                    <p>
                      <span className="text-gray-400">ID Comandă:</span>{" "}
                      <strong>{orderId}</strong>
                    </p>
                    <p>
                      <span className="text-gray-400">Produs:</span>{" "}
                      {shipmentData?.productId}
                    </p>
                    <p>
                      <span className="text-gray-400">Cantitate:</span>{" "}
                      {shipmentData?.quantity} BUC
                    </p>
                    <p>
                      <span className="text-gray-400">Metodă:</span>{" "}
                      {shipmentData?.carrier}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-dashed border-gray-200">
                <div className="flex justify-between items-end">
                  <div>
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase">
                      Tracking Number (AWB)
                    </h4>
                    <p className="font-bold text-3xl tracking-tighter mt-1">
                      {shipmentData?.trackingNumber}
                    </p>
                  </div>
                  <div className="text-[9px] text-gray-300 text-right uppercase">
                    Generat la: {new Date().toLocaleDateString("ro-RO")}
                  </div>
                </div>
              </div>
            </div>

            {/* BUTOANE */}
            <div className="flex flex-col sm:flex-row gap-6 mt-12 no-print">
              <button
                onClick={() => window.print()}
                className="px-8 py-3 bg-white text-black rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
              >
                Printează Factura
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg"
              >
                Descarcă PDF
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-8 py-3 text-white/40 hover:text-white font-bold text-[10px] uppercase tracking-widest transition-all border-b border-white/10"
              >
                ← Revenire la Panoul de Control
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; padding: 0 !important; }
          #invoice-printable { 
            box-shadow: none !important; 
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </motion.div>
  );
};
