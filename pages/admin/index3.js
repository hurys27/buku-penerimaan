import { useEffect, useState } from "react";

export default function AdminPanel() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch("/api/admin/data")
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        return res.json();
      })
      .then((json) => {
        if (Array.isArray(json)) setData(json);
      });
  }, []);

  // FIXED PDF DOWNLOAD — now sends ONLY { id, title }
  const downloadPDF = (index, item) => {
    const payload = {
      id: index,  
      title: "Ekonomi dan Kebijakan Perberasan di Negara Produsen Beras",
    };

    fetch("/api/admin/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          alert("Gagal membuat PDF");
          return null;
        }
        return res.blob();
      })
      .then((blob) => {
        if (!blob) return;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bukti-${item.nama}.pdf`;
        a.click();
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>

      <table border="1" cellPadding="10" style={{ width: "100%", background: "white" }}>
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Telepon</th>
            <th>Instansi</th>
            <th>Tanggal</th>
            <th>Download PDF</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, i) => (
            <tr key={i}>
              <td>{item.nama}</td>
              <td>{item.email}</td>
              <td>{item.telepon}</td>
              <td>{item.instansi}</td>
              <td>{item.waktu}</td>
              <td>
                <button onClick={() => downloadPDF(i, item)}>
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
