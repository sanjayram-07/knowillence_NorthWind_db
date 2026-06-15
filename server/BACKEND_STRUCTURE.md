# Backend Structure

This document explains the `server` folder in a simple way.

## Backend Flow

The backend generally works like this:

`index.js -> routes -> controllers -> services -> models / utils -> MongoDB or external API`

Example:

`/api/orders -> routes/orders.js -> controllers/orderController.js -> services/orderService.js -> models/Order.js`

## Main Folders

### `server/config`

Used for app configuration.

- `db.js`
  Connects the backend to MongoDB using Mongoose.
- `users.js`
  Stores the hardcoded demo users for login.

### `server/routes`

Used to define API endpoints.

Each route file groups endpoints by feature.

- `auth.js`
  Auth endpoints like login and current user.
- `customers.js`
  Customer endpoints like list, stats, create, update, delete.
- `orders.js`
  Order endpoints like list, details, stats, pending orders, create order.
- `products.js`
  Product endpoints like list, low stock, categories, create, update, delete.
- `sales.js`
  Sales analytics endpoints like overview, revenue, top products, top customers.
- `suppliers.js`
  Supplier endpoints like list and single supplier details.
- `ai.js`
  AI endpoints like ask question, weekly summary, churn analysis, reorder advice.

### `server/controllers`

Used to handle HTTP request and response.

Controllers are thin now. Their job is to:

- read `req`
- call a service
- send `res`
- pass errors to middleware

- `authController.js`
  Handles auth API requests.
- `customerController.js`
  Handles customer API requests.
- `orderController.js`
  Handles order API requests.
- `productController.js`
  Handles product API requests.
- `salesController.js`
  Handles sales analytics API requests.
- `supplierController.js`
  Handles supplier API requests.
- `aiController.js`
  Handles AI API requests.

### `server/services`

Used for business logic.

This is where the main logic now lives.

- `authService.js`
  Handles login logic and current user logic.
- `customerService.js`
  Handles customer business logic like search, stats, create, update, delete, and safe deletion checks.
- `orderService.js`
  Handles order business logic like validation, order creation, stock reduction, order stats, and details.
- `productService.js`
  Handles product business logic like filtering, low stock logic, stats, create, update, delete.
- `salesService.js`
  Handles sales report logic and connects controllers to analytics helpers.
- `supplierService.js`
  Handles supplier business logic and supplier product lookups.
- `aiService.js`
  Chooses what business data to collect before sending it to AI features.
- `groqService.js`
  Talks to the Groq API and sends prompts to the model.
- `serviceError.js`
  Helper file to create service-layer errors with status codes.

### `server/models`

Used for MongoDB collections through Mongoose.

Each file describes the structure of one collection.

- `Category.js`
  Category collection model.
- `Customer.js`
  Customer collection model.
- `Employee.js`
  Employee collection model.
- `Order.js`
  Order collection model.
- `OrderDetail.js`
  Order details collection model.
- `Product.js`
  Product collection model.
- `Shipper.js`
  Shipper collection model.
- `Supplier.js`
  Supplier collection model.

### `server/middleware`

Used for code that runs in the middle of request processing.

- `auth.js`
  Checks login session token and protects routes.
- `errorHandler.js`
  Sends a common error response when something fails.
- `rateLimiter.js`
  Limits how many times AI endpoints can be called in a time window.

### `server/utils`

Used for reusable helper logic.

- `aggregations.js`
  Contains MongoDB aggregation logic for analytics like revenue, top customers, top products, low stock, and at-risk customers.
- `lookups.js`
  Contains reusable MongoDB `$lookup` and line-total helpers.

### `server/scripts`

Used for standalone scripts that are run manually, not through API requests.

Right now this folder is empty. It can be used later for:

- data import
- seed scripts
- migrations
- cleanup scripts

## Important Root Files

- `index.js`
  Main backend entry file. Creates the Express app, connects MongoDB, loads middleware, mounts routes, and starts the server.
- `package.json`
  Backend dependencies and scripts like `npm start` and `npm run dev`.
- `package-lock.json`
  Exact dependency lock file.
- `.env`
  Local environment variables like MongoDB URI and Groq API key.
- `.env.example`
  Example environment file template.

## API Base Paths

These are connected in `index.js`.

- `/api/auth` -> auth routes
- `/api/customers` -> customer routes
- `/api/orders` -> order routes
- `/api/products` -> product routes
- `/api/suppliers` -> supplier routes
- `/api/sales` -> sales routes
- `/api/ai` -> AI routes

## Simple Summary

- `config` = setup values and database connection
- `routes` = endpoint definitions
- `controllers` = request/response handlers
- `services` = business logic
- `models` = MongoDB collection definitions
- `middleware` = request pipeline helpers
- `utils` = shared helper logic
- `scripts` = manual utility scripts

## Short Request Example

If the frontend calls:

`GET /api/products`

the backend flow is:

1. `index.js` sends the request to `routes/products.js`
2. `routes/products.js` sends it to `productController.js`
3. `productController.js` calls `productService.js`
4. `productService.js` uses `Product.js` and sometimes `aggregations.js`
5. MongoDB returns data
6. Controller sends JSON response back
