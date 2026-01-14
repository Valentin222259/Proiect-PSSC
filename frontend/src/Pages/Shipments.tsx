import { useState, useEffect } from "react";
import { ShipmentApi } from "../api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { FaTruck, FaBarcode } from "react-icons/fa";

export const ShipmentPage = () => {
  const [loading, setLoading] = useState(false);
  const [shipment, setShipment] = useState({
    orderId: "",
    customerId: "CUST-123",
    deliveryAddress: {
      street: "Strada Exemplu 10",
      city: "Suceava",
      postalCode: "720229",
      country: "Romania",
    },
    items: [{ productId: "PROD-LAPTOP", quantity: 1 }],
  });

  // Preluăm automat ID-ul ultimei comenzi la încărcarea paginii
  useEffect(() => {
    const savedId = localStorage.getItem("lastOrderId");
    if (savedId) {
      setShipment((prev) => ({ ...prev, orderId: savedId }));
    }
  }, []);

  const handlePrepareShipment = async () => {
    if (!shipment.orderId)
      return toast.error("Nu există nicio comandă pentru livrare!");

    setLoading(true);

    // --- REPARARE AUTOMATĂ ID ---
    // Eliminăm cratimele interne și punem prefixul ORD- (ex: CUST-123 devine ORD-CUST123)
    const cleanId = shipment.orderId.replace(/-/g, "");
    const finalOrderId = `ORD-${cleanId}`;

    const dataToSend = {
      ...shipment,
      orderId: finalOrderId,
    };

    try {
      const response = await ShipmentApi.prepareShipment(dataToSend);
      // Backend-ul returnează TrackingNumber și Carrier
      toast.success(
        <div>
          <p className="font-bold text-sm">AWB Generat!</p>
          <p className="text-xs opacity-80">
            {response.data.trackingNumber} ({response.data.carrier})
          </p>
        </div>,
        { duration: 6000 }
      );
      console.log("Date livrare:", response.data);
    } catch (error: any) {
      const serverData = error.response?.data;
      // Căutăm mesajul de eroare în diverse formate trimise de .NET
      const errorMsg =
        serverData?.message ||
        serverData?.Message ||
        serverData?.reasons?.[0] ||
        serverData?.Reasons?.[0] ||
        "Eroare logistică";

      toast.error(errorMsg);
      console.error("Detalii eroare livrare:", serverData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="p-12 max-w-4xl"
    >
      <header className="mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black mb-2 tracking-tight">
            Logistică & Livrări
          </h1>
          <p className="text-white/40">
            Pregătire colete și generare numere de tracking AWB.
          </p>
        </div>
        <div className="text-6xl text-blue-500/20">
          <FaTruck />
        </div>
      </header>

      <div className="bg-white/5 p-10 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-4 mb-8 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
          <div className="bg-blue-600 p-3 rounded-xl">
            <FaBarcode size={24} />
          </div>
          <div>
            <p className="text-xs text-blue-400 font-bold uppercase tracking-widest">
              Sistemul a detectat Comanda:
            </p>
            <p className="text-xl font-mono font-bold">
              {shipment.orderId || "Nicio comandă detectată"}
            </p>
          </div>
        </div>

        <button
          onClick={handlePrepareShipment}
          disabled={loading || !shipment.orderId}
          className={`w-full p-6 rounded-2xl font-black text-lg transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
            loading || !shipment.orderId
              ? "bg-white/10 text-white/20 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20"
          }`}
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              SE GENERĂ AWB...
            </>
          ) : (
            "PREGĂTEȘTE ȘI EXPEDIAZĂ"
          )}
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 opacity-30 text-[10px] uppercase tracking-tighter">
        <div className="p-4 border border-white/10 rounded-xl">
          Carrier alocat: DHL / FedEx / UPS
        </div>
        <div className="p-4 border border-white/10 rounded-xl">
          Validare automată: Domain.ValueObjects.OrderId
        </div>
      </div>
    </motion.div>
  );
};
