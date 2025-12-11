import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const {
      title,
      copies,
      nama,
      email,
      telepon,
      instansi,
      signatureDataUrl, // optional from frontend
      id                // used by admin panel
    } = req.body;

    // === LOAD SIGNATURE ===
    let finalSignature = signatureDataUrl || null;

    if (!finalSignature && id !== undefined) {
      const dataFile = path.join(process.cwd(), "data.json");

      if (fs.existsSync(dataFile)) {
        const records = JSON.parse(fs.readFileSync(dataFile));

        // ensure id is number
        const idx = parseInt(id);

        if (records[idx] && records[idx].signature) {
          finalSignature = records[idx].signature;
        }
      }
    }

    // === CREATE PDF ===
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // === LOAD LOGO ===
    let logoImage = null;
    try {
      const protocol = req.headers["x-forwarded-proto"] || "http";
      const host = req.headers.host;
      const logoUrl = `${protocol}://${host}/logo.png`;

      const resp = await fetch(logoUrl);
      if (resp.ok) {
        const buf = Buffer.from(await resp.arrayBuffer());
        logoImage = await pdfDoc.embedPng(buf);
      }
    } catch (e) {
      console.warn("Logo load failed:", e);
    }

    let cursorY = height - 60;

    if (logoImage) {
      const maxWidth = 110;
      const scale = maxWidth / logoImage.width;

      page.drawImage(logoImage, {
        x: (width - logoImage.width * scale) / 2,
        y: cursorY - (logoImage.height * scale) / 2,
        width: logoImage.width * scale,
        height: logoImage.height * scale,
      });

      cursorY -= logoImage.height * scale + 10;
    }

    // === HEADERS ===
    page.drawText("PUSAT SOSIAL EKONOMI DAN KEBIJAKAN PERTANIAN", {
      x: 50,
      y: cursorY - 30,
      size: 14,
      font: fontBold,
    });

    page.drawText("TANDA TERIMA", {
      x: 50,
      y: cursorY - 50,
      size: 14,
      font: fontBold,
    });

    // === DETAILS ===
    let y = cursorY - 100;
    const gap = 22;

    function drawRow(label, value) {
      page.drawText(label, { x: 50, y, size: 11, font: fontBold });
      page.drawText(":", { x: 260, y, size: 11, font });
      page.drawText(value || "-", { x: 280, y, size: 11, font });
      y -= gap;
    }

    drawRow("Judul Buku", title);
    drawRow("Jumlah Eksemplar", copies === "1" ? "Satu Eksemplar" : copies);
    drawRow("Penerima", nama);
    drawRow("Instansi", instansi);
    drawRow("No Telepon", telepon);
    drawRow("Email", email);

    // === DATE + SIGNATURE ===
    const rightX = 360;
    const sigBaseY = 200;

    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    page.drawText("Tempat & Tanggal", { x: rightX, y: sigBaseY + 140, size: 11, font: fontBold });
    page.drawText(":", { x: rightX + 120, y: sigBaseY + 140, size: 11, font });
    page.drawText(dateStr, { x: rightX + 140, y: sigBaseY + 140, size: 11, font });

    page.drawText("Ttd", { x: rightX, y: sigBaseY + 110, size: 11, font: fontBold });

    // === SIGNATURE DRAW ===
    if (finalSignature) {
      try {
        const base64 = finalSignature.split(",")[1];
        const sigBytes = Buffer.from(base64, "base64");
        const sigImg = await pdfDoc.embedPng(sigBytes);

        const sigW = 160;
        const sigH = (sigImg.height / sigImg.width) * sigW;

        page.drawImage(sigImg, {
          x: rightX,
          y: sigBaseY,
          width: sigW,
          height: sigH,
        });

        page.drawText(`(${nama})`, {
          x: rightX + 10,
          y: sigBaseY - 16,
          size: 10,
          font,
        });

      } catch (err) {
        console.error("Signature embed failed:", err);
      }
    }

    // === SAVE PDF ===
    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bukti-penerimaan-${nama}.pdf"`
    );

    return res.status(200).send(Buffer.from(pdfBytes));

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Gagal membuat PDF",
      error: err.toString(),
    });
  }
}
