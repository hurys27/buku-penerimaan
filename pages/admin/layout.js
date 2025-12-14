// pages/admin/layout.js
import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f3f4f6" }}>
      
      {/* SIDEBAR */}
      <aside
        style={{
          width: "260px",
          background: "#1e3a8a",
          color: "white",
          padding: "25px 20px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        {/* LOGO */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <img
            src="/logo.svg"
            style={{ width: "80px", marginBottom: "10px" }}
            alt="logo"
          />
          <h3 style={{ margin: 0, fontSize: "18px", lineHeight: "1.3" }}>
            Manajemen Penerimaan Buku
          </h3>
        </div>

        <hr style={{ borderColor: "rgba(255,255,255,0.3)", marginBottom: "20px" }} />

        {/* MENU ITEMS */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

          <Link href="/admin" style={menuItem}>
            📂 Data Store
          </Link>

          <Link href="/admin/book" style={menuItem}>
            📘 Book Settings
          </Link>

          <Link href="/admin/email-db" style={menuItem}>
            📧 Contact
          </Link>

          {/* NEW — Broadcast Menu */}
          <Link href="/admin/email-bc" style={menuItem}>
            📣 Broadcast
          </Link>

        </nav>

        <hr style={{ borderColor: "rgba(255,255,255,0.3)", margin: "20px 0" }} />

        {/* LOGOUT */}
        <Link href="/admin/logout" style={{ ...menuItem, marginTop: "auto" }}>
          🚪 Logout
        </Link>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main style={{ flex: 1, padding: "25px" }}>{children}</main>
    </div>
  );
}

const menuItem = {
  padding: "10px 12px",
  borderRadius: "6px",
  background: "rgba(255,255,255,0.1)",
  textDecoration: "none",
  color: "white",
  fontSize: "16px",
  transition: "0.2s",
  cursor: "pointer"
};
