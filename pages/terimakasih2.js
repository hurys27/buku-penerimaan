export default function Terimakasih() {
  return (
    <div
      style={{
        background: "#f3f4f6",
        minHeight: "100vh",
        padding: "30px 12px",
      }}
    >
      <div
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "white",
          borderRadius: "12px",
          padding: "28px",
          textAlign: "center",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h2 style={{ marginBottom: "10px", color: "#111" }}>Terimakasih!</h2>

        <p style={{ fontSize: "18px", marginBottom: "20px", color: "#333" }}>
          Terimakasih telah mengisi form penerimaan buku.
        </p>

        <p style={{ marginBottom: "30px", color: "#555" }}>
          Anda dapat mendownload buku pada link di bawah ini:
        </p>

        <a
          href="/Buku-Advokasi-Inovasi.pdf"
          download
          style={{
            display: "inline-block",
            background: "#1d4ed8",
            color: "white",
            padding: "12px 25px",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Download Buku
        </a>

        <style>{`
          :root { 
            color-scheme: light !important; 
          }

          @media (max-width: 420px) {
            div[style*="maxWidth:"] {
              padding: 22px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
