import handlerOriginal from "../bukti-penerimaan";

export default async function handler(req, res) {
  const cookies = req.headers.cookie || "";
  if (!cookies.includes("admin_session=valid")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Forward request to the original working generator
  return handlerOriginal(req, res);
}
