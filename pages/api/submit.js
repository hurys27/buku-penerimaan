import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { nama, email, telepon, instansi, signature } = req.body;

    // Simple validation
    if (!nama || !email || !telepon || !instansi || !signature) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // === SAVE TO JSON LOG FILE ===
    const savePath = path.join(process.cwd(), "data.json");

    let existing = [];
    if (fs.existsSync(savePath)) {
      existing = JSON.parse(fs.readFileSync(savePath));
    }

    existing.push({
      nama,
      email,
      telepon,
      instansi,
      signature,
      waktu: new Date().toISOString(),
    });

    fs.writeFileSync(savePath, JSON.stringify(existing, null, 2));

    // === SEND BACK SUCCESS ===
    return res.status(200).json({ message: "OK" });

  } catch (err) {
    console.error("Error API:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
