import { useState, useEffect } from "react";

export default function BookSettings() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/book.json")
      .then(res => res.json())
      .then(data => setTitle(data.title));
  }, []);

  const submitForm = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    if (file) formData.append("bookfile", file);

    const res = await fetch("/api/admin/book", {
      method: "POST",
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      setMessage("Berhasil diperbarui!");
    } else {
      setMessage("Gagal update.");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Book Settings</h2>

      <form onSubmit={submitForm}>
        <label>Judul Buku:</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 20 }}
        />

        <label>Upload PDF Baru (optional):</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: 20 }}
        />

        <button
          type="submit"
          style={{
            padding: "10px 20px",
            background: "#1d4ed8",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          Simpan
        </button>
      </form>

      {message && <p style={{ marginTop: 20 }}>{message}</p>}
    </div>
  );
}
