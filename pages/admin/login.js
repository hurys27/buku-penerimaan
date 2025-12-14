import { useState } from "react";

export default function AdminLogin() {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");

  const handleLogin = async () => {
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = "/admin";
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: "0 auto" }}>
      <h2>Admin Login</h2>

      <label>Username</label>
      <input
        type="text"
        value={username}
        onChange={(e) => setUser(e.target.value)}
        className="input"
      />

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPass(e.target.value)}
        className="input"
      />

      <button
        onClick={handleLogin}
        style={{ width: "100%", padding: 10, background: "#1d4ed8", color: "white" }}
      >
        Login
      </button>

      <style>{`
        .input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ccc;
          border-radius: 5px;
        }
      `}</style>
    </div>
  );
}
