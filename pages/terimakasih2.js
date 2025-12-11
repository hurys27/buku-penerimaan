export default function Terimakasih() {
  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "40px 0" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "white",
          borderRadius: "12px",
          padding: "35px",
          textAlign: "center",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>Terimakasih!</h2>

        <p style={{ fontSize: "18px", marginBottom: "20px" }}>
          Terimakasih telah mengisi form penerimaan buku.
        </p>

        <p style={{ marginBottom: "30px" }}>
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
            borderRadius: "6px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          Download Buku
        </a>
      </div>
    </div>
  );
}
