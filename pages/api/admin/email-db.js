// pages/api/admin/email-db.js
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "public", "email-database.json");

// helper: read DB
function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw || "[]");
  } catch (err) {
    console.error("Read DB error", err);
    return [];
  }
}

// helper: write DB
function writeDB(arr) {
  fs.writeFileSync(DB_PATH, JSON.stringify(arr, null, 2), "utf8");
}

export default async function handler(req, res) {
  // Basic admin cookie protection (same pattern you used elsewhere)
  const cookies = req.headers.cookie || "";
  if (!cookies.includes("admin_session=valid")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    const all = readDB();
    return res.status(200).json(all);
  }

  if (req.method === "POST") {
    // expects { contacts: [ { name, email, instansi, ... } ] }
    try {
      const body = req.body;
      const incoming = body.contacts || body?.contactsJson || [];
      if (!Array.isArray(incoming)) {
        return res.status(400).json({ message: "contacts array expected" });
      }

      // normalize and deduplicate by email (case-insensitive)
      const existing = readDB();
      const map = new Map();
      for (const e of existing) {
        if (e.email) map.set(String(e.email).toLowerCase(), e);
      }

      const now = new Date().toISOString();
      for (let item of incoming) {
        const email = (item.email || "").toString().trim().toLowerCase();
        if (!email) continue; // skip rows without email
        const name = (item.name || item.nama || "").toString().trim();
        const instansi = (item.instansi || item.org || item.company || "").toString().trim();
        if (map.has(email)) {
          // update existing (do not duplicate)
          const cur = map.get(email);
          cur.name = name || cur.name;
          cur.instansi = instansi || cur.instansi;
          // keep added_at if present
        } else {
          map.set(email, {
            name,
            email,
            instansi,
            added_at: now
          });
        }
      }

      const out = Array.from(map.values());
      writeDB(out);
      return res.status(200).json({ success: true, count: out.length });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Failed to save contacts", error: err.toString() });
    }
  }

  if (req.method === "DELETE") {
    // expects body { action: "all" } or { action: "emails", emails: [...] }
    try {
      const body = req.body || {};
      const action = body.action;
      if (action === "all") {
        writeDB([]);
        return res.status(200).json({ success: true });
      }
      if (action === "emails" && Array.isArray(body.emails)) {
        const delSet = new Set(body.emails.map((e) => String(e).toLowerCase()));
        const cur = readDB();
        const out = cur.filter((c) => !delSet.has((c.email || "").toLowerCase()));
        writeDB(out);
        return res.status(200).json({ success: true, count: out.length });
      }
      return res.status(400).json({ message: "Invalid delete action" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Delete failed", error: err.toString() });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}
