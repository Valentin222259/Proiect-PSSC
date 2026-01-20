import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";

export const MyHistoryPage = () => {
  const [myOrders, setMyOrders] = useState<any[]>([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("userCreatedOrders") || "[]");
    setMyOrders(saved);
  }, []);

  const handleDelete = (internalId: string) => {
    const updated = myOrders.filter((o) => o.internalId !== internalId);
    setMyOrders(updated);
    localStorage.setItem("userCreatedOrders", JSON.stringify(updated));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <h1 className="font-heading text-3xl font-extrabold uppercase mb-2">
          Gestiune <span className="text-blue-500 italic">Comenzi Manuale</span>
        </h1>
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">
          Istoric detaliat al procesărilor live
        </p>
      </header>

      <div className="bg-[#11131f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.01] text-[9px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">
              <th className="p-5 text-center">ID Client</th>
              <th className="p-5 text-center">Adresă</th>
              <th className="p-5 text-center">Oraș</th>
              <th className="p-5 text-center">Cod Postal</th>
              <th className="p-5 text-center">ID Articol</th>
              <th className="p-5 text-center">Bucăți</th>
              <th className="p-5 text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono text-[11px]">
            {myOrders.map((o) => (
              <tr
                key={o.internalId}
                className="hover:bg-white/[0.02] transition-colors"
              >
                <td className="p-5 text-center text-white/80 font-bold">
                  {o.customerId || o.customer}
                </td>
                <td className="p-5 text-center text-white/50">{o.street}</td>
                <td className="p-5 text-center text-white/50">{o.city}</td>
                <td className="p-5 text-center text-white/30">
                  {o.postalCode}
                </td>
                <td className="p-5 text-center text-blue-400 font-bold uppercase">
                  {o.productId}
                </td>
                <td className="p-5 text-center">
                  <span className="bg-blue-500/10 text-blue-500 px-3 py-1 rounded-lg font-black">
                    {o.quantity}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <button
                    onClick={() => handleDelete(o.internalId)}
                    className="text-red-500 hover:text-red-400 transition-colors p-2"
                  >
                    <FaTrash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {myOrders.length === 0 && (
          <div className="p-20 text-center text-white/10 italic font-heading uppercase tracking-widest">
            Nu există date înregistrate manual.
          </div>
        )}
      </div>
    </motion.div>
  );
};
