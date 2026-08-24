import express from "express";
import { query } from "../db.js";
import { requireApiKey } from "../middleware/apiKey.js";
import { safeLimit, safeOffset } from "../utils/security.js";

const router = express.Router();

router.use(requireApiKey);

router.get("/", async (req, res) => {
  try {
    const limit = safeLimit(req.query.limit, 10, 50);
    const offset = safeOffset(req.query.offset);
    const search = String(req.query.search || "").trim();
    const brand = String(req.query.brand || "").trim();
    const category = String(req.query.category || "").trim();

    const params = [];
    const conditions = [];

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR brand ILIKE $${params.length} OR model ILIKE $${params.length})`);
    }
    if (brand) {
      params.push(brand);
      conditions.push(`brand = $${params.length}`);
    }
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(`SELECT COUNT(*)::int AS total FROM laptops ${where}`, params);
    const total = countResult.rows[0].total;

    params.push(limit, offset);
    const result = await query(
      `SELECT id, sku, name, brand, model, category, price, stock, rating,
              release_year, cpu, gpu, ram_gb, storage_gb, storage_type,
              display_size, display_resolution, operating_system,
              weight_kg, color, specs, image_url, created_at
       FROM laptops
       ${where}
       ORDER BY id
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    res.json({
      success: true,
      meta: { total, limit, offset, count: result.rows.length },
      client: { api_key_id: req.apiClient.id, application: req.apiClient.name },
      data: result.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil data laptop." });
  }
});

router.get("/brands", async (req, res) => {
  const result = await query(
    "SELECT brand, COUNT(*)::int AS total FROM laptops GROUP BY brand ORDER BY brand"
  );
  res.json({ success: true, data: result.rows });
});

router.get("/:id", async (req, res) => {
  const result = await query("SELECT * FROM laptops WHERE id = $1", [req.params.id]);

  if (!result.rows.length) {
    return res.status(404).json({ success: false, message: "Laptop tidak ditemukan." });
  }

  res.json({ success: true, data: result.rows[0] });
});

export default router;
