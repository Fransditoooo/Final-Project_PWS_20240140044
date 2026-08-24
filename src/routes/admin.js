import express from "express";
import { query } from "../db.js";
import { requireJwt } from "../middleware/auth.js";

const router = express.Router();
router.use(requireJwt);

router.get("/dashboard", async (req, res) => {
  const [laptops, users, keys, stock] = await Promise.all([
    query("SELECT COUNT(*)::int AS total FROM laptops"),
    query("SELECT COUNT(*)::int AS total FROM users"),
    query("SELECT COUNT(*)::int AS total FROM api_keys WHERE is_active = TRUE"),
    query("SELECT COALESCE(SUM(stock), 0)::int AS total FROM laptops")
  ]);

  res.json({
    success: true,
    data: {
      total_laptops: laptops.rows[0].total,
      total_users: users.rows[0].total,
      active_api_keys: keys.rows[0].total,
      total_stock: stock.rows[0].total
    }
  });
});

export default router;
