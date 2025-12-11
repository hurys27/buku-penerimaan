import { useEffect, useState } from "react";

export default function Terimakasih() {
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetch("/api/book-info")
      .then((res) => res.json())
      .then((data) => setBook(data));
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f3f4f6",
        paddingTop: "80px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "white",
          width: "400px",
          margin: "0 auto",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Terimakasih!</h2>
        <p>Terimakasih telah mengisi form.</p>

        {/* Show download link when ready */}
        {book ? (
          <div style={{ marginTop: "25px" }}>
            <p>
              Klik link di bawah untuk mengunduh buku:
            </p>
	    <p> </p>

            <a
              href={`/books/${book.file}`}
              download
              style={{
                display: "inline-block",
                padding: "10px 20px",
                background: "#1d4ed8",
                color: "white",
                borderRadius: "6px",
                fontWeight: "bold",
                textDecoration: "none",
              }}
            >
              Download Buku
            </a>
          </div>
        ) : (
          <p>Sedang memuat link buku...</p>
        )}
      </div>
    </div>
  );
}
