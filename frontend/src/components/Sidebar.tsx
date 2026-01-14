import { NavLink } from "react-router-dom";
import {
  FaBox,
  FaFileInvoiceDollar,
  FaTruckLoading,
  FaTerminal,
} from "react-icons/fa";

export const Sidebar = () => {
  const menuItems = [
    { name: "Comenzi", path: "/orders", icon: <FaBox /> },
    { name: "Facturare", path: "/invoices", icon: <FaFileInvoiceDollar /> },
    { name: "Livrări", path: "/shipments", icon: <FaTruckLoading /> },
  ];

  return (
    <aside className="w-72 bg-white/5 border-r border-white/10 flex flex-col p-6 h-screen sticky top-0">
      <div className="flex items-center gap-3 text-2xl font-bold tracking-tighter mb-10">
        <div className="bg-blue-600 p-2 rounded-lg">
          <FaTerminal size={20} />
        </div>
        <span>
          PSSC<span className="text-blue-500">.ERP</span>
        </span>
      </div>

      <nav className="flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-4 p-4 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-white/5 rounded-xl border border-white/5 text-xs text-white/30 italic">
        Backend Connected: localhost:5080
      </div>
    </aside>
  );
};
