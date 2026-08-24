import fs from "fs";
import dotenv from "dotenv";
import { pool } from "./db.js";

dotenv.config();

const sql = fs.readFileSync(new URL("../sql/seed.sql", import.meta.url), "utf8");

try {
  await pool.query(sql);
  console.log("Seed 60 data laptop berhasil.");
} catch (error) {
  console.error("Seed gagal:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
