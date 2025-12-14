import handlerOriginal from "../bukti-penerimaan";

export default async function handler(req, res) {
  const cookies = req.headers.cookie || "";
  if (!cookies.includes("admin_session=valid")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  console.log("DEBUG /api/admin/pdf body =", req.body);

  return handlerOriginal(req, res);
}
