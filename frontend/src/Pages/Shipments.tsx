import { useState, useEffect, useRef } from "react";
import {
  Trash2,
  Plus,
  Truck,
  AlertCircle,
  CheckCircle,
  Trophy,
} from "lucide-react";
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

function ShipmentForm({
  setMessage,
  onShipmentAdded,
  initialOrderId,
  initialCustomerId,
  initialItems,
}: {
  setMessage: (msg: Message) => void;
  onShipmentAdded: (shipment: WorkflowItem) => void;
  initialOrderId?: string;
  initialCustomerId?: string;
  initialItems?: Array<{ productId: string; quantity: number }>;
}) {
  const [formData, setFormData] = useState({
    orderId: initialOrderId || "",
    customerId: initialCustomerId || "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [items, setItems] = useState<
    Array<{ productId: string; quantity: number }>
  >(initialItems || []);
  const [loading, setLoading] = useState(false);
  const hasInvoiceData =
    !!initialOrderId && !!initialCustomerId && (initialItems?.length || 0) > 0;

  useEffect(() => {
    if (initialOrderId) {
      setFormData((prev) => ({
        ...prev,
        orderId: initialOrderId,
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
    if (!hasInvoiceData) {
      setItems([...items, { productId: "PROD-001", quantity: 1 }]);
    }
  };

  const removeItem = (index: number) => {
    if (!hasInvoiceData) {
      setItems(items.filter((_: any, i: number) => i !== index));
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    if (hasInvoiceData) return;
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      [field]: field === "quantity" ? parseInt(String(value)) || 0 : value,
    };
    setItems(newItems);
  };

  const validateForm = () => {
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
        const shipmentId = `SHIP-${Date.now()}`;
        onShipmentAdded({
          id: shipmentId,
          customerId: formData.customerId,
          status: "completed",
          details: {
            orderId: formData.orderId,
            invoiceId: `INV-${Date.now() - 1000}`,
            city: formData.city,
            trackingNumber: data.trackingNumber,
            carrier: data.carrier,
          },
        });
        setMessage({
          type: "success",
          text: "Shipment prepared successfully!",
          details: `Tracking #${data.trackingNumber} - Carrier: ${data.carrier}`,
        });
        // Reset form
        setFormData({
          orderId: "",
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
    <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6 space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <input
          placeholder="Order ID"
          value={formData.orderId}
          onChange={(e) =>
            setFormData({ ...formData, orderId: e.target.value })
          }
          disabled={hasInvoiceData}
          className={`rounded-lg p-2 border ${
            hasInvoiceData
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
          disabled={hasInvoiceData}
          className={`rounded-lg p-2 border ${
            hasInvoiceData
              ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
              : "bg-[#07080d] border-white/10"
          }`}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-2">Delivery Address</h3>
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
            {hasInvoiceData && (
              <span className="text-xs text-gray-400">(from invoice)</span>
            )}
          </h3>
          <button
            onClick={addItem}
            disabled={hasInvoiceData}
            className={`text-sm px-3 py-1 rounded-md flex items-center gap-1 ${
              hasInvoiceData
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
              disabled={hasInvoiceData}
              className={`flex-1 rounded-lg p-2 border ${
                hasInvoiceData
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
              disabled={hasInvoiceData}
              className={`w-24 rounded-lg p-2 border ${
                hasInvoiceData
                  ? "bg-gray-700 border-gray-600 text-gray-300 cursor-not-allowed"
                  : "bg-[#07080d] border-white/10"
              }`}
            />
            <button
              onClick={() => removeItem(idx)}
              disabled={hasInvoiceData}
              className={`p-2 rounded-lg ${
                hasInvoiceData
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
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-lg font-bold"
        >
          {loading ? "Preparing..." : "Prepare Shipment"}
        </button>
      </div>
    </div>
  );
}

export const ShipmentPage = ({
  workflowState,
  onShipmentAdded,
}: {
  workflowState: WorkflowState;
  onShipmentAdded: (shipment: WorkflowItem) => void;
}) => {
  const [message, setMessage] = useState<Message | null>(null);
  const [formState, setFormState] = useState({
    orderId: "",
    customerId: "",
    items: [] as Array<{ productId: string; quantity: number }>,
  });
  const completedWorkflowsRef = useRef<HTMLDivElement>(null);

  const handleInvoiceClick = (invoice: WorkflowItem) => {
    setFormState({
      orderId: invoice.details?.orderId || "",
      customerId: invoice.customerId,
      items: invoice.details?.items || [],
    });
  };

  useEffect(() => {
    if (message?.type === "success" && completedWorkflowsRef.current) {
      setTimeout(() => {
        completedWorkflowsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 500);
    }
  }, [message]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold flex items-center gap-2 mb-2">
        <Truck className="text-blue-500" /> Prepare Shipment
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        Prepare shipments from existing invoices. Select an invoice to
        auto-populate delivery details.
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

      {workflowState.invoices.filter(
        (invoice) =>
          !workflowState.completedWorkflows.some(
            (ship) => ship.details?.orderId === invoice.details?.orderId,
          ),
      ).length > 0 && (
        <div className="bg-[#1a1c2e] border border-white/10 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-2">
            📄 Available Invoices (click to populate form)
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Only invoices pending shipment are shown. Click on an invoice to
            auto-fill the form.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-center py-3 px-4">Invoice ID</th>
                  <th className="text-center py-3 px-4">Order ID</th>
                  <th className="text-center py-3 px-4">Customer ID</th>
                  <th className="text-center py-3 px-4">City</th>
                  <th className="text-center py-3 px-4">Total</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {workflowState.invoices
                  .filter(
                    (invoice) =>
                      !workflowState.completedWorkflows.some(
                        (ship) =>
                          ship.details?.orderId === invoice.details?.orderId,
                      ),
                  )
                  .map((invoice) => (
                    <tr
                      key={invoice.id}
                      onClick={() => handleInvoiceClick(invoice)}
                      className="border-b border-white/5 hover:bg-white/5 cursor-pointer"
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
                        <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs">
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

      <ShipmentForm
        setMessage={setMessage}
        onShipmentAdded={onShipmentAdded}
        initialOrderId={formState.orderId}
        initialCustomerId={formState.customerId}
        initialItems={formState.items}
      />

      {workflowState.completedWorkflows.length > 0 && (
        <div
          ref={completedWorkflowsRef}
          className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-500/30 rounded-xl p-6"
        >
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-green-400">
            <Trophy size={32} /> Completed End-to-End Workflows
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-green-500/20">
                  <th className="text-center py-3 px-4">Shipment ID</th>
                  <th className="text-center py-3 px-4">Order ID</th>
                  <th className="text-center py-3 px-4">Customer ID</th>
                  <th className="text-center py-3 px-4">Tracking #</th>
                  <th className="text-center py-3 px-4">Carrier</th>
                  <th className="text-center py-3 px-4">Destination</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {workflowState.completedWorkflows.map((workflow) => (
                  <tr
                    key={workflow.id}
                    className="border-b border-green-500/10 hover:bg-green-500/5"
                  >
                    <td className="text-center py-3 px-4 font-mono text-green-400">
                      {workflow.id}
                    </td>
                    <td className="text-center py-3 px-4 font-mono text-blue-400">
                      {workflow.details?.orderId}
                    </td>
                    <td className="text-center py-3 px-4">
                      {workflow.customerId}
                    </td>
                    <td className="text-center py-3 px-4 font-mono text-yellow-400">
                      {workflow.details?.trackingNumber}
                    </td>
                    <td className="text-center py-3 px-4">
                      {workflow.details?.carrier}
                    </td>
                    <td className="text-center py-3 px-4">
                      {workflow.details?.city}
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 w-fit justify-center">
                        <CheckCircle size={14} /> DELIVERED
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
