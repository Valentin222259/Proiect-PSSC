import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Sidebar } from "./components/Sidebar";
import { OrderPage } from "./pages/Orders";

// Componente placeholder pentru restul paginilor (le vom face ulterior)
const InvoicesPlaceholder = () => (
  <div className="p-10 text-2xl">Pagina Facturi în lucru...</div>
);
const ShipmentsPlaceholder = () => (
  <div className="p-10 text-2xl">Pagina Livrări în lucru...</div>
);

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#0b0d17] text-white">
        {/* Notificări tip "toast" */}
        <Toaster position="top-right" reverseOrder={false} />

        <Sidebar />

        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/orders" />} />
            <Route path="/orders" element={<OrderPage />} />
            <Route path="/invoices" element={<InvoicesPlaceholder />} />
            <Route path="/shipments" element={<ShipmentsPlaceholder />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
