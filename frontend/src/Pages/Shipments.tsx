import { useState } from "react";
import { Trash2, Plus, AlertCircle, CheckCircle } from "lucide-react";

const API_BASE = "http://localhost:5080";

const PRODUCTS = [
  { id: "PROD-001", name: "Widget A", price: 29.99 },
  { id: "PROD-002", name: "Widget B", price: 49.99 },
  { id: "PROD-003", name: "Gadget X", price: 15.5 },
];

interface Message {
  type: "success" | "error";
  text: string;
  details?: string;
}

function ShipmentForm({ setMessage }: { setMessage: (msg: Message) => void }) {
  const [formData, setFormData] = useState({
    orderId: "ORD-001",
    customerId: "CUST-001",
    street: "456 Shipping Lane",
    city: "Los Angeles",
    postalCode: "90001",
    country: "USA",
  });
  const [items, setItems] = useState([{ productId: "PROD-001", quantity: 5 }]);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { productId: "PROD-001", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_: any, i: number) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "quantity" ? parseInt(String(value)) || 0 : value,
    };
    setItems(newItems);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/shipment/prepare-shipment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: formData.orderId,
          customerId: formData.customerId,
          deliveryAddress: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          items: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Shipment prepared successfully!",
          details: `Tracking #${data.trackingNumber} - Carrier: ${data.carrier}`,
        });
        setTimeout(() => setMessage(null as any), 5000);
      } else {
        setMessage({
          type: "error",
          text: "Shipment preparation failed",
          details: data.message || JSON.stringify(data.reasons),
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Connection error",
        details: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">Prepare Shipment</h2>

      {/* Message Alert */}
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Order ID"
          value={formData.orderId}
          onChange={(e) =>
            setFormData({ ...formData, orderId: e.target.value })
          }
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
        />
        <input
          placeholder="Customer ID"
          value={formData.customerId}
          onChange={(e) =>
            setFormData({ ...formData, customerId: e.target.value })
          }
          className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
        />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Delivery Address
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            placeholder="Street"
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
          />
          <input
            placeholder="City"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
          />
          <input
            placeholder="Postal Code"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
          />
          <input
            placeholder="Country"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500"
          />
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Items</h3>
          <button
            onClick={addItem}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={18} /> Add Item
          </button>
        </div>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex gap-3 items-end">
              <select
                value={item.productId}
                onChange={(e) => updateItem(idx, "productId", e.target.value)}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              >
                {PRODUCTS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                className="w-24 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
              />
              <button
                onClick={() => removeItem(idx)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-all"
      >
        {loading ? "Preparing Shipment..." : "Prepare Shipment"}
      </button>
    </div>
  );
}

export const ShipmentPage = () => {
  const [message, setMessage] = useState<Message | null>(null);

  return (
    <div>
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg flex gap-3 ${
            message.type === "success"
              ? "bg-green-900/30 border border-green-700"
              : "bg-red-900/30 border border-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="text-green-400" />
          ) : (
            <AlertCircle className="text-red-400" />
          )}
          <div>
            <p>{message.text}</p>
            {message.details && <p className="text-sm">{message.details}</p>}
          </div>
        </div>
      )}
      <ShipmentForm setMessage={setMessage} />
    </div>
  );
};
