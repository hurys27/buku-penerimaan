export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { username, password } = req.body;

  // CHANGE THESE!!!
  const ADMIN_USER = "admin";
  const ADMIN_PASS = "123456";

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // Set session cookie
    res.setHeader("Set-Cookie", `admin_session=valid; Path=/; HttpOnly`);
    return res.status(200).json({ message: "Logged in" });
  }

  return res.status(401).json({ message: "Invalid credentials" });
}
