// src/pages/Invoices.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceApi } from "../api/client";
import toast from "react-hot-toast";

export const InvoicePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lastOrderId");
    if (!saved) {
      toast.error("Nu am găsit nicio comandă activă! Începe de aici.");
      navigate("/orders"); // TE DUCE AUTOMAT ÎNAPOI DACĂ NU AI DATE
    } else {
      setOrderId(saved);
    }
  }, [navigate]);

  const handleInvoice = async () => {
    setLoading(true);
    // Curățare ID pentru Backend
    const cleanId = orderId
      .replace(/-/g, "")
      .replace("CUST", "")
      .replace("ORD", "");
    const finalId = `ORD-${cleanId}`;

    try {
      await InvoiceApi.generateInvoice({
        orderId: finalId,
        customerId: "CUST-123",
        billingAddress: {
          street: "Bucuresti 10",
          city: "Bucuresti",
          postalCode: "010001",
          country: "Romania",
        },
        items: [{ productId: "PROD-01", quantity: 1, unitPrice: "4500" }],
      });
      toast.success("Factură emisă! Mergem la Livrări...");
      setTimeout(() => navigate("/shipments"), 1500);
    } catch (e) {
      toast.error("Eroare validare financiară");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl mx-auto text-center">
      <h1 className="text-3xl font-black mb-10 uppercase tracking-tighter italic">
        Pasul 2: Validare Financiară
      </h1>
      <div className="bg-white/5 p-12 rounded-[3rem] border border-white/10">
        <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.3em] mb-4 text-emerald-500">
          Comandă aprobată detectată:
        </p>
        <p className="text-5xl font-mono font-black mb-12 text-blue-400 tracking-tighter">
          {orderId}
        </p>
        <button
          onClick={handleInvoice}
          disabled={loading}
          className="w-full py-6 bg-emerald-600 rounded-2xl font-black text-sm tracking-widest hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-500/20"
        >
          {loading
            ? "SE GENEREAZĂ FACTURA..."
            : "CONFIRMĂ ȘI EMITE DOCUMENTUL →"}
        </button>
      </div>
    </div>
  );
};
