import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const settingsPath = path.join(process.cwd(), "public/book-settings.json");

    if (!fs.existsSync(settingsPath)) {
      return res.status(404).json({ error: "Book settings not found" });
    }

    const json = JSON.parse(fs.readFileSync(settingsPath, "utf8"));

    return res.status(200).json({
      title: json.title || "",
      file: json.file || ""
    });

  } catch (err) {
    console.error("Error in /api/book-info:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
