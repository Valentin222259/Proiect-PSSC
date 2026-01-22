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
    customerId: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number }>
  >([]);
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

  const validateForm = () => {
    // Customer ID
    if (!formData.customerId) {
      return {
        valid: false,
        message: "Customer ID is required",
        details: "e.g., CUST-001",
      };
    }
    if (!/^[A-Z]+-\d{3,}$/.test(formData.customerId)) {
      return {
        valid: false,
        message: "Invalid Customer ID format",
        details: "Format: CUST-001 (letters-numbers)",
      };
    }
    // Street
    if (!formData.street || formData.street.length < 5) {
      return {
        valid: false,
        message: "Invalid street address",
        details: "Must be at least 5 characters",
      };
    }
    // City
    if (!formData.city || formData.city.length < 2) {
      return {
        valid: false,
        message: "Invalid city name",
        details: "Must be at least 2 characters",
      };
    }
    // Postal Code
    if (!/^\d{6}$/.test(formData.postalCode)) {
      return {
        valid: false,
        message: "Invalid postal code",
        details: "Must be exactly 6 digits (e.g., 435500)",
      };
    }
    // Country
    if (!formData.country || formData.country.length < 2) {
      return {
        valid: false,
        message: "Invalid country name",
        details: "Must be at least 2 characters",
      };
    }
    return { valid: true, message: "" };
  };

  const isFieldValid = (field: string): boolean => {
    switch (field) {
      case "customerId":
        return formData.customerId
          ? /^[A-Z]+-\d{3,}$/.test(formData.customerId)
          : false;
      case "street":
        return formData.street.length >= 5;
      case "city":
        return formData.city.length >= 2;
      case "postalCode":
        return /^\d{6}$/.test(formData.postalCode);
      case "country":
        return formData.country.length >= 2;
      default:
        return true;
    }
  };

  const getFieldError = (field: string): string => {
    switch (field) {
      case "customerId":
        return formData.customerId
          ? /^[A-Z]+-\d{3,}$/.test(formData.customerId)
            ? ""
            : "Format: CUST-001"
          : "Required";
      case "postalCode":
        return formData.postalCode
          ? /^\d{6}$/.test(formData.postalCode)
            ? ""
            : "Must be 6 digits"
          : "Required";
      case "street":
        return formData.street.length < 5 && formData.street.length > 0
          ? "Min 5 chars"
          : "";
      case "city":
        return formData.city.length < 2 && formData.city.length > 0
          ? "Min 2 chars"
          : "";
      case "country":
        return formData.country.length < 2 && formData.country.length > 0
          ? "Min 2 chars"
          : "";
      default:
        return "";
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const validation = validateForm();
      if (!validation.valid) {
        setMessage({
          type: "error",
          text: validation.message,
          details: validation.details,
        });
        setLoading(false);
        return;
      }

      if (!items || items.length === 0) {
        setMessage({
          type: "error",
          text: "Please add at least one item",
          details: "Order must contain items",
        });
        setLoading(false);
        return;
      }

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
            items: items, // Store items for later use in invoicing/shipping
          },
        });
        setMessage({
          type: "success",
          text: "Order placed successfully!",
          details: `Order #${orderId} - Total: $${calculateTotal()}`,
        });
        // Reset form
        setFormData({
          customerId: "",
          street: "",
          city: "",
          postalCode: "",
          country: "",
        });
        setItems([]);
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
        <h3 className="text-lg font-semibold mb-4">Order Information</h3>
        <label className="block text-sm font-medium mb-2">
          Customer ID <span className="text-gray-500 text-xs\">(Required)</span>
        </label>
        <input
          type="text"
          placeholder="e.g., CUST-001"
          value={formData.customerId}
          onChange={(e) =>
            setFormData({ ...formData, customerId: e.target.value })
          }
          autoComplete="off"
          name={`customerId-${Math.random()}`}
          className={`w-full bg-[#07080d] border rounded-lg p-2 ${
            formData.customerId && !isFieldValid("customerId")
              ? "border-red-500 focus:border-red-500"
              : "border-white/10"
          }`}
        />
        {formData.customerId && getFieldError("customerId") && (
          <p className="text-red-400 text-xs mt-1">
            {getFieldError("customerId")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            placeholder="Street Address"
            value={formData.street}
            onChange={(e) =>
              setFormData({ ...formData, street: e.target.value })
            }
            autoComplete="off"
            name={`street-${Math.random()}`}
            className={`w-full bg-[#07080d] border rounded-lg p-2 ${
              formData.street && !isFieldValid("street")
                ? "border-red-500"
                : "border-white/10"
            }`}
          />
          {formData.street && getFieldError("street") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("street")}
            </p>
          )}
        </div>
        <div>
          <input
            placeholder="City Name"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            autoComplete="off"
            name={`city-${Math.random()}`}
            className={`w-full bg-[#07080d] border rounded-lg p-2 ${
              formData.city && !isFieldValid("city")
                ? "border-red-500"
                : "border-white/10"
            }`}
          />
          {formData.city && getFieldError("city") && (
            <p className="text-red-400 text-xs mt-1">{getFieldError("city")}</p>
          )}
        </div>
        <div>
          <input
            placeholder="Postal Code (6 digits)"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({ ...formData, postalCode: e.target.value })
            }
            autoComplete="off"
            name={`postalCode-${Math.random()}`}
            maxLength={6}
            className={`w-full bg-[#07080d] border rounded-lg p-2 ${
              formData.postalCode && !isFieldValid("postalCode")
                ? "border-red-500"
                : "border-white/10"
            }`}
          />
          {formData.postalCode && getFieldError("postalCode") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("postalCode")}
            </p>
          )}
        </div>
        <div>
          <input
            placeholder="Country Name"
            value={formData.country}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            autoComplete="off"
            name={`country-${Math.random()}`}
            className={`w-full bg-[#07080d] border rounded-lg p-2 ${
              formData.country && !isFieldValid("country")
                ? "border-red-500"
                : "border-white/10"
            }`}
          />
          {formData.country && getFieldError("country") && (
            <p className="text-red-400 text-xs mt-1">
              {getFieldError("country")}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg\">Order Items</h3>
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
      <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
        <Package className="text-blue-500" /> Place Order
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Create a new order by entering customer details and selecting items from
        our catalog.
      </p>

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
          <h3 className="text-xl font-bold mb-2">Recent Orders</h3>
          <p className="text-gray-400 text-sm mb-4">
            All orders placed in this session. Orders transition to "Processing"
            once an invoice is generated.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-center py-3 px-4">Order ID</th>
                  <th className="text-center py-3 px-4">Customer ID</th>
                  <th className="text-center py-3 px-4">City</th>
                  <th className="text-center py-3 px-4">Total</th>
                  <th className="text-center py-3 px-4">Items</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {workflowState.orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="text-center py-3 px-4 font-mono text-blue-400">
                      {order.id}
                    </td>
                    <td className="text-center py-3 px-4">
                      {order.customerId}
                    </td>
                    <td className="text-center py-3 px-4">
                      {order.details?.city}
                    </td>
                    <td className="text-center py-3 px-4 text-green-400">
                      ${order.details?.total}
                    </td>
                    <td className="text-center py-3 px-4">
                      {order.details?.itemCount}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                          workflowState.completedWorkflows.some(
                            (ship) => ship.details?.orderId === order.id,
                          )
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : workflowState.invoices.some(
                                  (inv) => inv.details?.orderId === order.id,
                                )
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                        }`}
                      >
                        {workflowState.completedWorkflows.some(
                          (ship) => ship.details?.orderId === order.id,
                        )
                          ? "Delivered"
                          : workflowState.invoices.some(
                                (inv) => inv.details?.orderId === order.id,
                              )
                            ? "Processing"
                            : "Pending"}
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
