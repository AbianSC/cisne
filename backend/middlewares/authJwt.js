const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "No token provided." });

  const [type, token] = header.split(" ");
  if (type !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization header." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch {
    return res.status(401).json({ message: "Unauthorized (invalid/expired token)." });
  }
};

exports.requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user?.role) return res.status(401).json({ message: "Unauthorized." });
    if (!roles.includes(req.user.role)) return res.status(403).json({ message: "Forbidden." });
    next();
  };
};
