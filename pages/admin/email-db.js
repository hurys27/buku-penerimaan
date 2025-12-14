// pages/admin/email-db.js
import AdminLayout from "./layout";
import { useEffect, useState, useRef } from "react";

/* =========================
   Date Formatter
   ========================= */
function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

/* =========================
   Simple CSV Parser
   ========================= */
function parseCSV(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map(c => c.trim());
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = cols[idx] || "";
    });
    rows.push({
      name: obj.name || obj.nama || "",
      email: obj.email || "",
      instansi: obj.instansi || obj.org || obj.company || ""
    });
  }
  return rows.filter(r => r.email);
}

export default function EmailDB() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  /* ---------------- LOAD ---------------- */
  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/email-db");
      const json = await res.json();
      setContacts(Array.isArray(json) ? json : []);
      setSelected(new Set());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  /* ---------------- UPLOAD CSV ---------------- */
  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const rows = parseCSV(reader.result);
      if (rows.length === 0) {
        alert("No valid rows found");
        return;
      }

      if (!confirm(`Import ${rows.length} contacts?`)) return;

      setLoading(true);
      try {
        await fetch("/api/admin/email-db", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: rows })
        });
        load();
      } finally {
        setLoading(false);
        fileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  }

  /* ---------------- DELETE ---------------- */
  async function deleteSelected() {
    if (selected.size === 0) return alert("No rows selected");
    if (!confirm(`Delete ${selected.size} selected contacts?`)) return;

    await fetch("/api/admin/email-db", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "emails",
        emails: Array.from(selected)
      })
    });

    load();
  }

  async function deleteAll() {
    if (!confirm("Delete ALL contacts?")) return;

    await fetch("/api/admin/email-db", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "all" })
    });

    load();
  }

  function toggle(email) {
    const s = new Set(selected);
    s.has(email) ? s.delete(email) : s.add(email);
    setSelected(s);
  }

  const filtered = contacts.filter(c => {
    const q = query.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q) ||
      (c.instansi || "").toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <div style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 20 }}>📇 Contact</h2>

        {/* TOP CONTROLS */}
        <div className="top-controls">
          <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} />

          <input
            className="search"
            placeholder="Search name / email / instansi"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />

          <button className="btn-orange" onClick={deleteSelected}>
            🗑 Delete Selected
          </button>

          <button className="btn-red-small" onClick={deleteAll}>
            Delete ALL
          </button>
        </div>

        {/* TABLE */}
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Email</th>
                <th>Instansi</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 20 }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 20 }}>No contacts</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.email}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.has(c.email)}
                        onChange={() => toggle(c.email)}
                      />
                    </td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.instansi}</td>
                    <td>{formatDate(c.added_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <style>{styles}</style>
      </div>
    </AdminLayout>
  );
}

/* =========================
   SAME STYLES AS index.js
   ========================= */
const styles = `
.table-responsive {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  margin-top: 10px;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background: #1e3a8a;
  color: white;
  padding: 10px;
  text-align: left;
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
  gap: 10px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.search {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ccc;
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
`;
