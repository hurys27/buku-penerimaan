import fs from "fs";
import path from "path";

const BOOK_PATH = path.join(process.cwd(), "book-settings.json");

export default function handler(req, res) {
  if (req.method === "GET") {
    if (!fs.existsSync(BOOK_PATH)) {
      return res.json({ title: "", downloadUrl: "" });
    }
    const data = JSON.parse(fs.readFileSync(BOOK_PATH, "utf8"));
    return res.json(data);
  }

  if (req.method === "POST") {
    const { title, downloadUrl } = req.body || {};

    if (!downloadUrl) {
      return res.status(400).json({ message: "Download URL required" });
    }

    const payload = {
      title: title || "",
      downloadUrl
    };

    fs.writeFileSync(BOOK_PATH, JSON.stringify(payload, null, 2), "utf8");
    return res.json({ ok: true });
  }

  return res.status(405).json({ message: "Method not allowed" });
}
