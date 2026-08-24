import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import apiKeyRoutes from "./routes/apiKeys.js";
import laptopRoutes from "./routes/laptops.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({
    name: "LaptopHub API",
    version: "1.0.0",
    description: "SaaS API data toko laptop dengan JWT + API Key",
    docs: {
      health: "/health",
      register: "POST /auth/register",
      login: "POST /auth/login",
      create_api_key: "POST /api-keys",
      laptops: "GET /api/v1/laptops"
    }
  });
});

app.get("/health", async (req, res) => {
  res.json({ success: true, status: "healthy", service: "LaptopHub API" });
});

app.use("/auth", authRoutes);
app.use("/api-keys", apiKeyRoutes);
app.use("/api/v1/laptops", laptopRoutes);
app.use("/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error." });
});

export default app;
