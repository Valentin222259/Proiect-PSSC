import { useState } from "react";
import { Trash2, Plus, Package, AlertCircle, CheckCircle } from "lucide-react";
import type { WorkflowState, WorkflowItem } from "../App";

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

function OrderForm({
  setMessage,
  onOrderAdded,
}: {
  setMessage: (msg: Message) => void;
  onOrderAdded: (order: WorkflowItem) => void;
}) {
  const [formData, setFormData] = useState({
    customerId: "CUST-001",
    street: "123 Main Street",
    city: "New York",
    postalCode: "10001",
    country: "USA",
  });
  const [items, setItems] = useState([
    { productId: "PROD-001", quantity: 5 },
    { productId: "PROD-002", quantity: 3 },
  ]);
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    setItems([...items, { productId: "PROD-001", quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "quantity" ? parseInt(String(value)) || 0 : value,
    };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items
      .reduce((sum, item) => {
        const product = PRODUCTS.find((p) => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/order/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: formData.customerId,
          deliveryAddress: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }),
      });
      const data = await response.json();
      if (response.ok) {
        const orderId = `ORD-${Date.now()}`;
        onOrderAdded({
          id: orderId,
          customerId: formData.customerId,
          status: "completed",
          details: {
            total: calculateTotal(),
            itemCount: items.length,
            city: formData.city,
          },
        });
        setMessage({
          type: "success",
          text: "Order placed successfully!",
          details: `Order #${orderId} - Total: $${calculateTotal()}`,
        });
        setTimeout(() => setMessage(null as any), 5000);
      } else {
        setMessage({
          type: "error",
          text: "Order failed",
          details: data.message,
        });
      }
    } catch (error: any) {
      setMessage({
        type: "error",
        text: "Connection error",
        details: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6 space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">Customer ID</label>
        <input
          type="text"
          value={formData.customerId}
          onChange={(e) =>
            setFormData({ ...formData, customerId: e.target.value })
          }
          className="w-full bg-[#07080d] border border-white/10 rounded-lg p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Street"
          value={formData.street}
          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          className="bg-[#07080d] border border-white/10 rounded-lg p-2"
        />
        <input
          placeholder="City"
          value={formData.city}
          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          className="bg-[#07080d] border border-white/10 rounded-lg p-2"
        />
        <input
          placeholder="Postal Code"
          value={formData.postalCode}
          onChange={(e) =>
            setFormData({ ...formData, postalCode: e.target.value })
          }
          className="bg-[#07080d] border border-white/10 rounded-lg p-2"
        />
        <input
          placeholder="Country"
          value={formData.country}
          onChange={(e) =>
            setFormData({ ...formData, country: e.target.value })
          }
          className="bg-[#07080d] border border-white/10 rounded-lg p-2"
        />
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Items</h3>
          <button
            onClick={addItem}
            className="text-sm bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-md flex items-center gap-1"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <select
              value={item.productId}
              onChange={(e) => updateItem(idx, "productId", e.target.value)}
              className="flex-1 bg-[#07080d] border border-white/10 rounded-lg p-2"
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price})
                </option>
              ))}
            </select>
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
              className="w-20 bg-[#07080d] border border-white/10 rounded-lg p-2"
            />
            <button
              onClick={() => removeItem(idx)}
              className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-white/10 flex justify-between items-center">
        <span className="text-xl font-bold">
          Total: <span className="text-green-400">${calculateTotal()}</span>
        </span>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-bold"
        >
          {loading ? "Processing..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export const OrderPage = ({
  workflowState,
  onOrderAdded,
}: {
  workflowState: WorkflowState;
  onOrderAdded: (order: WorkflowItem) => void;
}) => {
  const [message, setMessage] = useState<Message | null>(null);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-2">
        <Package className="text-blue-500" /> Place Order
      </h2>

      {message && (
        <div
          className={`p-4 rounded-lg flex gap-3 ${
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
            <p className="font-bold">{message.text}</p>
            <p className="text-sm opacity-80">{message.details}</p>
          </div>
        </div>
      )}

      <OrderForm setMessage={setMessage} onOrderAdded={onOrderAdded} />

      {workflowState.orders.length > 0 && (
        <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4">Order ID</th>
                  <th className="text-left py-3 px-4">Customer ID</th>
                  <th className="text-left py-3 px-4">City</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {workflowState.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="py-3 px-4 font-mono text-blue-400">
                      {order.id}
                    </td>
                    <td className="py-3 px-4">{order.customerId}</td>
                    <td className="py-3 px-4">{order.details?.city}</td>
                    <td className="py-3 px-4 text-green-400">
                      ${order.details?.total}
                    </td>
                    <td className="py-3 px-4">{order.details?.itemCount}</td>
                    <td className="py-3 px-4">
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
