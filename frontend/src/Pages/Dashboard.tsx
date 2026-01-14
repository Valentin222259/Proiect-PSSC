import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaHistory, FaBox, FaFileInvoiceDollar, FaTruck } from "react-icons/fa";

export const Dashboard = () => {
  // 1. Declarația variabilei 'orders' folosind useState pentru a fi găsită de .map()
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    // 2. Preluăm datele din localStorage la încărcarea paginii
    const history = JSON.parse(localStorage.getItem("ordersHistory") || "[]");
    setOrders(history);
  }, []);

  // Calculăm statisticile pentru cardurile de sus
  const invoiceCount = orders.filter(
    (o: any) => o.status === "Facturată"
  ).length;
  const shipmentCount = orders.filter(
    (o: any) => o.status === "Livrată"
  ).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-10 max-w-7xl mx-auto"
    >
      <header className="mb-12">
        <h1 className="text-3xl font-black tracking-tighter uppercase mb-2">
          Consolă Monitorizare{" "}
          <span className="text-blue-500 italic">LOGICORE</span>
        </h1>
        <p className="text-white/30 font-mono text-[10px] uppercase tracking-[0.3em]">
          Sistem activ: Conectat la ApplicationDbContext
        </p>
      </header>

      {/* Carduri Statistice */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-white">
        <StatCard
          title="Total Comenzi"
          value={orders.length}
          icon={<FaBox />}
          color="text-blue-500"
        />
        <StatCard
          title="Facturi Emise"
          value={invoiceCount}
          icon={<FaFileInvoiceDollar />}
          color="text-emerald-500"
        />
        <StatCard
          title="Livrări Finalizate"
          value={shipmentCount}
          icon={<FaTruck />}
          color="text-purple-500"
        />
      </div>

      {/* Tabel Istoric - CENTRAT ȘI PROFESIONAL */}
      <div className="bg-[#11131f] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
          <h3 className="font-bold uppercase text-[10px] tracking-[0.2em] opacity-50 flex items-center gap-2">
            <FaHistory /> Istoric Tranzacții Sesiune
          </h3>
          <span className="text-[10px] bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full font-black border border-blue-500/20 uppercase">
            Live Update
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-white/[0.01] text-[9px] uppercase tracking-widest text-white/40 border-b border-white/5">
                <th className="p-5 text-center">ID Rezervare</th>
                <th className="p-5 text-center">Client ID</th>
                <th className="p-5 text-center">Status Flux</th>
                <th className="p-5 text-center">Data & Ora Înregistrării</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length > 0 ? (
                orders.map((order: any, idx: number) => (
                  <tr
                    key={idx}
                    className="hover:bg-white/[0.02] transition-colors font-mono"
                  >
                    {/* Toate celulele sunt acum centrate (text-center) */}
                    <td className="p-5 text-center text-blue-400 font-bold uppercase tracking-wider">
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
                    <td className="p-5 text-center text-white/30 text-[11px] font-mono">
                      {order.date}{" "}
                      {/* Va afișa Data și Ora: DD.MM.YYYY, HH:MM */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-20 text-center text-white/10 italic text-sm"
                  >
                    Sistemul este pregătit. Așteptăm inițierea primei comenzi
                    logistice...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

// Componentă internă pentru cardurile de statistici
const StatCard = ({ title, value, icon, color }: any) => (
  <div className="bg-[#11131f] border border-white/10 p-8 rounded-[2.5rem] flex items-center justify-between group">
    <div>
      <p className="text-[10px] font-black uppercase text-white/30 tracking-widest mb-1">
        {title}
      </p>
      <p className="text-4xl font-black tracking-tighter">{value}</p>
    </div>
    <div
      className={`text-3xl ${color} opacity-20 group-hover:opacity-100 transition-all duration-500`}
    >
      {icon}
    </div>
  </div>
);
