
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    console.log("JWT_SECRET:", process.env.JWT_SECRET);
    console.log("TOKEN:", token);

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      console.log("VERIFY ERROR:", err);
      console.log("DECODED:", decoded);

      if (err || !decoded) {
        return res.status(401).json({ message: "Invalid token" });
      }

      req.user = {
        id: decoded.id || decoded.userId || decoded._id, // fallback support
        email: decoded.email || null,
      };

      if (!req.user.id) {
        return res.status(401).json({ message: "Invalid user payload in token" });
      }

      next();
    });
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: "Authentication processing failed" });
  }
};
