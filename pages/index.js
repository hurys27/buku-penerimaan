import { useRef, useState } from "react";
import dynamic from "next/dynamic";

// dynamic import so it doesn't SSR
const SignaturePad = dynamic(() => import("react-signature-canvas"), { ssr: false });

const FIXED_BOOK_TITLE = "Ekonomi dan Kebijakan Perberasan di Negara Produsen Beras";

export default function Home() {
  const sigPadRef = useRef(null);

  const [form, setForm] = useState({
    nama: "",
    email: "",
    telepon: "",
    instansi: ""
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function clearSignature() {
    try {
      sigPadRef.current?.clear();
    } catch (e) {
      // ignore
    }
  }

  // robust signature-empty check (works across many versions/wrappers)
  function isPadEmpty(padRef) {
    if (!padRef) return true;

    try {
      const pad = padRef;

      // 1) If pad has isEmpty()
      if (typeof pad.isEmpty === "function") {
        try { return pad.isEmpty(); } catch (e) {}
      }

      // 2) If pad has toData()
      if (typeof pad.toData === "function") {
        try {
          const d = pad.toData();
          return Array.isArray(d) && d.length === 0;
        } catch (e) {}
      }

      // 3) If pad has getTrimmedCanvas()
      if (typeof pad.getTrimmedCanvas === "function") {
        try {
          const canvas = pad.getTrimmedCanvas();
          if (canvas && typeof canvas.toDataURL === "function") {
            const size = canvas.toDataURL().length;
            // threshold: < 5000 bytes likely empty
            return size < 5000;
          }
        } catch (e) {}
      }

      // 4) check common internal wrappers (some versions store under _signaturePad / _sigPad)
      const internals = ["_signaturePad", "_sigPad", "_sigCanvas", "sigPad", "_pad", "signaturePad"];
      for (const key of internals) {
        if (pad[key]) {
          const inner = pad[key];
          if (typeof inner.isEmpty === "function") {
            try { return inner.isEmpty(); } catch (e) {}
          }
          if (typeof inner.toData === "function") {
            try {
              const d = inner.toData();
              if (Array.isArray(d)) return d.length === 0;
            } catch (e) {}
          }
          // if inner.canvas exists
          if (inner.canvas && typeof inner.canvas.toDataURL === "function") {
            try {
              return inner.canvas.toDataURL().length < 5000;
            } catch (e) {}
          }
        }
      }

      // 5) DOM fallback: try to find the visible canvas element (className 'sigCanvas')
      try {
        const el = document.querySelector(".sigCanvas");
        if (el && typeof el.toDataURL === "function") {
          return el.toDataURL().length < 5000;
        }
      } catch (e) {}

      // 6) If nothing determined, assume NOT empty to avoid blocking users incorrectly.
      // (You can flip to 'true' if you prefer to block on unknown)
      return false;
    } catch (e) {
      // on unexpected error, be permissive
      return false;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const pad = sigPadRef.current;

    // Use robust checker
    if (!pad || isPadEmpty(pad)) {
      alert("Mohon tanda tangan dulu.");
      return;
    }

    // create signatureDataUrl robustly
    let signatureDataUrl = null;
    try {
      if (typeof pad.getTrimmedCanvas === "function") {
        signatureDataUrl = pad.getTrimmedCanvas().toDataURL("image/png");
      } else if (typeof pad.canvas === "object" && typeof pad.canvas.toDataURL === "function") {
        signatureDataUrl = pad.canvas.toDataURL("image/png");
      } else {
        // try internal wrappers
        const inner = pad._signaturePad || pad._sigPad || pad.sigPad || pad.signaturePad;
        if (inner && inner.canvas && typeof inner.canvas.toDataURL === "function") {
          signatureDataUrl = inner.canvas.toDataURL("image/png");
        }
      }
    } catch (err) {
      // ignore and continue; if signatureDataUrl remains null we'll still try to submit
    }

    if (!signatureDataUrl) {
      // final fallback: try DOM canvas
      try {
        const el = document.querySelector(".sigCanvas");
        if (el && typeof el.toDataURL === "function") {
          signatureDataUrl = el.toDataURL("image/png");
        }
      } catch (e) {}
    }

    try {
      setLoading(true);

      const payload = {
        title: FIXED_BOOK_TITLE,
        nama: form.nama,
        email: form.email,
        telepon: form.telepon,
        instansi: form.instansi,
        signatureDataUrl
      };

      const res = await fetch("/api/bukti-penerimaan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const txt = await res.text().catch(()=>null);
        throw new Error(txt || "Gagal membuat PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bukti_Penerimaan_${form.nama || "tanpa_nama"}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      // clear signature
      try { pad.clear(); } catch (e) {}
    } catch (err) {
      alert(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: 20,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f3f4f6"
    }}>
      <div style={{
        width: "100%",
        maxWidth: 720,
        background: "white",
        padding: 24,
        borderRadius: 10,
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
      }}>
        <h2 style={{ textAlign: "center", marginBottom: 6, fontSize: 24 }}>
          Form Penerimaan Buku
        </h2>

        <h3 style={{ textAlign: "center", marginBottom: 20, fontSize: 18, color: "#1f2937" }}>
          {FIXED_BOOK_TITLE}
        </h3>

        <form onSubmit={handleSubmit}>
          <label>Nama Lengkap</label>
          <input name="nama" value={form.nama} onChange={handleChange} required style={{ width: "100%", padding: 8, marginBottom: 12 }} />

          <label>Email</label>
          <input name="email" value={form.email} onChange={handleChange} type="email" required style={{ width: "100%", padding: 8, marginBottom: 12 }} />

          <label>No Telepon</label>
          <input name="telepon" value={form.telepon} onChange={handleChange} required style={{ width: "100%", padding: 8, marginBottom: 12 }} />

          <label>Instansi/Organisasi</label>
          <input name="instansi" value={form.instansi} onChange={handleChange} required style={{ width: "100%", padding: 8, marginBottom: 20 }} />

          <label>Tanda Tangan</label>
          <div style={{ border: "1px dashed #aaa", marginBottom: 12, padding: 5, borderRadius: 5, background: "#fff"}}>
            {/* numeric width/height ensure internal canvas works reliably */}
            <SignaturePad
              ref={sigPadRef}
              canvasProps={{
                width: 1000,
                height: 200,
                className: "sigCanvas",
                style: { width: "100%", height: 200, display: "block" }
              }}
            />
          </div>

          <style jsx>{`
            .sigCanvas {
              border-radius: 4px;
              background: white;
            }
          `}</style>

          <button type="button" onClick={clearSignature} style={{ padding: "6px 12px", marginBottom: 20, background: "#666", color: "white", border: "none", borderRadius: 5 }}>
            Reset Tanda Tangan
          </button>

          <button type="submit" disabled={loading} style={{ width: "100%", padding: 12, background: "#1d4ed8", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
            {loading ? "Memproses…" : "Kirim & Download Buku"}
          </button>
        </form>
      </div>
    </div>
  );
}

