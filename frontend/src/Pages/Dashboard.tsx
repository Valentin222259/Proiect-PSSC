import { motion } from "framer-motion";
import { FaRocket, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export const Dashboard = () => {
  const lastId = localStorage.getItem("lastOrderId") || "Nicio comandă activă";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-12 max-w-5xl"
    >
      <h1 className="text-4xl font-black mb-8">Sistem Management Logistic</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="Comenzi Azi"
          value="1"
          icon={<FaRocket className="text-blue-500" />}
        />
        <StatCard
          title="Facturi Emise"
          value="1"
          icon={<FaCheckCircle className="text-emerald-500" />}
        />
        <StatCard
          title="Erori Sistem"
          value="0"
          icon={<FaExclamationTriangle className="text-yellow-500" />}
        />
      </div>

      <div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
        <h3 className="text-xl font-bold mb-4">Ultima activitate</h3>
        <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
          <span>
            Comandă procesată:{" "}
            <span className="font-mono text-blue-400">{lastId}</span>
          </span>
          <span className="text-xs opacity-40">Chiar acum</span>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon }: any) => (
  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all cursor-default">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white/5 rounded-xl">{icon}</div>
    </div>
    <p className="text-sm opacity-50 uppercase tracking-wider font-bold">
      {title}
    </p>
    <p className="text-3xl font-black">{value}</p>
  </div>
);
