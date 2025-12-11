import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const cookies = req.headers.cookie || "";
  if (!cookies.includes("admin_session=valid")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const savePath = path.join(process.cwd(), "data.json");

  if (!fs.existsSync(savePath)) {
    return res.status(200).json([]);
  }

  const json = JSON.parse(fs.readFileSync(savePath));
  return res.status(200).json(json);
}
