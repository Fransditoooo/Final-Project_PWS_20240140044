import { query } from "../db.js";
import { hashApiKey } from "../utils/security.js";

export async function requireApiKey(req, res, next) {
  const apiKey = req.get("X-API-Key") || req.get("Authorization")?.replace(/^ApiKey\s+/i, "").trim();

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: "API Key diperlukan. Kirim header X-API-Key."
    });
  }

  try {
    const keyHash = hashApiKey(apiKey);
    const result = await query(
      `SELECT ak.id, ak.user_id, ak.name, ak.is_active, u.email
       FROM api_keys ak
       JOIN users u ON u.id = ak.user_id
       WHERE ak.key_hash = $1 AND ak.is_active = TRUE`,
      [keyHash]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: "API Key tidak valid atau sudah dicabut." });
    }

    req.apiClient = result.rows[0];

    await query(
      "UPDATE api_keys SET last_used_at = NOW(), request_count = request_count + 1 WHERE id = $1",
      [req.apiClient.id]
    );

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal memvalidasi API Key." });
  }
}
