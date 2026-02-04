# Logistics & Invoicing Management System (PSSC Project)

A complex software system designed for managing Orders, Invoices, and Shipments. This project was developed as part of the "Complex Software Systems Design" (PSSC) course, simulating a real-world distributed software environment.

**Architecture:** Distributed System (Frontend + Backend)  
**My Role:** Frontend Developer & API Integration

## 🤝 Collaboration Context

This project was built by a team of 2 developers to simulate a real-world software delivery environment:

- **Backend Engineer:** Built the C# .NET API using Domain-Driven Design (DDD) principles (Workflows, Operations, Events)
- **Frontend Engineer (Me):** Built the React client, handled state management, and integrated complex API endpoints

## 🚀 Tech Stack

### Frontend (My Contribution)

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **API Client:** Custom Axios wrapper for communicating with the .NET backend
- **Styling:** CSS Modules / Standard CSS
- **Key Modules:**
  - Orders Dashboard
  - Invoices Generation & Viewing
  - Shipments Tracking

### Backend (Context)

- **Language:** C# (.NET 8.0)
- **Architecture:** Domain-Driven Design (DDD)
- **Database:** SQL Server (Entity Framework)
- **Key Concepts:** CQRS, Domain Events (`OrderPlacedEvent`, `InvoiceGeneratedEvent`)

## 📂 Project Structure

```
logistics-management-system/
├── frontend/                   # React Client (My Focus)
│   ├── src/
│   │   ├── pages/              # Orders, Invoices, Shipments views
│   │   ├── api/                # API integration logic
│   │   ├── components/         # Reusable UI components
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── Proiect-PSSC/               # .NET Backend
    ├── Domain/                 # Business Rules & Workflows
    ├── Controllers/            # API Endpoints
    ├── Data/                   # Database Context
    └── .NET project files
```

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 14.x (for Frontend)
- .NET SDK >= 8.0 (for Backend)
- SQL Server

### Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### Running the Backend

```bash
cd Proiect-PSSC
dotnet restore
dotnet run
```

The backend API will run on the configured port (check `launchSettings.json` for details).

## ✨ Key Features Implemented

- **Order Management:** Complete workflow for placing, validating, and tracking orders
- **Invoicing System:** Automatic generation of invoices based on order data with export capabilities
- **Logistics Tracking:** Shipment preparation, monitoring, and delivery status tracking
- **Real-time Updates:** Asynchronous API communication for seamless data synchronization
- **Error Handling:** Comprehensive error handling and validation across the frontend

## 💡 Technical Highlights

- **Type-Safe Integration:** Full TypeScript support for API responses and data models
- **State Management:** Efficient handling of complex async operations and data flows
- **DDD Integration:** Understanding and working with Domain-Driven Design principles from the backend
- **API Wrapper:** Custom Axios configuration for clean and reusable API calls

## 🤖 What I Learned

- Collaborating with backend engineers on API contract design
- Managing complex asynchronous workflows in React
- Understanding Domain-Driven Design principles
- Building scalable React applications with proper separation of concerns

## 📋 Requirements

- Node.js >= 14.x
- .NET SDK >= 8.0
- SQL Server
- Modern browser (Chrome, Firefox, Safari, Edge)

## 📝 License

MIT

---
