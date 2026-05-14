const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = header.replace("Bearer ", "").trim();
  try {
    const payload = jwt.verify(token, "change-me");
    const user = await User.findById(payload.userId).select(
      "_id name email role isActive",
    );
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = auth;
