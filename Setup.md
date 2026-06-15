# Foxin — Northwind Sales Dashboard

Full-stack **Foxin** point-of-sale and admin dashboard with React (client) and Express (server). JavaScript only — no TypeScript. All prices display in **INR** (₹).

## Project structure

```
northwind-sales-dashboard/
├── client/          # React + Vite frontend
│   └── src/
├── server/          # Express + MongoDB API
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── index.js
└── package.json     # Root scripts to run both apps
```

## Login (demo)

| Role  | Username | Password | Access                                         |
| ----- | -------- | -------- | ---------------------------------------------- |
| Admin | `admin`  | `0730`   | Full dashboard, sales, customers, products, AI |
| Staff | `staff`  | `0730`   | Point of Sale, orders, AI assistant            |

## Features

- **Login** — role-based access (admin vs staff)
- **Point of Sale** — pick customer, add in-stock products, see INR prices, complete sale
- **Dashboard** (admin) — revenue charts and KPIs in ₹
- **Products** — list, filter, add, edit, delete
- **Customers** — list, details, add, edit, delete
- **Orders** — browse and filter; new orders via Point of Sale
- **Suppliers** — supplier overview (admin)
- **AI Assistant** — Groq-powered insights

## Setup

1. **MongoDB** — import Northwind data into a database named `northwind` (or set `MONGO_URI` in `server/.env`).

2. **Server** — copy env and install:

   ```bash
   cd server
   cp .env.example .env   # if .env.example exists, or create .env
   npm install
   ```

   `server/.env` example:

   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/northwind
   GROQ_API_KEY=your_key_optional
   ```

3. **Client**:

   ```bash
   cd client
   npm install
   ```

4. **From project root** (runs API + UI together):

   ```bash
   npm install
   npm run install:all
   npm run dev
   ```

- API: http://localhost:5000
- UI: http://localhost:3000 (proxies `/api` to the server)

## API — Products & Customers

| Method | Endpoint             | Description                               |
| ------ | -------------------- | ----------------------------------------- |
| POST   | `/api/products`      | Create product                            |
| PUT    | `/api/products/:id`  | Update product                            |
| DELETE | `/api/products/:id`  | Delete product                            |
| POST   | `/api/customers`     | Create customer                           |
| PUT    | `/api/customers/:id` | Update customer                           |
| DELETE | `/api/customers/:id` | Delete customer (blocked if orders exist) |



The frontend and the Backend flow are inside the backend and frontend folder seperately in there as (server/BACKEND_STRUCTURE.md) and (client/FRONTEND_STRUCTURE.md)
