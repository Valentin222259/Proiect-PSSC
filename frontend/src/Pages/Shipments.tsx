import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShipmentApi } from "../api/client";
import toast from "react-hot-toast";
import { FaBarcode, FaTruck } from "react-icons/fa";
import { motion } from "framer-motion";

export const ShipmentPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lastOrderId");
    if (!saved) {
      toast.error("Nu există nicio expediție în flux! Întoarcere la Comenzi.");
      navigate("/orders");
    } else {
      setOrderId(saved);
    }
  }, [navigate]);

  const handleShip = async () => {
    setLoading(true);

    // Formatare automată pentru a trece de validarea Regex din backend
    const cleanId = orderId
      .replace(/-/g, "")
      .replace("CUST", "")
      .replace("ORD", "");
    const finalId = `ORD-${cleanId}`;

    try {
      // Apelăm controller-ul de livrări
      const response = await ShipmentApi.prepareShipment({
        orderId: finalId,
        customerId: "CUST-123", // ID Client validat de domeniu
        deliveryAddress: {
          street: "Strada Suceava 10",
          city: "Suceava",
          postalCode: "720001",
          country: "Romania",
        },
        items: [{ productId: "PROD-01", quantity: 1 }],
      });

      toast.success(
        <div>
          <p className="font-bold">Livrare Pregătită!</p>
          <p className="text-[10px] opacity-70">
            AWB: {response.data.trackingNumber} ({response.data.carrier})
          </p>
        </div>
      );

      // Curățăm fluxul și ne întoarcem la început
      localStorage.removeItem("lastOrderId");
      setTimeout(() => navigate("/"), 2500);
    } catch (error: any) {
      toast.error(error.response?.data?.Message || "Eroare logistică");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-12 max-w-4xl mx-auto text-center"
    >
      <header className="mb-12">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic">
          Pasul 3: Logistică și Expediție
        </h1>
        <p className="text-white/30 text-xs mt-2 font-mono uppercase tracking-widest text-blue-500">
          Departament: Fulfillment & Shipping
        </p>
      </header>

      <div className="bg-white/5 p-12 rounded-[3.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
        <FaTruck className="mx-auto text-6xl mb-8 text-white/10 group-hover:text-blue-500/20 transition-colors duration-500" />

        <div className="mb-10">
          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-4">
            Pregătit pentru AWB:
          </p>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 inline-flex items-center gap-4">
            <FaBarcode className="text-2xl text-white/20" />
            <span className="text-4xl font-mono font-black tracking-tighter text-blue-400">
              {orderId}
            </span>
          </div>
        </div>

        <button
          onClick={handleShip}
          disabled={loading}
          className="w-full py-6 bg-blue-600 rounded-2xl font-black text-xs tracking-[0.3em] hover:bg-blue-500 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-blue-600/20"
        >
          {loading
            ? "SE GENERĂ DOCUMENTAȚIA AWB..."
            : "FINALIZEAZĂ ȘI EXPEDIAZĂ →"}
        </button>
      </div>
    </motion.div>
  );
};
