# Frontend Structure

This document explains the `client/src` folder in a simple way.

## Frontend Flow

The frontend generally works like this:

`main.jsx -> App.jsx -> (AuthProvider + AppProvider) -> BrowserRouter -> AppRoutes -> ProtectedRoute -> MainLayout -> Pages -> Components + Hooks -> Services -> axios -> Backend`

Example:

`User clicks Customers link -> AppRoutes routes to /customers -> ProtectedRoute checks auth -> MainLayout wraps -> Customers page -> useCustomers hook -> customerService.getAll() -> axios GET /api/customers -> Backend processes -> Response returns -> Hook updates state -> Component re-renders with data`

## Main Folders

### `client/src` Root Files

- **`main.jsx`**
  The entry point. React creates root and renders `<App />` component.

- **`App.jsx`**
  Wraps entire app with providers in correct order:
  - AuthProvider (auth state)
  - AppProvider (UI state)
  - BrowserRouter (routing)
  - AppRoutes (route definitions)

### `client/src/context`

Used for global state management.

Two context providers that wrap the entire app:

- **`AuthContext.jsx`**
  Manages authentication state (user, token, login, logout).
  - Reads from localStorage to restore session on page load
  - Provides useAuth() hook to access auth anywhere
  - Login/logout updates both state and localStorage
  - Calculated properties: isAdmin, isStaff, isAuthenticated

- **`AppContext.jsx`**
  Manages UI state (sidebar toggle, notifications, loading flags).
  - Uses useReducer pattern for state management
  - Provides useAppContext() hook
  - Actions: TOGGLE_SIDEBAR, SET_SALES_OVERVIEW, SET_LOADING, ADD_NOTIFICATION, REMOVE_NOTIFICATION

### `client/src/routes`

Used to define frontend routes.

- **`AppRoutes.jsx`**
  Single file that defines all routes:
  - `/login` - Unprotected, shows Login page
  - `/` - Protected, admin-only, shows Dashboard in MainLayout
  - `/sales` - Protected, all users, shows PointOfSale in MainLayout
  - `/customers` - Protected, admin-only, shows Customers in MainLayout
  - `/orders` - Protected, all users, shows Orders in MainLayout
  - `/products` - Protected, admin-only, shows Products in MainLayout
  - `/suppliers` - Protected, admin-only, shows Suppliers in MainLayout
  - `/ai` - Protected, all users, shows AIAssistant in MainLayout
  - `*` - Catch-all, redirects to home based on user role

### `client/src/layouts`

Used for app structure and layout components.

Renders the shell that wraps every page.

- **`MainLayout.jsx`**
  Main page wrapper with animated sidebar and header.
  - Renders: Sidebar + Header + animated main content area
  - Reads sidebarOpen from AppContext
  - Animates marginLeft when sidebar toggles
  - Renders children (page content) in the main area

- **`Sidebar.jsx`**
  Left navigation sidebar.
  - Uses useAppContext() for sidebarOpen state
  - Uses useAuth() to get user role and show appropriate nav items
  - Uses useLocation() to highlight active route
  - Renders different nav items for admin vs staff
  - Toggle button to collapse/expand sidebar
  - Logout button at bottom

- **`Header.jsx`**
  Top header bar.
  - Uses useLocation() to show dynamic page title
  - Uses useAppContext() to read notifications
  - Shows notification bell with count badge
  - Animates marginLeft to match sidebar

### `client/src/pages`

Used for page components.

Each page is a feature screen. Pages use hooks to fetch data and components to render it.

- **`Login.jsx`**
  Login page with username/password form.
  - Uses useAuth() for login function
  - Uses useNavigate() to redirect after successful login
  - Stores token + user in localStorage via AuthContext

- **`Dashboard.jsx`**
  Admin dashboard with sales overview.
  - Uses useSales() hook to fetch all sales data
  - Uses useEffect to fetch low stock products
  - Uses useEffect to fetch AI weekly summary
  - Renders: StatCard (4), RevenueChart, TopProductsChart, TopCustomers list, AI Insight box, Low Stock Alerts

- **`Customers.jsx`**
  Customers management page.
  - Direct service calls (not using useCustomers hook in some places)
  - State: customers, stats, pagination, search, selectedCustomer, modal/drawer visibility
  - Features: Search, pagination, view details (drawer), create, edit, delete
  - Uses DataTable component for list
  - Uses Modal component for create/edit form
  - Calls: customerService.getAll(), getStats(), getById(), create(), update(), delete()

- **`Orders.jsx`**
  Orders management page.
  - Similar to Customers page
  - Features: Search, pagination, view details, filter by status
  - Uses DataTable component
  - Calls: orderService API endpoints

- **`Products.jsx`**
  Products management page.
  - Similar to Customers page
  - Features: Search, pagination, category filter, stock indicators
  - Uses DataTable component
  - Calls: productService API endpoints

- **`Suppliers.jsx`**
  Suppliers management page.
  - Similar to Customers page
  - Features: Search, pagination, view supplier details
  - Uses DataTable component
  - Calls: supplierService API endpoints

- **`AIAssistant.jsx`**
  AI chat and insights page.
  - Uses useAI() hook for all AI functionality
  - Layout: Left panel (chat), Right panel (insights)
  - Chat: Message display, input field, send button, suggested questions
  - Insights: Weekly summary, churn alerts, reorder advice (collapsible sections)
  - Calls: aiService.askQuestion(), getWeeklySummary(), getChurnAnalysis(), getReorderAdvice()

- **`PointOfSale.jsx`**
  Point of sale / order creation page.
  - Used by staff to create new orders
  - Features: Product search, shopping cart, customer selection, checkout
  - Calls: Various services for products, customers, order creation

### `client/src/hooks`

Used for data fetching and state management logic.

Custom hooks encapsulate data fetching and provide clean interfaces to pages.

- **`useSales.js`**
  Fetches all sales analytics data for Dashboard.
  - State: overview, revenueByMonth, topProducts, topCustomers, revenueByCategory, loading, error
  - On mount: Runs Promise.all with 5 parallel API calls
  - API calls: getOverview(), getRevenueByMonth(), getTopProducts(), getTopCustomers(), getRevenueByCategory()
  - Returns: Data + loading state + refetch function

- **`useCustomers.js`**
  Fetches customer data with search and pagination.
  - State: customers, stats, pagination, search, loading, error
  - On mount: Fetches initial data
  - Methods: fetchCustomers(), searchCustomers(query)
  - API calls: customerService endpoints
  - Returns: Data + pagination + search + refetch

- **`useAI.js`**
  Manages AI chat and AI insights.
  - State: messages, isLoading, weeklySummary, churnData, reorderData, summaryLoading, churnLoading, reorderLoading
  - Methods: sendMessage(), loadWeeklySummary(), loadChurnAnalysis(), loadReorderAdvice(), clearMessages()
  - API calls: aiService endpoints
  - Returns: Messages, loading states, and all handler functions

### `client/src/components`

Used for reusable UI components.

Small, focused components that render UI and accept props for customization.

- **`DataTable.jsx`**
  Generic table component for displaying lists.
  - Props: columns, data, loading, pagination, onPageChange, onSearch, searchable
  - Features: Search, pagination, custom column rendering, animated rows, loading skeleton
  - Used by: Customers, Orders, Products, Suppliers pages

- **`StatCard.jsx`**
  Card component for displaying key metrics.
  - Props: title, value, change, icon, color, loading, isCurrency, delay
  - Features: Animated entrance, hover effect, formatted value display
  - Used by: Dashboard, Customers (stats)

- **`Modal.jsx`**
  Modal dialog component.
  - Props: open, onClose, title, children, footer, size
  - Features: Backdrop overlay, centered modal, header, content, footer actions
  - Used by: Customers (create/edit), Orders, Products, Suppliers

- **`ProtectedRoute.jsx`**
  Route guard component.
  - Props: children, adminOnly
  - Logic: Checks auth state, redirects to login if not authenticated, redirects to /sales if admin-only and user is not admin
  - Used by: AppRoutes to protect all pages except /login

- **`LoadingSpinner.jsx`**
  Loading indicator component.
  - Simple animated spinner
  - Used by: ProtectedRoute (while checking auth)

- **`FoxinLogo.jsx`**
  Logo component.
  - Props: size, showText
  - Used by: Sidebar header

- **`charts/RevenueChart.jsx`**
  Line chart for monthly revenue.
  - Props: data, loading
  - Uses: Recharts library
  - Used by: Dashboard

- **`charts/TopProductsChart.jsx`**
  Bar chart for top products.
  - Props: data, loading
  - Uses: Recharts library
  - Used by: Dashboard

### `client/src/services`

Used for API communication.

Services wrap HTTP calls to backend. All use the axios client.

- **`authService.js`**
  Auth API calls.
  - Methods: login(username, password) -> POST /api/auth/login

- **`customerService.js`**
  Customer API calls.
  - Methods: getAll(), getById(), getOrders(), getAtRisk(), getStats(), getWithStats(), create(), update(), remove()
  - Endpoints: GET/POST/PUT/DELETE /api/customers

- **`salesService.js`**
  Sales analytics API calls.
  - Methods: getOverview(), getRevenueByMonth(), getTopProducts(), getTopCustomers(), getRevenueByCategory()
  - Endpoints: GET /api/sales/\*

- **`orderService.js`**
  Order API calls.
  - Methods: Similar CRUD operations for orders
  - Endpoints: GET/POST/PUT/DELETE /api/orders

- **`productService.js`**
  Product API calls.
  - Methods: getAll(), getById(), getLowStock(), create(), update(), delete()
  - Endpoints: GET/POST/PUT/DELETE /api/products

- **`supplierService.js`**
  Supplier API calls.
  - Methods: Similar CRUD operations for suppliers
  - Endpoints: GET/POST/PUT/DELETE /api/suppliers

- **`aiService.js`**
  AI API calls.
  - Methods: askQuestion(), getWeeklySummary(), getChurnAnalysis(), getReorderAdvice()
  - Endpoints: POST /api/ai/ask, GET /api/ai/weekly-summary, GET /api/ai/churn-analysis, GET /api/ai/reorder-advice

### `client/src/api`

Used for HTTP client configuration.

- **`axios.js`**
  Axios HTTP client with interceptors.
  - Creates axios instance with baseURL: '/api', timeout: 30000
  - Request interceptor: Adds Authorization header with token from localStorage
  - Response interceptor: Unwraps response.data, handles errors
  - Logs requests/errors in dev mode
  - Used by: All services

### `client/src/utils`

Used for utility functions.

- **`currency.js`**
  Currency formatting utilities.
  - Functions: formatCurrency(amount) -> "$1,234.56"

- **`formatters.js`**
  Data formatting utilities.
  - Functions: formatDate(), formatNumber(), truncateText(), getCountryFlag()

### `client/src/styles`

Used for CSS styling.

- **`index.css`**
  Global styles and Tailwind CSS imports.
  - Tailwind CSS setup
  - Global animations (e.g., typing-dot)
  - CSS variables for theme colors

---

## Data Flow Example: View Customers

```
1. User clicks "Customers" in Sidebar
   └─> Sidebar.jsx (uses useLocation, route changes)

2. React Router matches /customers route
   └─> AppRoutes.jsx (route definition)

3. ProtectedRoute checks authentication
   └─> AuthContext.jsx (reads user state)

4. MainLayout wraps the page
   └─> MainLayout.jsx, Sidebar.jsx, Header.jsx

5. Customers page mounts
   └─> Customers.jsx

6. useEffect triggers data fetch
   └─> customerService.getAll(page, limit, search)

7. Service makes HTTP request
   └─> axios.js (adds auth header)

8. Request goes to backend
   └─> /api/customers endpoint

9. Backend processes and returns data
   └─> Response with customers array + pagination

10. axios response interceptor unwraps data
    └─> axios.js

11. Hook state updates with data
    └─> useState (setCustomers)

12. Component re-renders
    └─> React detects state change

13. DataTable component renders with data
    └─> DataTable.jsx (displays list, search, pagination)

14. User sees customer list
    └─> Browser renders updated DOM
```

---

## Technology Stack

- **Framework:** React 18
- **Routing:** React Router v6
- **State Management:** React Context + useReducer (no Redux)
- **HTTP:** Axios
- **Animation:** Framer Motion
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Build Tool:** Vite

---

## File Structure Summary

```
client/src/
├── main.jsx                    # React entry point
├── App.jsx                     # Provider setup + routing
├── context/                    # Global state
│   ├── AuthContext.jsx        # Auth state
│   └── AppContext.jsx         # UI state
├── routes/
│   └── AppRoutes.jsx          # Route definitions
├── layouts/                    # Page shells
│   ├── MainLayout.jsx         # Main wrapper with sidebar/header
│   ├── Sidebar.jsx            # Left nav
│   └── Header.jsx             # Top header
├── pages/                      # Page screens
│   ├── Login.jsx
│   ├── Dashboard.jsx
│   ├── Customers.jsx
│   ├── Orders.jsx
│   ├── Products.jsx
│   ├── Suppliers.jsx
│   ├── AIAssistant.jsx
│   └── PointOfSale.jsx
├── hooks/                      # Data fetching logic
│   ├── useSales.js
│   ├── useCustomers.js
│   └── useAI.js
├── components/                 # Reusable UI
│   ├── DataTable.jsx
│   ├── StatCard.jsx
│   ├── Modal.jsx
│   ├── ProtectedRoute.jsx
│   ├── LoadingSpinner.jsx
│   ├── FoxinLogo.jsx
│   └── charts/
│       ├── RevenueChart.jsx
│       └── TopProductsChart.jsx
├── services/                   # API calls
│   ├── authService.js
│   ├── customerService.js
│   ├── salesService.js
│   ├── orderService.js
│   ├── productService.js
│   ├── supplierService.js
│   └── aiService.js
├── api/
│   └── axios.js               # HTTP client
├── utils/                      # Utilities
│   ├── currency.js
│   └── formatters.js
└── styles/
    └── index.css
```

---

## Key Concepts

### Providers & Context

All pages have access to:

- `useAuth()` - For authentication state
- `useAppContext()` - For UI state (sidebar, notifications)

### Hooks Pattern

Hooks encapsulate data fetching and state management:

- `useSales()` - Loads all sales data in parallel
- `useCustomers()` - Manages customer list with search/pagination
- `useAI()` - Manages chat messages and AI endpoints

### Services Layer

All HTTP requests go through services:

- Services import axios client
- Services handle request formatting
- Services return promises
- Components consume via hooks

### Component Composition

Pages are built with:

- DataTable component (for lists)
- StatCard component (for metrics)
- Modal component (for forms)
- Chart components (for visualizations)

### Protected Routes

Every page except /login is protected:

- Must be authenticated to access
- Some routes (adminOnly) require admin role
- Non-admin users redirected to /sales
- Unauthenticated users redirected to /login
