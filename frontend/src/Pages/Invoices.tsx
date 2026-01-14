import { useState, useEffect } from "react";
import { InvoiceApi } from "../api/client";
import toast from "react-hot-toast";

export const InvoicePage = () => {
  const [loading, setLoading] = useState(false);
  const [invoice, setInvoice] = useState({
    orderId: "",
    customerId: "CUST-123",
    billingAddress: {
      street: "Bulevardul Victoriei 10",
      city: "Bucuresti",
      postalCode: "010001",
      country: "Romania",
    },
    items: [{ productId: "PROD-LAPTOP", quantity: 1, unitPrice: "4500" }], // Trimitem prețul ca string pentru backend
  });

  // Încărcăm automat ultimul ID când intrăm pe pagină
  useEffect(() => {
    const savedId = localStorage.getItem("lastOrderId");
    if (savedId) {
      setInvoice((prev) => ({ ...prev, orderId: savedId }));
    }
  }, []);

  const handleGenerateInvoice = async () => {
    if (!invoice.orderId)
      return toast.error("Nu există nicio comandă selectată!");

    setLoading(true);

    // --- REPARARE AUTOMATĂ ID (Versiunea 2.0) ---
    // 1. Luăm ID-ul brut (ex: CUST-123)
    // 2. Eliminăm orice cratimă existentă (devine CUST123)
    // 3. Adăugăm prefixul ORD- (rezultă ORD-CUST123) -> VALID pentru backend
    const cleanId = invoice.orderId.replace(/-/g, "");
    const finalOrderId = `ORD-${cleanId}`;

    // Pregătim datele, asigurându-ne că prețul este STRING (cum vrea DTO-ul)
    const dataToSend = {
      ...invoice,
      orderId: finalOrderId,
      items: invoice.items.map((item) => ({
        ...item,
        unitPrice: String(item.unitPrice),
      })),
    };

    try {
      const response = await InvoiceApi.generateInvoice(dataToSend);
      toast.success(`Factură generată: ${response.data.invoiceNumber}`);
    } catch (error: any) {
      // Gestionăm eroarea astfel încât să vedem mesajul real de la server
      const serverData = error.response?.data;
      const errorMsg =
        serverData?.message ||
        serverData?.Message ||
        serverData?.reasons?.[0] ||
        serverData?.Reasons?.[0] ||
        "Eroare necunoscută";

      toast.error(errorMsg);
      console.error("Detalii eroare server:", serverData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-12 max-w-4xl">
      <h1 className="text-4xl font-black mb-10">Generare Factură</h1>
      <div className="bg-white/5 p-8 rounded-3xl border border-white/10 space-y-4">
        <p className="text-sm text-white/40 italic">
          Se va procesa automat ID-ul: {invoice.orderId}
        </p>
        <button
          onClick={handleGenerateInvoice}
          disabled={loading}
          className="w-full bg-emerald-600 p-5 rounded-2xl font-black"
        >
          {loading ? "SE PROCESEAZĂ..." : "GENEREAZĂ FACTURA AUTOMAT"}
        </button>
      </div>
    </div>
  );
};
