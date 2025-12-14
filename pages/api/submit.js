import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { nama, email, telepon, instansi, signature } = req.body;

    // Validation
    if (!nama || !email || !telepon || !instansi || !signature) {
      return res.status(400).json({ message: "Data tidak lengkap" });
    }

    // === LOAD CURRENT BOOK TITLE ===
    const settingsPath = path.join(process.cwd(), "book-settings.json");
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    const bookTitle = settings.title || "-";

    // === LOAD EXISTING DATASTORE ===
    const savePath = path.join(process.cwd(), "data.json");

    let existing = [];
    if (fs.existsSync(savePath)) {
      existing = JSON.parse(fs.readFileSync(savePath));
    }

    const id = existing.length; // next ID

    // === SAVE ENTRY WITH BOOK TITLE ===
    const newEntry = {
      id,
      nama,
      email,
      telepon,
      instansi,
      signature,
      bookTitle,                   // <-- SAVE BOOK TITLE
      waktu: new Date().toISOString(),
    };

    existing.push(newEntry);

    fs.writeFileSync(savePath, JSON.stringify(existing, null, 2));

    // === RESPOND SUCCESS WITH ID ===
    return res.status(200).json({ message: "OK", id });

  } catch (err) {
    console.error("Error API:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
