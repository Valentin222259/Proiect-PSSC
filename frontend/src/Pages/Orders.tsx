import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderApi } from "../api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export const OrderPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [order, setOrder] = useState({
    customerId: "",
    deliveryAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "Romania",
    },
    items: [{ productId: "", quantity: 1 }],
  });

  const validate = () => {
    let newErrors: any = {};
    if (!order.customerId.startsWith("CUST-"))
      newErrors.customerId = "ID invalid (CUST-)";
    if (!/^\d{6}$/.test(order.deliveryAddress.postalCode))
      newErrors.postalCode = "Necesită 6 cifre";
    if (!order.items[0].productId.startsWith("PROD-"))
      newErrors.productId = "ID invalid (PROD-)";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validate())
      return toast.error("Verifică toate câmpurile marcate cu roșu!");

    setLoading(true);
    try {
      const response = await OrderApi.placeOrder(order);
      localStorage.setItem("lastOrderId", response.data.orderId);

      const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
      const newEntry = {
        id: response.data.orderId,
        customer: order.customerId,
        status: "Plasată",
        date: new Date().toLocaleString("ro-RO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      localStorage.setItem(
        "ordersHistory",
        JSON.stringify([newEntry, ...history])
      );

      toast.success("Succes! Navigăm la facturare...");
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
      className="p-10 max-w-6xl mx-auto"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Destinatar */}
        <div className="lg:col-span-2 bg-[#11131f] p-10 rounded-[2.5rem] border border-white/10">
          <h3 className="text-blue-500 font-bold text-[10px] uppercase mb-8 tracking-widest">
            Logistica Destinație
          </h3>
          <div className="space-y-6">
            <input
              placeholder="ID Client (Ex: CUST-777)"
              className={`w-full bg-white/5 p-4 rounded-xl border transition-all outline-none ${
                errors.customerId
                  ? "border-red-500 shadow-lg shadow-red-500/10"
                  : "border-white/10 focus:border-blue-500"
              }`}
              onChange={(e) =>
                setOrder({ ...order, customerId: e.target.value })
              }
            />
            <input
              placeholder="Adresă"
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 outline-none"
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
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Oraș"
                className="bg-white/5 p-4 rounded-xl border border-white/10 outline-none"
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
              <input
                placeholder="Cod Poștal (6 cifre)"
                className={`bg-white/5 p-4 rounded-xl border outline-none ${
                  errors.postalCode
                    ? "border-red-500 shadow-lg shadow-red-500/10"
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

        {/* Articol - CARD ÎMBUNĂTĂȚIT */}
        <div className="bg-[#11131f] p-10 rounded-[2.5rem] border border-white/10 flex flex-col min-h-[450px]">
          <h3 className="text-blue-500 font-bold text-[10px] uppercase mb-8 tracking-widest text-center">
            Specificații Produs
          </h3>

          <div className="flex-1 space-y-8">
            <div>
              <p className="text-[10px] font-black text-white/20 uppercase mb-2 ml-1">
                Identificator Articol
              </p>
              <input
                placeholder="Ex: PROD-101"
                className={`w-full bg-white/5 p-4 rounded-xl border transition-all outline-none ${
                  errors.productId
                    ? "border-red-500 shadow-lg shadow-red-500/10"
                    : "border-white/10 focus:border-blue-500"
                }`}
                onChange={(e) => {
                  const n = [...order.items];
                  n[0].productId = e.target.value;
                  setOrder({ ...order, items: n });
                }}
              />
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] font-black text-white/20 uppercase mb-2">
                Unități (Control Săgeți)
              </p>
              <input
                type="number"
                min="1"
                onKeyDown={(e) => e.preventDefault()} // Blochează tastatura
                className="w-full bg-transparent text-4xl font-black text-blue-500 outline-none text-center cursor-default select-none"
                value={order.items[0].quantity}
                onChange={(e) => {
                  const n = [...order.items];
                  n[0].quantity = parseInt(e.target.value);
                  setOrder({ ...order, items: n });
                }}
              />
            </div>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="w-full py-6 bg-blue-600 rounded-2xl font-black text-xs tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 mt-8"
          >
            {loading ? "SE SALVEAZĂ..." : "FINALIZEAZĂ ETAPA 1 →"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
