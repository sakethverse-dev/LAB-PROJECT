# 🛒 ShopKart — Modern Full-Stack E-Commerce Platform

A production-ready MERN e-commerce application featuring JWT authentication with HttpOnly cookies, dynamic product discovery with live filtering and search, wishlist management, persistent cart state, and Razorpay Standard Checkout integration with cryptographic payment signature verification.

---

## 🌟 Key Features

- **Customer Authentication (JWT & HttpOnly Cookies)**: Secure registration, login, and profile dashboard with password hashing via `bcryptjs` and dual token handling (cookie + Bearer authorization fallback).
- **Product Catalog & Live Discovery**: Server-side filtering by category, search by regex, price sorting, and live inventory status tracking.
- **Wishlist & Shopping Cart**: Direct user reference persistence in MongoDB, conflict prevention, dynamic derived pricing, live quantity adjustment, and stock upper-limit enforcement.
- **Razorpay Standard Web Checkout**: Secure order initiation with server-side pricing recalculation, test payment processing, and cryptographic HMAC-SHA256 signature verification.
- **Order Management & Historical Snapshots**: Immutable snapshotting of purchased product names, prices, and quantities; persistent order history and status tracking.
- **Minimalist Monochromatic UI**: Modern high-contrast Black, White & Grey aesthetic built with responsive Vanilla CSS.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Axios, Lucide React Icons |
| **Backend** | Node.js, Express.js (ES Modules), Razorpay Node SDK, Cookie-Parser, CORS |
| **Database** | MongoDB Atlas / Mongoose ODM |
| **Authentication** | JSON Web Tokens (JWT), HttpOnly Cookies, Bearer Token fallback |
| **Payment Gateway** | Razorpay Standard Web Checkout (Test Mode) |

---

## 📁 Repository Structure

```text
Shopkart/
├── backend/
│   ├── config/             # DB & Razorpay initializations
│   ├── controllers/        # Request controllers (auth, products, cart, wishlist, orders)
│   ├── middlewares/        # JWT auth protection middleware
│   ├── models/             # Mongoose schemas (Customer, Product, Order)
│   ├── routes/             # REST route endpoints
│   ├── utils/              # Token generation & helper utilities
│   ├── seedProducts.js     # Catalog seeder with sample products
│   ├── .env.example        # Backend environment variables template
│   └── index.js            # Express server entry point
├── frontend/
│   ├── public/             # Static assets & routing redirects
│   ├── src/
│   │   ├── components/     # UI components (Navbar, ProductCard, CartItem, etc.)
│   │   ├── context/        # Global state (AuthContext, CartContext)
│   │   ├── pages/          # Application views (Products, Cart, Checkout, Orders, etc.)
│   │   ├── services/       # Axios API client
│   │   └── utils/          # Razorpay checkout script loader
│   ├── .env.example        # Frontend environment variables template
│   ├── vercel.json         # SPA rewrite rule for Vercel
│   └── vite.config.js      # Vite build configuration
├── Shopkart_Postman_Collection.json # Postman collection for API testing
└── README.md
```

---

## ⚙️ Environment Variables

### 1. Backend (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and provide your credentials:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/shopkart?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### 2. Frontend (`frontend/.env`)

Copy `frontend/.env.example` to `frontend/.env`:

```env
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
# For local development, leave VITE_API_URL empty or set to http://localhost:5000
# For production deployment, set to your backend service URL:
# VITE_API_URL=https://your-shopkart-backend.onrender.com
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account or local MongoDB instance

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/Shopkart.git
cd Shopkart
```

### 2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

### 3. Seed initial products (Optional)
```bash
npm run seed
```

### 4. Run development servers
```bash
# Terminal 1: Start Backend (http://localhost:5000)
npm run backend

# Terminal 2: Start Frontend (http://localhost:5173)
npm run frontend
```

---

## 🌐 Deployment Guide

### Option A: Separate Frontend (Vercel) + Backend (Render) *(Recommended)*

#### Deploy Backend to Render:
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables in Render Dashboard:
   - `NODE_ENV`: `production`
   - `MONGO_URI`: *Your MongoDB connection string*
   - `JWT_SECRET`: *Your random secure string*
   - `RAZORPAY_KEY_ID`: *Your Razorpay test key ID*
   - `RAZORPAY_KEY_SECRET`: *Your Razorpay test secret*
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://shopkart.vercel.app`)*

#### Deploy Frontend to Vercel:
1. Import the repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variables in Vercel Dashboard:
   - `VITE_API_URL`: *Your Render backend URL (e.g. `https://shopkart-backend.onrender.com`)*
   - `VITE_RAZORPAY_KEY_ID`: *Your Razorpay test key ID*
4. Click **Deploy**. (The included `frontend/vercel.json` ensures all client-side routes resolve properly).

---

### Option B: Unified Single-Service Deployment (Render)

ShopKart includes a built-in static handler in `backend/index.js` that automatically serves `frontend/dist` in production if built together.

1. Create a **Web Service** on Render with Root Directory set to root (`.`).
2. **Build Command**:
   ```bash
   npm run build
   ```
3. **Start Command**:
   ```bash
   npm start
   ```
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGO_URI`, `JWT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `CLIENT_URL`: Leave empty or set to your Render URL.

---

## 🔒 Security Best Practices Implemented

- **Credential Isolation**: Razorpay Key Secret and MongoDB credentials are restricted to the server environment and never exposed to the frontend bundle.
- **HMAC-SHA256 Verification**: Server-side verification confirms the authenticity of payment tokens before orders are marked as `PAID`.
- **Dynamic Price Revalidation**: Order totals are strictly calculated on the backend from database product records, ignoring any tampered client totals.
- **Secure Cross-Origin Cookies**: Configured with `sameSite: 'none'` and `secure: true` in production HTTPS, with Bearer header fallback.
- **Git Protection**: Strict root and folder-level `.gitignore` rules prevent `.env` credentials and build outputs from being tracked.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
