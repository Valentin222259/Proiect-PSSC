// În frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./components/Sidebar";
import { OrderPage } from "./Pages/Orders";
import { InvoicePage } from "./Pages/Invoices";
import { ShipmentPage } from "./Pages/Shipments";
import { Dashboard } from "./Pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0b0d17] text-white font-sans">
        <Toaster position="top-right" />
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#0b0d17] to-[#1a1c2e]">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/invoices" element={<InvoicePage />} />
            <Route path="/shipments" element={<ShipmentPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
