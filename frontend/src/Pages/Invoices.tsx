import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { InvoiceApi } from "../api/client";
import toast from "react-hot-toast";

export const InvoicePage = () => {
  const navigate = useNavigate();
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setOrderId(localStorage.getItem("lastOrderId") || "");
  }, []);

  const handleInvoice = async () => {
    setLoading(true);
    try {
      await InvoiceApi.generateInvoice({
        orderId: orderId.startsWith("ORD-")
          ? orderId
          : `ORD-${orderId.replace(/-/g, "")}`,
        customerId: "CUST-777",
        billingAddress: {
          street: "Suceava 10",
          city: "Suceava",
          postalCode: "720001",
          country: "Romania",
        },
        items: [{ productId: "PROD-101", quantity: 1, unitPrice: "4500" }],
      });

      const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
      const updated = history.map((o: any) =>
        o.id === orderId ? { ...o, status: "Facturată" } : o
      );
      localStorage.setItem("ordersHistory", JSON.stringify(updated));

      toast.success("Factură emisă!");
      setTimeout(() => navigate("/shipments"), 1000);
    } catch (e) {
      toast.error("Eroare fiscală");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-20 text-center font-sans">
      <h2 className="font-heading text-3xl font-extrabold uppercase mb-12 text-white italic tracking-tighter">
        Validare Financiară
      </h2>
      <div className="bg-[#11131f] p-12 rounded-[3rem] border border-white/10 inline-block w-full max-w-2xl">
        <p className="font-heading text-[10px] text-white/20 uppercase tracking-[0.3em] mb-4">
          Comandă detectată:
        </p>
        <p className="font-mono text-5xl font-black text-blue-500 mb-12 tracking-tighter">
          {orderId || "---"}
        </p>
        <button
          onClick={handleInvoice}
          disabled={loading || !orderId}
          className="w-full py-6 bg-emerald-600 rounded-2xl font-heading font-extrabold text-xs tracking-widest hover:bg-emerald-500 transition-all text-white"
        >
          EMITE FACTURA AUTOMAT →
        </button>
      </div>
    </div>
  );
};
