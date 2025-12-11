import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { id, title } = req.body;

    if (id === undefined) {
      return res.status(400).json({ message: "Missing id" });
    }

    // Load stored data
    const dataPath = path.join(process.cwd(), "data.json");
    const all = JSON.parse(fs.readFileSync(dataPath));
    const item = all[id];

    if (!item) {
      return res.status(404).json({ message: "Data not found" });
    }

    const { nama, email, telepon, instansi, signature } = item;
    const signatureDataUrl = signature || null;

    // Create A5 Landscape PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 420]); // A5 landscape
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Load logo
    let logoImage = null;
    try {
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers.host;
      const logoUrl = `${protocol}://${host}/logo.png`;
      const resp = await fetch(logoUrl);
      if (resp.ok) {
        const buffer = Buffer.from(await resp.arrayBuffer());
        logoImage = await pdfDoc.embedPng(buffer);
      }
    } catch (err) {
      console.warn("Logo failed to load:", err);
    }

    let cursorY = height - 40;

    // Draw centered logo
    if (logoImage) {
      const maxWidth = 80;
      const scale = maxWidth / logoImage.width;
      const w = logoImage.width * scale;
      const h = logoImage.height * scale;

      page.drawImage(logoImage, {
        x: (width - w) / 2,
        y: cursorY - h,
        width: w,
        height: h,
      });

      cursorY -= h + 15;
    }

    // Centered titles
    const title1 = "PUSAT SOSIAL EKONOMI DAN KEBIJAKAN PERTANIAN";
    const title2 = "TANDA TERIMA";

    page.drawText(title1, {
      x: (width - fontBold.widthOfTextAtSize(title1, 14)) / 2,
      y: cursorY -10,
      size: 14,
      font: fontBold,
    });

    page.drawText(title2, {
      x: (width - fontBold.widthOfTextAtSize(title2, 14)) / 2,
      y: cursorY - 30,
      size: 14,
      font: fontBold,
    });

    let y = cursorY - 60;
    const gap = 18;

    function drawRow(label, value) {
      page.drawText(label, { x: 50, y, size: 11, font: fontBold });
      page.drawText(":", { x: 160, y, size: 11, font });
      page.drawText(value || "-", { x: 180, y, size: 11, font });
      y -= gap;
    }

    drawRow("Judul Buku", title || "-");
    drawRow("Penerima", nama);
    drawRow("Instansi", instansi);
    drawRow("No Telepon", telepon);
    drawRow("Email", email);

    // --- SIGNATURE + DATE (lower-right quadrant) ---

    // Date
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    const sigX = width - 230;  // block anchor X
    const centerWidth = 200;   // block width for centering

    // 1) DATE
    page.drawText(dateStr, {
      x: sigX + (centerWidth - font.widthOfTextAtSize(dateStr, 11)) / 2,
      y: 130,
      size: 11,
      font,
    });

    // 2) SIGNATURE IMAGE
    if (signatureDataUrl) {
      const base64 = signatureDataUrl.split(",")[1];
      const sigBytes = Buffer.from(base64, "base64");
      const sigImg = await pdfDoc.embedPng(sigBytes);

      const sigW = 70;
      const sigH = (sigImg.height / sigImg.width) * sigW;

      const sigImgX = sigX + (centerWidth - sigW) / 2;
      const sigImgY = 70;

      page.drawImage(sigImg, {
        x: sigImgX,
        y: sigImgY,
        width: sigW,
        height: sigH,
      });

      // 3) NAME UNDER SIGNATURE
      const nameText = `(${nama})`;
      page.drawText(nameText, {
        x: sigX + (centerWidth - font.widthOfTextAtSize(nameText, 10)) / 2,
        y: 60,
        size: 10,
        font,
      });
    }

    // Output PDF
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="bukti-${nama}.pdf"`);

    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Gagal membuat PDF",
      error: err.toString(),
    });
  }
}
