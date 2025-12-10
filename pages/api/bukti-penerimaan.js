import { PDFDocument, StandardFonts } from "pdf-lib";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const {
      title,
      copies,
      wantEbook,
      nama,
      email,
      telepon,
      instansi,
      signatureDataUrl,
    } = req.body;

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Load logo from /public/logo.png
    let logoImage = null;
    try {
      const protocol =
        req.headers["x-forwarded-proto"] || "http";
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

    let cursorY = height - 60;

    // Draw logo
    if (logoImage) {
      const maxWidth = 110;
      const scale = maxWidth / logoImage.width;
      const drawnW = logoImage.width * scale;
      const drawnH = logoImage.height * scale;

      page.drawImage(logoImage, {
        x: (width - drawnW) / 2,
        y: cursorY - drawnH / 2,
        width: drawnW,
        height: drawnH,
      });

      cursorY -= drawnH + 10;
    }

    // Document title
    const title1 =
      "PUSAT SOSIAL EKONOMI DAN KEBIJAKAN PERTANIAN";
    const title2 = "TANDA TERIMA";

    page.drawText(title1, {
      x: 50,
      y: cursorY - 30,
      size: 14,
      font: fontBold,
    });

    page.drawText(title2, {
      x: 50,
      y: cursorY - 50,
      size: 14,
      font: fontBold,
    });

    let y = cursorY - 100;
    const gap = 22;

    function drawRow(label, value) {
      page.drawText(label, {
        x: 50,
        y,
        size: 11,
        font: fontBold,
      });

      page.drawText(":", {
        x: 260,
        y,
        size: 11,
        font,
      });

      page.drawText(
        value || "__________________",
        {
          x: 280,
          y,
          size: 11,
          font,
        }
      );

      y -= gap;
    }

    drawRow("Judul Buku", title);
    drawRow(
      "Jumlah Eksemplar",
      copies === "1" ? "Satu Eksemplar" : copies
    );
    drawRow("Penerima", nama);
    drawRow("Instansi", instansi);
    drawRow("No Telepon", telepon);
    drawRow("Email", email);

    // Right side (date + signature)
    const rightX = 360;
    const sigBaseY = 200;

    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;

    page.drawText("Tempat & Tanggal", {
      x: rightX,
      y: sigBaseY + 140,
      size: 11,
      font: fontBold,
    });

    page.drawText(":", {
      x: rightX + 120,
      y: sigBaseY + 140,
      size: 11,
      font,
    });

    page.drawText(dateStr, {
      x: rightX + 140,
      y: sigBaseY + 140,
      size: 11,
      font,
    });

    page.drawText("Ttd", {
      x: rightX,
      y: sigBaseY + 110,
      size: 11,
      font: fontBold,
    });

    // Draw signature image
    if (signatureDataUrl) {
      const base64 = signatureDataUrl.split(",")[1];
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
    }

    const pdfBytes = await pdfDoc.save();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="bukti-penerimaan-${nama}.pdf"`
    );

    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Gagal membuat PDF",
      error: err.toString(),
    });
  }
}
