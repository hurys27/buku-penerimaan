import { useEffect, useState } from "react";

export default function Terimakasih() {
  const [book, setBook] = useState(null);

  useEffect(() => {
    fetch("/book.json")
      .then((res) => res.json())
      .then(setBook);
  }, []);

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "40px 0" }}>
      <div style={{
        maxWidth: "600px",
        margin: "0 auto",
        background: "white",
        borderRadius: "12px",
        padding: "35px",
        textAlign: "center",
        boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
      }}>
        <h2>Terimakasih!</h2>
        <p style={{ fontSize: "18px" }}>Terimakasih telah mengisi form.</p>

        {book && (
          <>
            <p>Anda dapat mendownload buku berikut:</p>

            <a
              href={book.file}
              download
              style={{
                display: "inline-block",
                background: "#1d4ed8",
                color: "white",
                padding: "12px 25px",
                borderRadius: "6px",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Download: {book.title}
            </a>
          </>
        )}
      </div>
    </div>
  );
}
