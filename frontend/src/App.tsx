import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./components/Sidebar";
import { Dashboard } from "./Pages/Dashboard";
import { OrderPage } from "./Pages/Orders";
import { InvoicePage } from "./Pages/Invoices";
import { ShipmentPage } from "./Pages/Shipments";
import { MyHistoryPage } from "./Pages/MyHistory";

function App() {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#07080d] text-white overflow-hidden">
      <Toaster
        toastOptions={{
          style: {
            background: "#1a1c2e",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_#1a1c2e_0%,_transparent_40%)]">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/invoices" element={<InvoicePage />} />
            <Route path="/shipments" element={<ShipmentPage />} />
            <Route path="/my-history" element={<MyHistoryPage />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
