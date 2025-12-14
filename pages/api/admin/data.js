// pages/api/admin/data.js
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data.json");

function readDB() {
  if (!fs.existsSync(DB_PATH)) return [];
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return [];
  }
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

export default function handler(req, res) {
  // admin auth
  const cookies = req.headers.cookie || "";
  if (!cookies.includes("admin_session=valid")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  /* ================= GET ================= */
  if (req.method === "GET") {
    return res.status(200).json(readDB());
  }

  /* ================= DELETE ================= */
  if (req.method === "DELETE") {
    const body = req.body || {};
    const action = body.action;

    // DELETE ALL
    if (action === "all") {
      writeDB([]);
      return res.json({ success: true });
    }

    // DELETE SELECTED (by email)
    if (action === "emails" && Array.isArray(body.emails)) {
      const delSet = new Set(
        body.emails.map((e) => String(e).toLowerCase())
      );

      const cur = readDB();
      const filtered = cur.filter(
        (row) => !delSet.has(String(row.email || "").toLowerCase())
      );

      writeDB(filtered);
      return res.json({
        success: true,
        deleted: cur.length - filtered.length
      });
    }

    return res.status(400).json({ message: "Invalid delete action" });
  }

  /* ================= OTHER ================= */
  return res.status(405).json({ message: "Method Not Allowed" });
}
