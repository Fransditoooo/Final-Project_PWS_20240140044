import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../db.js";
import { requireJwt } from "../middleware/auth.js";

const router = express.Router();

function makeToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
}

router.post("/register", async (req, res) => {
  try {
    const name = String(req.body.name || "").trim();
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    console.log("REGISTER DATA:", {
      name,
      email,
      passwordLength: password.length
    });

    if (!name || !email || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Nama, email, dan password minimal 6 karakter wajib diisi."
      });
    }

    const exists = await query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (exists.rows.length) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar."
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = makeToken(user);

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil.",
      token,
      user
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Gagal registrasi.",
      error: error.message
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    const result = await query(
      "SELECT id, name, email, password_hash, created_at FROM users WHERE email = $1",
      [email]
    );

    if (!result.rows.length) {
      return res.status(401).json({ success: false, message: "Email atau password salah." });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      return res.status(401).json({ success: false, message: "Email atau password salah." });
    }

    delete user.password_hash;
    const token = makeToken(user);

    res.json({ success: true, message: "Login berhasil.", token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal login." });
  }
});

router.get("/me", requireJwt, async (req, res) => {
  const result = await query(
    "SELECT id, name, email, created_at FROM users WHERE id = $1",
    [req.user.sub]
  );
  res.json({ success: true, user: result.rows[0] || null });
});

export default router;
