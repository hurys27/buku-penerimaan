import { useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export default function Home() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [telepon, setTelepon] = useState("");
  const [instansi, setInstansi] = useState("");
  const sigRef = useRef(null);

  const handleReset = () => {
    sigRef.current.clear();
  };

  const handleSubmit = async () => {
    const signature = sigRef.current.getTrimmedCanvas().toDataURL("image/png");

    const formData = {
      nama,
      email,
      telepon,
      instansi,
      signature,
    };

    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
    	window.location.href = "/terimakasih"; // Redirect after success
 	 } else {
 	   alert("Terjadi kesalahan, coba lagi.");
 	 }	
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "40px 0" }}>
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          background: "white",
          borderRadius: "12px",
          padding: "35px",
          boxShadow: "0px 4px 20px rgba(0,0,0,0.1)",
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "10px" }}>
          <img
            src="/logo.svg"
            alt="Logo"
            style={{ width: "120px", marginBottom: "15px" }}
          />
        </div>

        {/* TITLE */}
        <h2 style={{ textAlign: "center", marginBottom: "5px" }}>
          Form Penerimaan Buku
        </h2>
        <p style={{ textAlign: "center", marginBottom: "25px", fontSize: "18px" }}>
          "Ekonomi dan Kebijakan Perberasan di Negara Produsen Beras"
        </p>

        {/* FORM FIELDS */}
        <label>Nama Lengkap</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="input"
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />

        <label>No Telepon</label>
        <input
          type="text"
          value={telepon}
          onChange={(e) => setTelepon(e.target.value)}
          className="input"
        />

        <label>Instansi/Organisasi</label>
        <input
          type="text"
          value={instansi}
          onChange={(e) => setInstansi(e.target.value)}
          className="input"
        />

        <label>Tanda Tangan</label>
        <div
          style={{
            border: "1px dashed #bbb",
            borderRadius: "5px",
            marginBottom: "10px",
          }}
        >
          <SignatureCanvas
            ref={sigRef}
            penColor="black"
            canvasProps={{ width: 540, height: 250 }}
          />
        </div>

        <button
          onClick={handleReset}
          style={{
            background: "#777",
            color: "white",
            border: "none",
            padding: "6px 15px",
            borderRadius: "5px",
            marginBottom: "15px",
            cursor: "pointer",
          }}
        >
          Reset Tanda Tangan
        </button>

{/* NOTE */}
<p
  style={{
    textAlign: "center",
    fontSize: "14px",
    color: "#555",
    marginTop: "5px",
    marginBottom: "15px",
    fontStyle: "italic"
  }}
>
  *Link Download Buku akan tersedia setelah submit form
</p>

        {/* SUBMIT BUTTON */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "12px",
            background: "#1d4ed8",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "15px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Kirim
        </button>

        {/* SIMPLE INPUT CSS */}
        <style>{`
          .input {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: #f9faff;
          }
        `}</style>
      </div>
    </div>
  );
}
