import { NavLink } from "react-router-dom";
import { FaHome, FaBox, FaCircle, FaHistory } from "react-icons/fa";

export const Sidebar = () => (
  <aside className="w-72 border-r border-white/10 flex flex-col p-8 bg-[#07080d]">
    <div className="mb-12">
      <div className="font-heading text-2xl font-extrabold tracking-tighter flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20" />
        CORE<span className="text-blue-500 font-light">LOG</span>
      </div>
    </div>

    <nav className="flex-1 space-y-2">
      <MenuLink to="/" icon={<FaHome />} label="Dashboard" />
      <MenuLink to="/orders" icon={<FaBox />} label="Procesare Comenzi" />
      <MenuLink
        to="/my-history"
        icon={<FaHistory />}
        label="Istoric Personal"
      />
    </nav>

    <div className="mt-auto pt-6 border-t border-white/5">
      <div className="flex items-center gap-3 font-mono text-[9px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
        <FaCircle className="animate-pulse" size={6} /> Backend API: 5080
      </div>
    </div>
  </aside>
);

const MenuLink = ({ to, icon, label }: any) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-4 p-4 rounded-2xl font-bold transition-all duration-300 ${
        isActive
          ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
          : "text-white/40 hover:bg-white/5 hover:text-white"
      }`
    }
  >
    {icon} <span className="text-sm tracking-tight">{label}</span>
  </NavLink>
);
