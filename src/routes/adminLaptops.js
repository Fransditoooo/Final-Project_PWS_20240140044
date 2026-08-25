import express from "express";
import { query } from "../db.js";
import { requireJwt } from "../middleware/auth.js";

const router = express.Router();
router.use(requireJwt);

const fields = [
  "sku", "name", "brand", "model", "category", "price", "stock", "rating",
  "release_year", "cpu", "gpu", "ram_gb", "storage_gb", "storage_type",
  "display_size", "display_resolution", "operating_system", "weight_kg",
  "color", "specs", "image_url"
];

function cleanText(value, max = 255) {
  return value === undefined || value === null ? null : String(value).trim().slice(0, max);
}

function normalizeLaptop(body) {
  return {
    sku: cleanText(body.sku, 30),
    name: cleanText(body.name, 150),
    brand: cleanText(body.brand, 60),
    model: cleanText(body.model, 100),
    category: cleanText(body.category, 50),
    price: Number(body.price),
    stock: Number(body.stock),
    rating: body.rating === undefined || body.rating === null || body.rating === "" ? null : Number(body.rating),
    release_year: body.release_year === undefined || body.release_year === null || body.release_year === "" ? null : Number(body.release_year),
    cpu: cleanText(body.cpu, 120),
    gpu: cleanText(body.gpu, 120),
    ram_gb: body.ram_gb === undefined || body.ram_gb === null || body.ram_gb === "" ? null : Number(body.ram_gb),
    storage_gb: body.storage_gb === undefined || body.storage_gb === null || body.storage_gb === "" ? null : Number(body.storage_gb),
    storage_type: cleanText(body.storage_type, 30),
    display_size: body.display_size === undefined || body.display_size === null || body.display_size === "" ? null : Number(body.display_size),
    display_resolution: cleanText(body.display_resolution, 30),
    operating_system: cleanText(body.operating_system, 80),
    weight_kg: body.weight_kg === undefined || body.weight_kg === null || body.weight_kg === "" ? null : Number(body.weight_kg),
    color: cleanText(body.color, 40),
    specs: body.specs === undefined || body.specs === null ? {} : body.specs,
    image_url: cleanText(body.image_url, 2000)
  };
}

function validateLaptop(l) {
  const required = ["sku", "name", "brand", "model", "category"];
  const missing = required.filter(k => !l[k]);
  if (missing.length) return `Field wajib: ${missing.join(", ")}.`;
  if (!Number.isFinite(l.price) || l.price < 0) return "price harus berupa angka >= 0.";
  if (!Number.isInteger(l.stock) || l.stock < 0) return "stock harus bilangan bulat >= 0.";
  if (l.rating !== null && (!Number.isFinite(l.rating) || l.rating < 0 || l.rating > 5)) return "rating harus antara 0 sampai 5.";
  if (l.release_year !== null && (!Number.isInteger(l.release_year) || l.release_year < 2000 || l.release_year > 2100)) return "release_year tidak valid.";
  if (l.ram_gb !== null && (!Number.isInteger(l.ram_gb) || l.ram_gb <= 0)) return "ram_gb tidak valid.";
  if (l.storage_gb !== null && (!Number.isInteger(l.storage_gb) || l.storage_gb <= 0)) return "storage_gb tidak valid.";
  if (l.display_size !== null && (!Number.isFinite(l.display_size) || l.display_size <= 0)) return "display_size tidak valid.";
  if (l.weight_kg !== null && (!Number.isFinite(l.weight_kg) || l.weight_kg <= 0)) return "weight_kg tidak valid.";
  if (typeof l.specs !== "object" || Array.isArray(l.specs)) return "specs harus berupa object JSON.";
  return null;
}

function parseId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /admin/laptops - Read all
router.get("/laptops", async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM laptops ORDER BY id DESC`
    );
    res.json({ success: true, total: result.rows.length, data: result.rows });
  } catch (error) {
    console.error("ADMIN GET LAPTOPS:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil data laptop." });
  }
});

// GET /admin/laptops/:id - Read one
router.get("/laptops/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "ID laptop tidak valid." });
  try {
    const result = await query("SELECT * FROM laptops WHERE id = $1", [id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Laptop tidak ditemukan." });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("ADMIN GET LAPTOP:", error);
    res.status(500).json({ success: false, message: "Gagal mengambil detail laptop." });
  }
});

// POST /admin/laptops - Create
router.post("/laptops", async (req, res) => {
  const laptop = normalizeLaptop(req.body || {});
  const validationError = validateLaptop(laptop);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const result = await query(
      `INSERT INTO laptops (${fields.join(", ")})
       VALUES (${fields.map((_, i) => `$${i + 1}`).join(", ")})
       RETURNING *`,
      fields.map(field => laptop[field])
    );
    res.status(201).json({ success: true, message: "Laptop berhasil ditambahkan.", data: result.rows[0] });
  } catch (error) {
    console.error("ADMIN CREATE LAPTOP:", error);
    if (error.code === "23505") return res.status(409).json({ success: false, message: "SKU sudah digunakan." });
    res.status(500).json({ success: false, message: "Gagal menambahkan laptop." });
  }
});

// PUT /admin/laptops/:id - Update
router.put("/laptops/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "ID laptop tidak valid." });
  const laptop = normalizeLaptop(req.body || {});
  const validationError = validateLaptop(laptop);
  if (validationError) return res.status(400).json({ success: false, message: validationError });

  try {
    const setClause = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
    const result = await query(
      `UPDATE laptops SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...fields.map(field => laptop[field]), id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Laptop tidak ditemukan." });
    res.json({ success: true, message: "Laptop berhasil diperbarui.", data: result.rows[0] });
  } catch (error) {
    console.error("ADMIN UPDATE LAPTOP:", error);
    if (error.code === "23505") return res.status(409).json({ success: false, message: "SKU sudah digunakan oleh laptop lain." });
    res.status(500).json({ success: false, message: "Gagal memperbarui laptop." });
  }
});

// DELETE /admin/laptops/:id - Delete
router.delete("/laptops/:id", async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ success: false, message: "ID laptop tidak valid." });
  try {
    const result = await query(
      "DELETE FROM laptops WHERE id = $1 RETURNING id, sku, name",
      [id]
    );
    if (!result.rows.length) return res.status(404).json({ success: false, message: "Laptop tidak ditemukan." });
    res.json({ success: true, message: "Laptop berhasil dihapus.", data: result.rows[0] });
  } catch (error) {
    console.error("ADMIN DELETE LAPTOP:", error);
    res.status(500).json({ success: false, message: "Gagal menghapus laptop." });
  }
});

export default router;
