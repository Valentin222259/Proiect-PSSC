import { useState, useEffect } from "react";
import { Trash2, Plus, FileText, AlertCircle, CheckCircle } from "lucide-react";
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

function InvoiceForm({
  setMessage,
  onInvoiceAdded,
  initialOrderId,
  initialCustomerId,
  initialItems,
}: {
  setMessage: (msg: Message) => void;
  onInvoiceAdded: (invoice: WorkflowItem) => void;
  initialOrderId?: string;
  initialCustomerId?: string;
  initialItems?: Array<{ productId: string; quantity: number }>;
}) {
  const [formData, setFormData] = useState({
    orderId: initialOrderId || "",
    customerId: initialCustomerId || "",
    invoiceNumber: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number }>
  >(initialItems || []);
  const [loading, setLoading] = useState(false);
  const hasOrderData =
    !!initialOrderId && !!initialCustomerId && (initialItems?.length || 0) > 0;

  useEffect(() => {
    if (initialOrderId) {
      setFormData((prev) => ({
        ...prev,
        orderId: initialOrderId,
        invoiceNumber: `INV-${Date.now()}`,
      }));
    }
    if (initialCustomerId) {
      setFormData((prev) => ({
        ...prev,
        customerId: initialCustomerId,
      }));
    }
    if (initialItems && initialItems.length > 0) {
      setItems(initialItems);
    }
  }, [initialOrderId, initialCustomerId, initialItems]);

  const addItem = () => {
    if (!hasOrderData) {
      setItems([...items, { productId: "PROD-001", quantity: 1 }]);
    }
  };

  const removeItem = (index: number) => {
    if (!hasOrderData) {
      setItems(items.filter((_: any, i: number) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    if (hasOrderData) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "quantity" ? parseInt(String(value)) || 0 : value,
    };
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items
      .reduce((sum: number, item: any) => {
        const product = PRODUCTS.find((p: any) => p.id === item.productId);
        return sum + (product?.price || 0) * item.quantity;
      }, 0)
      .toFixed(2);
  };

  const validateForm = () => {
    // Invoice Number: format like INV-XXX or similar
    if (!formData.invoiceNumber) {
      return {
        valid: false,
        message: "Invoice Number is required",
        details: "e.g., INV-001",
      };
    }
    if (!/^[A-Z]+-\d{3,}$/.test(formData.invoiceNumber)) {
      return {
        valid: false,
        message: "Invalid Invoice Number format",
        details: "Format: INV-001 (letters-numbers)",
      };
    }
    // Street: non-empty, min 5 chars
    if (!formData.street || formData.street.length < 5) {
      return {
        valid: false,
        message: "Invalid street address",
        details: "Must be at least 5 characters",
      };
    }
    // City: non-empty, min 2 chars
    if (!formData.city || formData.city.length < 2) {
      return {
        valid: false,
        message: "Invalid city name",
        details: "Must be at least 2 characters",
      };
    }
    // Postal Code: exactly 6 digits
    if (!/^\d{6}$/.test(formData.postalCode)) {
      return {
        valid: false,
        message: "Invalid postal code",
        details: "Must be exactly 6 digits (e.g., 435500)",
      };
    }
    // Country: non-empty, min 2 chars
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
      case "invoiceNumber":
        return formData.invoiceNumber
          ? /^[A-Z]+-\d{3,}$/.test(formData.invoiceNumber)
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
      case "invoiceNumber":
        return formData.invoiceNumber
          ? /^[A-Z]+-\d{3,}$/.test(formData.invoiceNumber)
            ? ""
            : "Format: INV-001"
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

      const response = await fetch(`${API_BASE}/invoice/generate-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: formData.orderId,
          customerId: formData.customerId,
          billingAddress: {
            street: formData.street,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
          items: items.map((item: any) => {
            const product = PRODUCTS.find((p: any) => p.id === item.productId);
            return {
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: product?.price.toString() || "0",
            };
          }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        const invoiceId = `INV-${Date.now()}`;
        onInvoiceAdded({
          id: invoiceId,
          customerId: formData.customerId,
          status: "completed",
          details: {
            orderId: formData.orderId,
            total: calculateTotal(),
            city: formData.city,
            invoiceNumber: data.invoiceNumber,
            items: items, // Store items for later use in shipping
          },
        });
        setMessage({
          type: "success",
          text: "Invoice generated successfully!",
          details: `Invoice #${data.invoiceNumber} - Total: $${calculateTotal()}`,
        });
        // Reset form
        setFormData({
          orderId: "",
          customerId: "",
          invoiceNumber: "",
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
          text: "Invoice generation failed",
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
    <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Order ID"
          value={formData.orderId}
          onChange={(e: any) =>
            setFormData({ ...formData, orderId: e.target.value })
          }
          disabled={hasOrderData}
          className={`rounded-lg p-2 border ${
            hasOrderData
              ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-[#07080d] border-white/10"
          }`}
        />
        <input
          placeholder="Customer ID"
          value={formData.customerId}
          onChange={(e) =>
            setFormData({ ...formData, customerId: e.target.value })
          }
          disabled={hasOrderData}
          className={`rounded-lg p-2 border ${
            hasOrderData
              ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-[#07080d] border-white/10"
          }`}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Billing Address</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              placeholder="Street"
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
              placeholder="City"
              value={formData.city}
              onChange={(e) =>
                setFormData({ ...formData, city: e.target.value })
              }
              autoComplete="off"
              name={`city-${Math.random()}`}
              className={`w-full bg-[#07080d] border rounded-lg p-2 ${
                formData.city && !isFieldValid("city")
                  ? "border-red-500"
                  : "border-white/10"
              }`}
            />
            {formData.city && getFieldError("city") && (
              <p className="text-red-400 text-xs mt-1">
                {getFieldError("city")}
              </p>
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
              placeholder="Country"
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
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">
            Items{" "}
            {hasOrderData && (
              <span className="text-xs text-gray-400">(from order)</span>
            )}
          </h3>
          <button
            onClick={addItem}
            disabled={hasOrderData}
            className={`text-sm px-3 py-1 rounded-md flex items-center gap-1 ${
              hasOrderData
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <select
              value={item.productId}
              onChange={(e) => updateItem(idx, "productId", e.target.value)}
              disabled={hasOrderData}
              className={`flex-1 rounded-lg p-2 border ${
                hasOrderData
                  ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-[#07080d] border-white/10"
              }`}
            >
              {PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
              disabled={hasOrderData}
              className={`w-24 rounded-lg p-2 border ${
                hasOrderData
                  ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-[#07080d] border-white/10"
              }`}
            />
            <button
              onClick={() => removeItem(idx)}
              disabled={hasOrderData}
              className={`p-2 rounded-lg ${
                hasOrderData
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-red-500 hover:bg-red-500/10"
              }`}
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
          {loading ? "Generating..." : "Generate Invoice"}
        </button>
      </div>
    </div>
  );
}

export const InvoicePage = ({
  workflowState,
  onInvoiceAdded,
}: {
  workflowState: WorkflowState;
  onInvoiceAdded: (invoice: WorkflowItem) => void;
}) => {
  const [message, setMessage] = useState<Message | null>(null);
  const [formState, setFormState] = useState({
    orderId: "",
    customerId: "",
    items: [] as Array<{ productId: string; quantity: number }>,
  });

  const handleOrderClick = (order: WorkflowItem) => {
    setFormState({
      orderId: order.id,
      customerId: order.customerId,
      items: order.details?.items || [],
    });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
        <FileText className="text-blue-500" /> Generate Invoice
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Generate invoices from existing orders. Select an order from the list
        below to auto-populate the form.
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

      {workflowState.orders.filter(
        (order) =>
          !workflowState.invoices.some(
            (inv) => inv.details?.orderId === order.id,
          ),
      ).length > 0 && (
        <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2">
            📦 Available Orders (click to populate form)
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Only orders without invoices are shown. Click on an order to
            auto-fill the form.
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
                {workflowState.orders
                  .filter(
                    (order) =>
                      !workflowState.invoices.some(
                        (inv) => inv.details?.orderId === order.id,
                      ),
                  )
                  .map((order) => (
                    <tr
                      key={order.id}
                      onClick={() => handleOrderClick(order)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
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
                        <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs">
                          Ready
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InvoiceForm
        setMessage={setMessage}
        onInvoiceAdded={onInvoiceAdded}
        initialOrderId={formState.orderId}
        initialCustomerId={formState.customerId}
        initialItems={formState.items}
      />

      {workflowState.invoices.length > 0 && (
        <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">📄 Generated Invoices</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-center py-3 px-4">Invoice ID</th>
                  <th className="text-center py-3 px-4">From Order</th>
                  <th className="text-center py-3 px-4">Customer ID</th>
                  <th className="text-center py-3 px-4">City</th>
                  <th className="text-center py-3 px-4">Total</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {workflowState.invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-white/5 hover:bg-white/5"
                  >
                    <td className="text-center py-3 px-4 font-mono text-purple-400">
                      {invoice.id}
                    </td>
                    <td className="text-center py-3 px-4 font-mono text-blue-400">
                      {invoice.details?.orderId}
                    </td>
                    <td className="text-center py-3 px-4">
                      {invoice.customerId}
                    </td>
                    <td className="text-center py-3 px-4">
                      {invoice.details?.city}
                    </td>
                    <td className="text-center py-3 px-4 text-green-400">
                      ${invoice.details?.total}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                          workflowState.completedWorkflows.some(
                            (ship) =>
                              ship.details?.orderId ===
                              invoice.details?.orderId,
                          )
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/20 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {workflowState.completedWorkflows.some(
                          (ship) =>
                            ship.details?.orderId === invoice.details?.orderId,
                        )
                          ? "Delivered"
                          : "In Transit"}
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
