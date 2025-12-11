import fs from "fs";
import path from "path";
import formidable from "formidable";

export const config = {
  api: { bodyParser: false }, // required for file uploads
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const uploadDir = path.join(process.cwd(), "public", "books");
  const settingsFile = path.join(process.cwd(), "book-settings.json");

  // Create directory if missing
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const form = formidable({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("FORM ERROR:", err);
      return res.status(500).json({ message: "Upload error" });
    }

    const title = fields.title?.toString() || "";
    let fileName = null;

    // If new file uploaded
    if (files.file) {
      const file = files.file[0];
      const newPath = path.join(uploadDir, file.originalFilename);

      fs.renameSync(file.filepath, newPath);
      fileName = file.originalFilename;
    }

    // Load existing settings
    let settings = { title: "", file: "" };
    if (fs.existsSync(settingsFile)) {
      settings = JSON.parse(fs.readFileSync(settingsFile, "utf8"));
    }

    // Update values
    settings.title = title;
    if (fileName) {
      settings.file = fileName;
    }

    // Save back
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));

    return res.json({ success: true, settings });
  });
}
