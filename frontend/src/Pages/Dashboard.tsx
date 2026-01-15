import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaHistory,
  FaBox,
  FaFileInvoiceDollar,
  FaTruck,
  FaTrash,
} from "react-icons/fa";

export const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
    setOrders(history);
  }, []);

  const handleDelete = (id: string) => {
    const updatedOrders = orders.filter((order) => order.id !== id);
    setOrders(updatedOrders);
    localStorage.setItem("ordersHistory", JSON.stringify(updatedOrders));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <h1 className="font-heading text-3xl font-extrabold uppercase mb-2">
          Consolă Monitorizare{" "}
          <span className="text-blue-500 italic">LOGICORE</span>
        </h1>
        <p className="font-mono text-[10px] text-white/30 uppercase tracking-[0.3em]">
          Status: Conectat la ApplicationDbContext
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Comenzi Noi (Pas 1)"
          value={orders.filter((o) => o.status === "Plasată").length} // Numără doar cele care așteaptă facturarea
          icon={<FaBox />}
          color="text-blue-500"
        />
        <StatCard
          title="În Așteptare Livrare (Pas 2)"
          value={orders.filter((o) => o.status === "Facturată").length} // Numără cele facturate, dar neexpediate
          icon={<FaFileInvoiceDollar />}
          color="text-emerald-500"
        />
        <StatCard
          title="Livrări Finalizate (Pas 3)"
          value={orders.filter((o) => o.status === "Livrată").length} // Numără doar fluxurile încheiate
          icon={<FaTruck />}
          color="text-purple-500"
        />
      </div>

      <div className="bg-[#11131f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <h3 className="font-heading font-bold uppercase text-[10px] tracking-widest opacity-50 flex items-center gap-2">
            <FaHistory /> Istoric Tranzacții Sesiune
          </h3>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-white/[0.01] text-[9px] font-bold uppercase tracking-widest text-white/40 border-b border-white/5">
              <th className="p-5 text-center">ID Rezervare</th>
              <th className="p-5 text-center">Client ID</th>
              <th className="p-5 text-center">Status Flux</th>
              <th className="p-5 text-center">Data & Ora Înregistrării</th>
              <th className="p-5 text-center">Acțiuni</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 font-mono">
            {orders.map((order, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-5 text-center text-blue-400 font-bold uppercase">
                  {order.id}
                </td>
                <td className="p-5 text-center text-white/70">
                  {order.customer}
                </td>
                <td className="p-5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded text-[9px] font-black uppercase border ${
                      order.status === "Plasată"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : order.status === "Facturată"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="p-5 text-center text-white/30 text-[11px]">
                  {order.date}
                </td>
                <td className="p-5 text-center">
                  <button
                    onClick={() => handleDelete(order.id)}
                    className="text-red-500 hover:text-red-400 transition-colors p-2"
                    title="Șterge comanda"
                  >
                    <FaTrash size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-[#11131f] border border-white/10 p-8 rounded-[2rem] flex items-center justify-between group">
    <div>
      <p className="font-heading text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">
        {title}
      </p>
      <p className="font-heading text-4xl font-extrabold tracking-tighter">
        {value}
      </p>
    </div>
    <div
      className={`text-3xl ${color} opacity-20 group-hover:opacity-100 transition-all`}
    >
      {icon}
    </div>
  </div>
);
