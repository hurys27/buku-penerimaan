import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: { bodyParser: false },
};

function cleanName(name) {
  return name
    .trim()
    .replace(/\s+/g, "_")          // keep underscore (old behavior)
    .replace(/[()#%?&'"]/g, "")    // remove only problematic characters
    .toLowerCase();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public", "books");
  const settingsFile = path.join(process.cwd(), "public/book-settings.json");

  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) return res.status(500).json({ message: "Upload error" });

    const title = fields.title?.toString() || "";
    let fileName = null;

    // NEW FILE UPLOADED
    if (files.file) {
      const file = files.file[0];

      let safe = cleanName(file.originalFilename);
      if (!safe.endsWith(".pdf")) safe += ".pdf";

      const newPath = path.join(uploadDir, safe);

      // Move uploaded file
      fs.renameSync(file.filepath, newPath);

      fileName = safe;
    }

    // LOAD SETTINGS
    let settings = { title: "", file: "" };
    if (fs.existsSync(settingsFile)) {
      settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    }

    // SAVE
    settings.title = title;
    if (fileName) settings.file = fileName;

    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

    return res.json({ success: true, settings });
  });
}
