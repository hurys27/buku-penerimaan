import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import crypto from "crypto";


const SETTINGS_PATH = path.join(process.cwd(), "sender-settings.json");
const HISTORY_PATH = path.join(process.cwd(), "email-history.json");

function parseTemplate(template, user) {
  return template
    .replace(/{{\s*name\s*}}/g, user.name)
    .replace(/{{\s*instansi\s*}}/g, user.instansi);
}

function loadSenderSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) return null;
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf8"));
}

function appendHistory(entry) {
  let history = [];
  if (fs.existsSync(HISTORY_PATH)) {
    history = JSON.parse(fs.readFileSync(HISTORY_PATH, "utf8"));
  }
  history.unshift(entry); // newest first
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { subject, body, recipients } = req.body;

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: "No recipients" });
    }

    const sender = loadSenderSettings();
    if (!sender?.senderEmail || !sender?.senderPass) {
      return res.status(400).json({ error: "Sender settings not configured" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: sender.senderEmail,
        pass: sender.senderPass
      }
    });

    const results = [];

    for (const user of recipients) {
      const time = new Date().toISOString();
      try {
        const html = parseTemplate(body, user).replace(/\n/g, "<br>");

        await transporter.sendMail({
          from: `"${sender.senderName || "Admin"}" <${sender.senderEmail}>`,
          to: user.email,
          subject,
          html
        });

	const entry = {
	  id: crypto.randomUUID(),
	  time,
	  email: user.email,
	  subject,
	  status: "OK",
	  error: ""
	};

        appendHistory(entry);
        results.push(entry);

      } catch (err) {
	const entry = {
	  id: crypto.randomUUID(),
	  time,
	  email: user.email,
	  subject,
	  status: "FAILED",
	  error: err.message
	};

        appendHistory(entry);
        results.push(entry);
      }

      // small delay to be safe
      await new Promise(r => setTimeout(r, 1000));
    }

    return res.json({
      success: true,
      total: recipients.length,
      results
    });

  } catch (err) {
    console.error("Broadcast error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
