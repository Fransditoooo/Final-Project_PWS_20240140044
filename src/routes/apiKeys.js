import express from "express";
import { query } from "../db.js";
import { requireJwt } from "../middleware/auth.js";
import { generateApiKey, hashApiKey } from "../utils/security.js";

const router = express.Router();
router.use(requireJwt);

router.get("/", async (req, res) => {
  const result = await query(
    `SELECT id, name, is_active, created_at, last_used_at, request_count
     FROM api_keys WHERE user_id = $1 ORDER BY created_at DESC`,
    [req.user.sub]
  );
  res.json({ success: true, data: result.rows });
});

router.post("/", async (req, res) => {
  const name = String(req.body.name || "Laptop API Key").trim().slice(0, 80);
  const rawKey = generateApiKey();
  const keyHash = hashApiKey(rawKey);

  const result = await query(
    `INSERT INTO api_keys (user_id, name, key_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, is_active, created_at`,
    [req.user.sub, name, keyHash]
  );

  res.status(201).json({
    success: true,
    message: "API Key dibuat. Simpan sekarang karena raw key hanya dikirim sekali.",
    api_key: rawKey,
    data: result.rows[0]
  });
});

router.patch("/:id/revoke", async (req, res) => {
  const result = await query(
    `UPDATE api_keys SET is_active = FALSE
     WHERE id = $1 AND user_id = $2
     RETURNING id, name, is_active`,
    [req.params.id, req.user.sub]
  );

  if (!result.rows.length) {
    return res.status(404).json({ success: false, message: "API Key tidak ditemukan." });
  }

  res.json({ success: true, message: "API Key berhasil dicabut.", data: result.rows[0] });
});

export default router;
