import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShipmentApi } from "../api/client";
import toast from "react-hot-toast";
import { FaBarcode, FaCheckCircle, FaTruck } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export const ShipmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [shipmentData, setShipmentData] = useState<any>(null);

  useEffect(() => {
    const saved = localStorage.getItem("lastOrderId");
    if (!saved) {
      toast.error("Nicio expediție activă! Revenire la index.");
      navigate("/orders");
    } else {
      setOrderId(saved);
    }
  }, [navigate]);

  const handleFinalize = async () => {
    setLoading(true);
    const cleanId = orderId
      .replace(/-/g, "")
      .replace("CUST", "")
      .replace("ORD", "");
    const finalId = `ORD-${cleanId}`;

    try {
      const response = await ShipmentApi.prepareShipment({
        orderId: finalId,
        customerId: "CUST-777",
        deliveryAddress: {
          street: "Strada Livezii nr 44",
          city: "Cluj-Napoca",
          postalCode: "435500",
          country: "Romania",
        },
        items: [{ productId: "PROD-101", quantity: 1 }],
      });

      setShipmentData(response.data);
      setShowSuccess(true);

      // Declanșare Confetti
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3b82f6", "#10b981", "#ffffff"],
      });

      // Actualizăm statusul în istoric
      const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
      const updated = history.map((o: any) =>
        o.id === orderId ? { ...o, status: "Livrată" } : o
      );
      localStorage.setItem("ordersHistory", JSON.stringify(updated));

      localStorage.removeItem("lastOrderId");
    } catch (e) {
      toast.error("Eroare logistică server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-12 max-w-5xl mx-auto text-center font-sans"
    >
      <AnimatePresence>
        {!showSuccess ? (
          <motion.div
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.5 }}
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
                onClick={handleFinalize}
                className="w-full py-6 bg-blue-600 rounded-2xl font-heading font-extrabold text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-blue-600/30 text-white"
              >
                {loading ? "GENERARE AWB..." : "PREGĂTEȘTE ȘI EXPEDIAZĂ →"}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="bg-emerald-500/10 p-4 rounded-full mb-6">
              <FaCheckCircle className="text-emerald-500 text-6xl animate-bounce" />
            </div>
            <h2 className="font-heading text-4xl font-extrabold mb-2 text-white">
              EXPEDIȚIE FINALIZATĂ
            </h2>
            <p className="text-white/40 font-mono text-sm mb-12">
              Workflow-ul DDD a fost încheiat cu succes.
            </p>

            {/* Success Card  */}
            <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-black text-left font-mono border-t-8 border-blue-600">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                    Carrier Service
                  </p>
                  <p className="font-bold text-lg">
                    {shipmentData?.carrier || "DHL EXPRESS"}
                  </p>
                </div>
                <FaBarcode size={40} />
              </div>
              <div className="space-y-4 border-t border-dashed border-gray-200 pt-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Tracking Number
                  </p>
                  <p className="font-bold text-xl tracking-tight select-all">
                    {shipmentData?.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">
                    Reference Order ID
                  </p>
                  <p className="text-sm font-bold">{orderId}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/")}
              className="mt-12 text-white/40 hover:text-white font-heading text-[10px] font-black uppercase tracking-widest transition-colors border-b border-white/10 pb-1"
            >
              ← Înapoi la Panoul de Control
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
