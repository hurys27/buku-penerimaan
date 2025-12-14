import { useEffect, useState } from "react";

export default function TerimaKasih() {
  const [link, setLink] = useState("");

  useEffect(() => {
    fetch("/api/admin/book-settings")
      .then(res => res.json())
      .then(data => setLink(data.downloadUrl || ""));
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f3f4f6"
    }}>
      <div style={{
        background: "#fff",
        padding: 30,
        borderRadius: 10,
        textAlign: "center",
        boxShadow: "0 4px 10px rgba(0,0,0,.1)"
      }}>
        <h2>Terimakasih!</h2>
        <p>Terimakasih telah mengisi form.</p>
        <p>Klik link di bawah untuk mengunduh buku:</p>

        {link ? (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: 12,
              background: "#2563eb",
              color: "#fff",
              padding: "10px 16px",
              borderRadius: 6,
              textDecoration: "none"
            }}
          >
            Download Buku
          </a>
        ) : (
          <p>Link tidak tersedia</p>
        )}
      </div>
    </div>
  );
}
