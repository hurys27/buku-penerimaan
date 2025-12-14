// pages/admin/email-db.js
import AdminLayout from "./layout";
import { useEffect, useState, useRef } from "react";

/* --- CSV PARSER --- */
function parseCSV(text) {
  const rows = text.split(/\r?\n/).map(r => r.split(","));
  const header = rows[0].map(h => h.trim().toLowerCase());

  const contacts = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length < 2) continue;
    if (!row[0].trim() && !row[1].trim()) continue;

    const obj = {};
    header.forEach((h, idx) => {
      if (h.includes("name")) obj.name = row[idx]?.trim() || "";
      else if (h.includes("email")) obj.email = row[idx]?.trim() || "";
      else if (h.includes("instansi")) obj.instansi = row[idx]?.trim() || "";
    });
    contacts.push(obj);
  }
  return contacts;
}

/* --- CSV EXPORT --- */
function exportCSV(rows) {
  if (!rows.length) return;
  const keys = ["name", "email", "instansi", "added_at"];
  const lines = [keys.join(",")];

  rows.forEach(r => {
    lines.push(keys.map(k => r[k] || "").join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contacts.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function EmailDB() {
  const [contacts, setContacts] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState("");

  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newInstansi, setNewInstansi] = useState("");

  const fileRef = useRef();

  useEffect(() => fetchList(), []);

  async function fetchList() {
    const res = await fetch("/api/admin/email-db");
    const json = await res.json();
    setContacts(Array.isArray(json) ? json : []);
    setSelected(new Set());
  }

  /* --- CSV UPLOAD --- */
  function handleCSVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const list = parseCSV(reader.result);
      if (!confirm(`Import ${list.length} contacts?`)) return;

      await fetch("/api/admin/email-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: list }),
      });

      fileRef.current.value = "";
      fetchList();
    };
    reader.readAsText(file);
  }

  /* --- ADD CONTACT MANUALLY --- */
  async function addContact() {
    if (!newName || !newEmail) return alert("Name & Email required");

    await fetch("/api/admin/email-db", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newName,
        email: newEmail,
        instansi: newInstansi,
      }),
    });

    setNewName("");
    setNewEmail("");
    setNewInstansi("");
    fetchList();
  }

  /* --- DELETE SELECTED --- */
  async function deleteSelectedContacts() {
    if (selected.size === 0) return alert("No contacts selected");
    if (!confirm("Delete selected contacts?")) return;

    await fetch("/api/admin/email-db", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "emails",
        emails: Array.from(selected),
      }),
    });

    fetchList();
  }

  /* --- TABLE FILTERING --- */
  const filtered = contacts.filter(c => {
    const q = query.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.instansi?.toLowerCase().includes(q)
    );
  });

  return (
    <AdminLayout>
      <h2 style={{ marginBottom: 15 }}>Contact Database</h2>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search name / email / instansi"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginBottom: "15px",
          borderRadius: 6,
          border: "1px solid #ccc",
        }}
      />

      {/* TABLE */}
      <div style={tableBox}>
        <table style={tableStyle}>
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
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: "center", padding: 15 }}>No contacts</td></tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.has(c.email)}
                      onChange={() => {
                        const s = new Set(selected);
                        s.has(c.email) ? s.delete(c.email) : s.add(c.email);
                        setSelected(s);
                      }}
                    />
                  </td>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.instansi}</td>
                  <td>{c.added_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- BOTTOM TOOLBAR --- */}
      <div style={bottomBar}>
        {/* Add Contact */}
        <input
          placeholder="Name"
          value={newName}
          onChange={e => setNewName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={newEmail}
          onChange={e => setNewEmail(e.target.value)}
        />
        <input
          placeholder="Instansi"
          value={newInstansi}
          onChange={e => setNewInstansi(e.target.value)}
        />
        <button onClick={addContact} className="btn-blue">Add</button>

        {/* CSV Upload */}
        <input type="file" accept=".csv" ref={fileRef} onChange={handleCSVUpload} />

        {/* CSV Export */}
        <button className="btn-green" onClick={() => exportCSV(contacts)}>Export CSV</button>

        {/* Delete Selected */}
        <button className="btn-red" onClick={deleteSelectedContacts}>Delete Selected</button>
      </div>

      <p style={{ marginTop: 10, fontSize: 13 }}><b>CSV Format:</b> name, email, instansi</p>
    </AdminLayout>
  );
}

/* ---------- STYLES ---------- */

const tableBox = {
  background: "white",
  padding: 10,
  borderRadius: 10,
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)",
  marginBottom: 20,
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const bottomBar = {
  display: "flex",
  gap: 10,
  alignItems: "center",
  flexWrap: "wrap",
};
