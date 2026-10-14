import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { connectDB } from "./config/db.js";
import { seedCatalog } from "./seedProducts.js";

import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import { createPaymentOrder, verifyPayment } from "./controllers/order.controller.js";
import { protectCustomer } from "./middlewares/auth.middleware.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxies (Render, Railway, Fly.io, AWS, Heroku) for secure cookies
app.set("trust proxy", 1);

// CORS Configuration - Supports credentials for HttpOnly authentication cookies
const clientUrls = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((url) => url.trim().replace(/\/$/, ""))
  : [];

const allowedOrigins = [
  ...clientUrls,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman) or matching origin
    const normalizedOrigin = origin ? origin.replace(/\/$/, "") : "";
    if (
      !origin ||
      allowedOrigins.includes(normalizedOrigin) ||
      normalizedOrigin.endsWith(".vercel.app") ||
      process.env.NODE_ENV !== "production"
    ) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
  ],
  exposedHeaders: ["Set-Cookie"],
  optionsSuccessStatus: 200,
};

// Handle Chrome Private Network Access (PNA) preflight checks
app.use((req, res, next) => {
  if (req.headers["access-control-request-private-network"]) {
    res.setHeader("Access-Control-Allow-Private-Network", "true");
  }
  next();
});

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Built-in body parsers & cookie parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger for easy debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to ensure DB connection for serverless environments (e.g., Vercel)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
  } catch (err) {
    console.error("Database connection error in middleware:", err);
  }
  next();
});

// API Routes
// Supported both at root level (/customers, /products) as specified in Lab-01/Lab-03
// and at /api/* for standard modern API conventions
app.use("/customers", customerRoutes);
app.use("/api/customers", customerRoutes);

app.use("/products", productRoutes);
app.use("/api/products", productRoutes);

app.use("/wishlist", wishlistRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.use("/cart", cartRoutes);
app.use("/api/cart", cartRoutes);

app.use("/orders", orderRoutes);
app.use("/api/orders", orderRoutes);
app.post("/api/create-order", protectCustomer, createPaymentOrder);
app.post("/api/verify-payment", protectCustomer, verifyPayment);

// Health check endpoints
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", uptime: process.uptime() });
});

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopKart API Server is running smoothly 🚀",
    endpoints: {
      customers: "/customers or /api/customers",
      products: "/products or /api/products",
      orders: "/orders or /api/orders",
    },
  });
});

// Serve frontend static build if frontend/dist exists (for unified single-service deployments)
const frontendDistPath = path.resolve(__dirname, "../frontend/dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  app.get("*", (req, res, next) => {
    if (
      req.originalUrl.startsWith("/api") ||
      req.originalUrl.startsWith("/customers") ||
      req.originalUrl.startsWith("/products") ||
      req.originalUrl.startsWith("/cart") ||
      req.originalUrl.startsWith("/wishlist") ||
      req.originalUrl.startsWith("/orders")
    ) {
      return next();
    }
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.status(200).json({
      success: true,
      message: "ShopKart API Server is running smoothly 🚀",
      endpoints: {
        customers: "/customers or /api/customers",
        products: "/products or /api/products",
      },
    });
  });
}

// Global 404 Handler for API endpoints
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl} - Endpoint Not Found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// Connect to Database and start server locally
const startServer = async () => {
  await connectDB();
  await seedCatalog();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `🛒 ShopKart Server running on http://0.0.0.0:${PORT} (accessible at http://localhost:${PORT} or your IP)`,
    );
    console.log(`📍 Customer Auth APIs: http://localhost:${PORT}/customers`);
    console.log(`📍 Product Catalog APIs: http://localhost:${PORT}/products`);
  });
};

// Start local server when running standalone; on Vercel the app export is invoked as a serverless function
if (!process.env.VERCEL) {
  startServer();
}

export default app;
