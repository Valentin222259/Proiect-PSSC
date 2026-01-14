import { NavLink } from "react-router-dom";
import { FaHome, FaBox, FaCircle } from "react-icons/fa";

export const Sidebar = () => (
  <aside className="w-72 border-r border-white/10 flex flex-col p-8 bg-[#07080d] backdrop-blur-2xl">
    <div className="mb-12">
      <div className="text-2xl font-black tracking-tighter flex items-center gap-2 text-white">
        <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20" />
        CORE<span className="text-blue-500 font-light text-xl">LOG</span>
      </div>
    </div>

    <nav className="flex-1 space-y-2">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
            isActive
              ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
              : "text-white/40 hover:text-white"
          }`
        }
      >
        <FaHome /> Dashboard
      </NavLink>
      <NavLink
        to="/orders"
        className={({ isActive }) =>
          `flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${
            isActive
              ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
              : "text-white/40 hover:text-white"
          }`
        }
      >
        <FaBox /> Procesare Comenzi
      </NavLink>
    </nav>

    <div className="mt-auto pt-6 border-t border-white/5">
      <div className="flex items-center gap-3 text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
        <FaCircle className="animate-pulse" size={6} /> Backend API: 5080
      </div>
    </div>
  </aside>
);
