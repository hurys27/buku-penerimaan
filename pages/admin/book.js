import AdminLayout from "./layout";
import { useEffect, useState } from "react";

/* ===== Shared Styles (match Broadcast UI) ===== */
const page = {
  padding: 20
};

const card = {
  background: "#fff",
  borderRadius: 8,
  padding: 16,
  marginBottom: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,.08)"
};

const header = {
  fontWeight: 600,
  marginBottom: 12
};

const label = {
  display: "block",
  fontWeight: 500,
  marginBottom: 4
};

const input = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #ccc",
  marginBottom: 12
};

const hint = {
  fontSize: 13,
  color: "#555",
  marginTop: -8,
  marginBottom: 12
};

const btn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "8px 16px",
  borderRadius: 6,
  cursor: "pointer"
};

export default function BookSettings() {
  const [title, setTitle] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await fetch("/api/admin/book-settings");
    const json = await res.json();
    setTitle(json.title || "");
    setDownloadUrl(json.downloadUrl || "");
  }

  async function save() {
    if (!downloadUrl) {
      alert("Google Drive download link is required");
      return;
    }

    await fetch("/api/admin/book-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, downloadUrl })
    });

    alert("Book settings saved");
  }

  return (
    <AdminLayout>
      <div style={page}>
        <h2 style={{marginBottom: "20px"}}>📘 Book Settings</h2>

        <div style={card}>
          <div style={header}>Book Information</div>

          <label style={label}>Book Title</label>
          <input
            style={input}
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Judul Buku"
          />

          <label style={label}>Google Drive Download Link</label>
          <input
            style={input}
            value={downloadUrl}
            onChange={e => setDownloadUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
          />

          <div style={hint}>
            Make sure link access is set to{" "}
            <b>Anyone with the link</b>
          </div>

          <button style={btn} onClick={save}>
            Save Book
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
