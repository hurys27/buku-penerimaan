export default function TerimakasihPage({ pdf }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f3f4f6",
        padding: 20,
      }}
    >
      <div
        style={{
          maxWidth: 600,
          background: "white",
          padding: 24,
          borderRadius: 10,
          boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: 20 }}>
          Terima Kasih!
        </h2>

        <p style={{ marginBottom: 20 }}>
          Terima kasih telah mengisi Form Penerimaan.
          <br />
          Jika buku belum terunduh otomatis, silakan klik tombol di bawah:
        </p>

        <a
          href={pdf}
          download
          style={{
            display: "block",
            textAlign: "center",
            background: "#1d4ed8",
            padding: 12,
            borderRadius: 8,
            color: "white",
            textDecoration: "none",
            fontWeight: "bold"
          }}
        >
          Download Bukti Penerimaan
        </a>
      </div>
    </div>
  );
}

export async function getServerSideProps(context) {
  const { query } = context;

  return {
    props: {
      pdf: query.pdf || ""
    }
  };
}
