import AdminLayout from "./layout";
import { useEffect, useState } from "react";

/* =========================
   Date Formatter
   ========================= */
function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

const page = { padding: 20 };

export default function AdminPanel() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(new Set());

  const [search, setSearch] = useState("");
  const [pageNum, setPageNum] = useState(1);
  const perPage = 10;

  /* ---------------- LOAD DATA ---------------- */
  async function load() {
    const res = await fetch("/api/admin/data");
    if (res.status === 401) {
      window.location.href = "/admin/login";
      return;
    }
    const json = await res.json();
    setData(json);
    setFiltered(json);
    setSelected(new Set());
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------------- SEARCH ---------------- */
  useEffect(() => {
    const s = search.toLowerCase();
    const f = data.filter(
      (x) =>
        x.nama.toLowerCase().includes(s) ||
        x.email.toLowerCase().includes(s) ||
        x.instansi.toLowerCase().includes(s)
    );
    setFiltered(f);
    setPageNum(1);
    setSelected(new Set());
  }, [search, data]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filtered.length / perPage);
  const pageData = filtered.slice(
    (pageNum - 1) * perPage,
    pageNum * perPage
  );

  /* ---------------- SELECTION ---------------- */
  function toggle(email) {
    const s = new Set(selected);
    s.has(email) ? s.delete(email) : s.add(email);
    setSelected(s);
  }

  function toggleAll() {
    if (selected.size === pageData.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(pageData.map((x) => x.email)));
    }
  }

  /* ---------------- DOWNLOAD PDF ---------------- */
  function downloadPDF(index, item) {
    fetch("/api/admin/pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: index }),
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `bukti-${item.nama}.pdf`;
        a.click();
      });
  }

  /* ---------------- EXPORT CSV ---------------- */
  function exportCSV() {
    let csv = "Nama,Email,Telepon,Instansi,Tanggal,Judul Buku\n";
    filtered.forEach((x) => {
      csv += `"${x.nama}","${x.email}","${x.telepon}","${x.instansi}","${formatDate(
        x.waktu
      )}","${x.bookTitle || "-"}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data-store.csv";
    a.click();
  }

  /* ---------------- DELETE SELECTED ---------------- */
  async function deleteSelected() {
    if (selected.size === 0) {
      alert("No rows selected");
      return;
    }

    if (!confirm(`Delete ${selected.size} selected data?`)) return;

    await fetch("/api/admin/data", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "emails",
        emails: Array.from(selected),
      }),
    });

    load();
  }

  /* ---------------- DELETE ALL ---------------- */
  async function deleteAll() {
    if (!confirm("Delete ALL data? This cannot be undone.")) return;

    await fetch("/api/admin/data", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "all" }),
    });

    load();
  }

  return (
    <AdminLayout>
      <div style={page}>
        <h2 style={{ marginBottom: 20 }}>📄 Data Stored</h2>

        {/* SEARCH + ACTIONS */}
        <div className="top-controls">
          <input
            className="search"
            placeholder="Cari nama, email, instansi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-green" onClick={exportCSV}>
              ⬇ Export CSV
            </button>
            <button className="btn-orange" onClick={deleteSelected}>
              🗑 Delete Selected
            </button>
            <button className="btn-red-small" onClick={deleteAll}>
              Delete ALL
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={
                      pageData.length > 0 &&
                      selected.size === pageData.length
                    }
                    onChange={toggleAll}
                  />
                </th>
                <th>Nama</th>
                <th>Email</th>
                <th>Telepon</th>
                <th>Instansi</th>
                <th>Tanggal</th>
                <th>Judul Buku</th>
                <th>PDF</th>
              </tr>
            </thead>

            <tbody>
              {pageData.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 20 }}>
                    No data
                  </td>
                </tr>
              ) : (
                pageData.map((item, i) => (
                  <tr key={item.email}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(item.email)}
                        onChange={() => toggle(item.email)}
                      />
                    </td>
                    <td>{item.nama}</td>
                    <td>{item.email}</td>
                    <td>{item.telepon}</td>
                    <td>{item.instansi}</td>
                    <td>{formatDate(item.waktu)}</td>
                    <td>{item.bookTitle || "-"}</td>
                    <td>
                      <button
                        className="btn-blue"
                        onClick={() =>
                          downloadPDF(
                            (pageNum - 1) * perPage + i,
                            item
                          )
                        }
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <button
            disabled={pageNum === 1}
            onClick={() => setPageNum(pageNum - 1)}
          >
            ◀ Prev
          </button>

          <span>
            Page {pageNum} of {totalPages}
          </span>

          <button
            disabled={pageNum === totalPages}
            onClick={() => setPageNum(pageNum + 1)}
          >
            Next ▶
          </button>
        </div>

        <style>{styles}</style>
      </div>
    </AdminLayout>
  );
}

/* ---------------- CSS ---------------- */

const styles = `
.table-responsive {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #1e3a8a;
  color: white;
  padding: 10px;
}

td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
}

tbody tr:nth-child(odd) {
  background: #f9fafb;
}

tbody tr:hover {
  background: #e0f2fe;
}

.top-controls {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.search {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.btn-blue {
  background: #2563eb;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
}

.btn-green {
  background: #16a34a;
  color: white;
  border: none;
  padding: 7px 15px;
  border-radius: 6px;
}

.btn-orange {
  background: #ea580c;
  color: white;
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
}

.btn-red-small {
  background: #dc2626;
  color: white;
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
}

.pagination {
  margin-top: 15px;
  display: flex;
  justify-content: center;
  gap: 12px;
}
`;
