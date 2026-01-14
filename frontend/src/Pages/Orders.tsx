import { useState } from "react";
import { OrderApi } from "../api/client";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

export const OrderPage = () => {
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState({
    customerId: "", // Golit
    deliveryAddress: {
      street: "",
      city: "",
      postalCode: "",
      country: "Romania",
    },
    items: [{ productId: "", quantity: 1 }], // Golit
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await OrderApi.placeOrder(order);

      // Luăm ID-ul primit (care zici că e CUST-123)
      const rawId = response.data.orderId;

      // Îl salvăm ca "ultimul ID" pentru a fi folosit automat în alte tab-uri
      localStorage.setItem("lastOrderId", rawId);

      toast.success(`Comandă reușită! ID salvat: ${rawId}`);
    } catch (error: any) {
      const errorMsg =
        error.response?.data || "Eroare la conectarea cu serverul";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-12 max-w-4xl"
    >
      <header className="mb-10">
        <h1 className="text-4xl font-black mb-2">Management Comenzi</h1>
        <p className="text-white/40">
          Înregistrează o comandă nouă în sistemul logistic.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Secțiune Client & Adresă */}
        <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10">
          <h3 className="text-lg font-bold border-b border-white/10 pb-4 mb-4">
            Date Expediție
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 block mb-2 font-bold">
                Client ID
              </label>
              <input
                className="w-full bg-white/10 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none transition-all"
                value={order.customerId}
                onChange={(e) =>
                  setOrder({ ...order, customerId: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs uppercase tracking-widest text-white/30 block mb-2 font-bold">
                  Oraș
                </label>
                <input
                  className="w-full bg-white/10 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none"
                  value={order.deliveryAddress.city}
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
                <label className="text-xs uppercase tracking-widest text-white/30 block mb-2 font-bold">
                  Cod Poștal
                </label>
                <input
                  className="w-full bg-white/10 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none"
                  value={order.deliveryAddress.postalCode}
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

            <div>
              <label className="text-xs uppercase tracking-widest text-white/30 block mb-2 font-bold">
                Stradă
              </label>
              <input
                className="w-full bg-white/10 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none"
                value={order.deliveryAddress.street}
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
          </div>
        </div>

        {/* Secțiune Produse */}
        <div className="space-y-6 bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col">
          <h3 className="text-lg font-bold border-b border-white/10 pb-4 mb-4">
            Articole Comandate
          </h3>

          <div className="space-y-4 flex-1">
            {order.items.map((item, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest text-white/30 block mb-2 font-bold">
                    Produs ID
                  </label>
                  <input
                    className="w-full bg-white/10 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none"
                    value={item.productId}
                    onChange={(e) => {
                      const newItems = [...order.items];
                      newItems[index].productId = e.target.value;
                      setOrder({ ...order, items: newItems });
                    }}
                  />
                </div>
                <div className="w-24">
                  <label className="text-xs uppercase tracking-widest text-white/30 block mb-2 font-bold">
                    Cant.
                  </label>
                  <input
                    type="number"
                    className="w-full bg-white/10 p-4 rounded-xl border border-white/10 focus:border-blue-500 outline-none text-center"
                    value={item.quantity}
                    onChange={(e) => {
                      const newItems = [...order.items];
                      newItems[index].quantity = parseInt(e.target.value);
                      setOrder({ ...order, items: newItems });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full p-5 rounded-2xl font-black text-lg transition-all transform active:scale-95 ${
              loading
                ? "bg-white/10 text-white/30 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 shadow-[0_10px_30px_rgba(37,99,235,0.3)]"
            }`}
          >
            {loading ? "SE PROCESEAZĂ..." : "FINALIZEAZĂ COMANDA"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
