import fs from "fs";
import path from "path";

const HISTORY_PATH = path.join(process.cwd(), "email-history.json");

function readHistory() {
  if (!fs.existsSync(HISTORY_PATH)) return [];
  return JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
}

function writeHistory(data) {
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(data, null, 2), "utf8");
}

export default function handler(req, res) {
  // GET history
  if (req.method === "GET") {
    return res.json(readHistory());
  }

  // DELETE selected (array of ids)
  if (req.method === "POST") {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be array" });
    }

    const history = readHistory();
    const filtered = history.filter(h => !ids.includes(h.id));

    writeHistory(filtered);
    return res.json({ ok: true, deleted: ids.length });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
