import axios from 'axios';

// Adresa de bază a backend-ului tău (verifică să fie cea din launchSettings.json)
const api = axios.create({
  baseURL: 'http://localhost:5080', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export const OrderApi = {
  // Trimite date către [HttpPost("place-order")] în OrderController.cs
  placeOrder: (data: any) => api.post('/Order/place-order', data),
};

export const InvoiceApi = {
  // Trimite date către [HttpPost("generate-invoice")] în InvoiceController.cs
  generateInvoice: (data: any) => api.post('/Invoice/generate-invoice', data),
};

export const ShipmentApi = {
  // Trimite date către [HttpPost("prepare-shipment")] în ShipmentController.cs
  prepareShipment: (data: any) => api.post('/Shipment/prepare-shipment', data),
};

export default api;