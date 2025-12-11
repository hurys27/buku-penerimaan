import fs from "fs";
import path from "path";

export default function handler(req, res) {
  try {
    const filePath = path.join(process.cwd(), "public",  "book-settings.json");
    const json = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return res.status(200).json(json);
  } catch (err) {
    return res.status(500).json({ error: "Failed to load book info" });
  }
}
