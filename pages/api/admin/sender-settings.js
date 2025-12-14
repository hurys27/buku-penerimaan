// pages/api/admin/sender-settings.js
import fs from "fs";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "sender-settings.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    if (!fs.existsSync(SETTINGS_PATH)) {
      return res.json({ senderEmail: "", senderName: "", senderPass: "" });
    }
    const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
    return res.json(data);
  }

  if (req.method === "POST") {
    const { senderEmail, senderName, senderPass } = req.body || {};
    // Basic validation
    if (!senderEmail) return res.status(400).json({ message: "senderEmail required" });

    const payload = { senderEmail, senderName: senderName || "", senderPass: senderPass || "" };
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(payload, null, 2), "utf8");
    return res.json({ ok: true, message: "Saved" });
  }

  return res.status(405).json({ message: "Method Not Allowed" });
}
