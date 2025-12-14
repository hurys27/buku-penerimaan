import AdminLayout from "./layout";
import { useEffect, useState } from "react";

/* =========================
   Helpers
   ========================= */
function formatDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  if (isNaN(d.getTime())) return v;
  return d.toLocaleString();
}

export default function EmailBroadcast() {
  const [tab, setTab] = useState("send");

  // sender settings
  const [senderEmail, setSenderEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderPass, setSenderPass] = useState("");

  // data
  const [contacts, setContacts] = useState([]);
  const [history, setHistory] = useState([]);

  // compose
  const [subject, setSubject] = useState("Informasi Buku");
  const [body, setBody] = useState(
    "Yth {{name}},\n{{instansi}}\n\nSilakan isi formulir tanda terima.\n\nTerima kasih."
  );

  // selection
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [selectedHistory, setSelectedHistory] = useState(new Set());

  // progress
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [log, setLog] = useState([]);

  useEffect(() => {
    loadSenderSettings();
    loadContacts();
    loadHistory();
  }, []);

  async function loadSenderSettings() {
    const res = await fetch("/api/admin/sender-settings");
    const json = await res.json();
    setSenderEmail(json.senderEmail || "");
    setSenderName(json.senderName || "");
    setSenderPass(json.senderPass || "");
  }

  async function saveSenderSettings() {
    await fetch("/api/admin/sender-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senderEmail, senderName, senderPass })
    });
    alert("Sender settings saved");
  }

  async function loadContacts() {
    const res = await fetch("/api/admin/email-db");
    setContacts(await res.json());
  }

  async function loadHistory() {
    const res = await fetch("/api/admin/email-history");
    setHistory(await res.json());
  }

  function toggleContact(email) {
    const s = new Set(selectedContacts);
    s.has(email) ? s.delete(email) : s.add(email);
    setSelectedContacts(s);
  }

  function toggleHistory(id) {
    const s = new Set(selectedHistory);
    s.has(id) ? s.delete(id) : s.add(id);
    setSelectedHistory(s);
  }

  /* ================= SEND EMAIL ================= */
  async function send() {
    const recipients = contacts.filter(c =>
      selectedContacts.has(c.email)
    );

    if (!recipients.length) {
      alert("No recipients selected");
      return;
    }

    if (!confirm(`Send email to ${recipients.length} recipients?`)) return;

    setSending(true);
    setLog([]);
    setProgress({ current: 0, total: recipients.length });

    try {
      const res = await fetch("/api/admin/email-bc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, body, recipients })
      });

      const json = await res.json();

      let count = 0;
      for (const r of json.results || []) {
        count++;
        setProgress({ current: count, total: recipients.length });
        setLog(prev => [...prev, r]);
        await new Promise(r => setTimeout(r, 250));
      }

      loadHistory();
    } finally {
      setSending(false);
    }
  }

  /* ================= DELETE HISTORY ================= */
  async function deleteSelectedHistory() {
    if (selectedHistory.size === 0) {
      alert("No history selected");
      return;
    }

    if (!confirm(`Delete ${selectedHistory.size} selected items?`)) return;

    await fetch("/api/admin/email-history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selectedHistory) })
    });

    setSelectedHistory(new Set());
    loadHistory();
  }

  /* ================= EXPORT HISTORY CSV ================= */
  function exportHistoryCSV() {
    let csv = "Recipient,Subject,Time,Status,Error\n";
    history.forEach(h => {
      csv += `"${h.email}","${h.subject}","${formatDate(h.time)}","${h.status}","${h.error || ""}"\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "email-history.csv";
    a.click();
  }

  return (
    <AdminLayout>
      <div style={{ padding: 20 }}>
        <h2 style={{ marginBottom: 20 }}>📣 Broadcast Email</h2>

        {/* Sender Settings */}
        <div className="card">
          <div className="card-title">Sender Settings</div>
          <div className="row">
            <input value={senderEmail} onChange={e => setSenderEmail(e.target.value)} placeholder="Sender Email" />
            <input value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Sender Name" />
            <input type="password" value={senderPass} onChange={e => setSenderPass(e.target.value)} placeholder="Gmail App Password" />
            <button className="btn-blue" onClick={saveSenderSettings}>Save</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: 12 }}>
          <button className="btn-blue" onClick={() => setTab("send")}>Send Email</button>
          <button className="btn-blue" onClick={() => setTab("history")}>History</button>
        </div>

        {/* SEND TAB */}
        {tab === "send" && (
          <>
            {/* RECIPIENTS */}
            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Instansi</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.map(c => (
                    <tr key={c.email}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedContacts.has(c.email)}
                          onChange={() => toggleContact(c.email)}
                        />
                      </td>
                      <td>{c.name}</td>
                      <td>{c.email}</td>
                      <td>{c.instansi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* COMPOSE */}
            <div className="card">
              <div className="card-title">Compose Email</div>
              <input
                className="full-input"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Subject"
              />
              <textarea
                className="full-textarea"
                value={body}
                onChange={e => setBody(e.target.value)}
              />
              <button className="btn-green" onClick={send} disabled={sending}>
                {sending ? "Sending..." : "Send Email"}
              </button>
            </div>

            {/* PROGRESS */}
            <div className="card">
              <div className="card-title">Progress</div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width:
                      progress.total === 0
                        ? "0%"
                        : `${(progress.current / progress.total) * 100}%`
                  }}
                />
              </div>
              <small>
                {progress.current} / {progress.total}
              </small>
            </div>
          </>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <>
            <div className="top-controls">
              <button className="btn-green" onClick={exportHistoryCSV}>
                ⬇ Export CSV
              </button>
              <button className="btn-red-small" onClick={deleteSelectedHistory}>
                Delete Selected
              </button>
            </div>

            <div className="table-responsive">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Recipient</th>
                    <th>Subject</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => (
                    <tr key={h.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedHistory.has(h.id)}
                          onChange={() => toggleHistory(h.id)}
                        />
                      </td>
                      <td>{h.email}</td>
                      <td>{h.subject}</td>
                      <td>{formatDate(h.time)}</td>
                      <td style={{ color: h.status === "OK" ? "green" : "red" }}>
                        {h.status}
                      </td>
                      <td>{h.error || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <style>{styles}</style>
      </div>
    </AdminLayout>
  );
}

/* ================= CSS ================= */
const styles = `
.card {
  background: white;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}

.card-title {
  font-weight: 600;
  margin-bottom: 10px;
}

.row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.table-responsive {
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
  margin-bottom: 16px;
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
  gap: 10px;
  margin-bottom: 10px;
}

.full-input {
  width: 100%;
  padding: 8px;
  margin-bottom: 8px;
}

.full-textarea {
  width: 100%;
  height: 160px;
  padding: 8px;
  margin-bottom: 10px;
}

.progress-bar {
  height: 10px;
  background: #e5e7eb;
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 6px;
}

.progress-fill {
  height: 100%;
  background: #16a34a;
  transition: width .3s;
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

.btn-red-small {
  background: #dc2626;
  color: white;
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
}
`;
