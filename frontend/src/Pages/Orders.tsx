import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderApi } from "../api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export const OrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Inițializăm starea cu prefixele deja prezente în căsuțe
  const [order, setOrder] = useState({
    customerId: "CUST-",
    deliveryAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "Romania",
    },
    items: [{ productId: "PROD-", quantity: 1 }],
  });

  const validate = () => {
    let newErrors: any = {};
    // Verificăm dacă utilizatorul a introdus mai mult decât simplul prefix
    if (order.customerId.length <= 5)
      newErrors.customerId = "Introduceți cifrele după CUST-";
    if (!/^\d{6}$/.test(order.deliveryAddress.postalCode))
      newErrors.postalCode = "Necesită 6 cifre";
    if (order.items[0].productId.length <= 5)
      newErrors.productId = "Introduceți cifrele după PROD-";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate()) return toast.error("Date incomplete!");

    setLoading(true);
    try {
      const response = await OrderApi.placeOrder(order);
      localStorage.setItem("lastOrderId", response.data.orderId);

      const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
      const newEntry = {
        id: response.data.orderId,
        customer: order.customerId,
        status: "Plasată",
        date: new Date().toLocaleString("ro-RO"),
      };
      localStorage.setItem(
        "ordersHistory",
        JSON.stringify([newEntry, ...history])
      );

      toast.success("Comandă confirmată!");
      setTimeout(() => navigate("/invoices"), 1000);
    } catch (e) {
      toast.error("Eroare server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-10 max-w-7xl mx-auto font-sans text-white"
    >
      <h1 className="font-heading text-3xl font-extrabold uppercase mb-12 tracking-tighter text-center">
        PASUL 1:{" "}
        <span className="text-blue-500 italic">ÎNREGISTRARE COMANDĂ</span>
      </h1>

      {/* Container principal cu items-stretch pentru înălțimi egale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Card 1: Logistica Destinație */}
        <div className="lg:col-span-2 bg-[#11131f] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col">
          <h3 className="font-heading text-blue-500 font-bold text-[10px] uppercase mb-10 tracking-[0.3em]">
            Logistica Destinație
          </h3>
          <div className="space-y-8 flex-1">
            <div>
              <label className="font-heading text-[10px] font-bold text-white/20 uppercase mb-2 ml-1 block tracking-widest">
                ID Client
              </label>
              <input
                placeholder="CUST-XXXX"
                className={`w-full bg-white/5 p-4 rounded-xl border font-mono text-sm outline-none transition-all ${
                  errors.customerId
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
                value={order.customerId}
                onChange={(e) => {
                  // Prevenim ștergerea prefixului CUST-
                  const val = e.target.value.startsWith("CUST-")
                    ? e.target.value
                    : "CUST-";
                  setOrder({ ...order, customerId: val });
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="font-heading text-[10px] font-bold text-white/20 uppercase mb-2 ml-1 block tracking-widest">
                  Adresă
                </label>
                <input
                  placeholder="Strada Livezii nr 44"
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 font-mono text-sm"
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      deliveryAddress: {
                        ...order.deliveryAddress,
                        street: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="font-heading text-[10px] font-bold text-white/20 uppercase mb-2 ml-1 block tracking-widest">
                  Oraș
                </label>
                <input
                  placeholder="Cluj-Napoca"
                  className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none focus:border-blue-500 font-mono text-sm"
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      deliveryAddress: {
                        ...order.deliveryAddress,
                        city: e.target.value,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="font-heading text-[10px] font-bold text-white/20 uppercase mb-2 ml-1 block tracking-widest">
                  Cod Poștal
                </label>
                <input
                  placeholder="XXXXXX"
                  className={`w-full bg-white/5 p-4 rounded-xl border font-mono text-sm outline-none ${
                    errors.postalCode
                      ? "border-red-500"
                      : "border-white/10 focus:border-blue-500"
                  }`}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      deliveryAddress: {
                        ...order.deliveryAddress,
                        postalCode: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Specificații Produs (Paralel cu Cardul 1) */}
        <div className="bg-[#11131f] p-10 rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col h-full">
          <h3 className="font-heading text-blue-500 font-bold text-[10px] uppercase mb-10 tracking-[0.3em] text-center">
            Specificații Produs
          </h3>

          <div className="space-y-10 flex-1">
            <div>
              <label className="font-heading text-[10px] font-bold text-white/20 uppercase mb-2 ml-1 block tracking-widest">
                Identificator Articol
              </label>
              <input
                placeholder="PROD-XXXX"
                className={`w-full bg-white/5 p-4 rounded-xl border font-mono text-sm outline-none transition-all ${
                  errors.productId
                    ? "border-red-500"
                    : "border-white/10 focus:border-blue-500"
                }`}
                value={order.items[0].productId}
                onChange={(e) => {
                  const val = e.target.value.startsWith("PROD-")
                    ? e.target.value
                    : "PROD-";
                  const n = [...order.items];
                  n[0].productId = val;
                  setOrder({ ...order, items: n });
                }}
              />
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
              <label className="font-heading text-[10px] font-black text-white/20 uppercase tracking-widest mb-6 block">
                Unități (Control Săgeți)
              </label>
              <input
                type="number"
                min="1"
                onKeyDown={(e) => e.preventDefault()}
                className="w-full bg-transparent font-heading text-6xl font-extrabold text-blue-500 outline-none text-center cursor-default"
                value={order.items[0].quantity}
                onChange={(e) => {
                  const n = [...order.items];
                  n[0].quantity = parseInt(e.target.value);
                  setOrder({ ...order, items: n });
                }}
              />
            </div>
          </div>

          {/* Butonul este acum împins jos, dar cardul rămâne aliniat cu cel din stânga */}
          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-6 bg-blue-600 rounded-2xl font-heading font-extrabold text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 mt-10"
          >
            {loading ? "SE SALVEAZĂ..." : "FINALIZEAZĂ ETAPA 1 →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
