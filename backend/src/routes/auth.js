const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../middleware/auth");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");
const Expense = require("../models/Expense");

const router = express.Router();

const signToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

router.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userCount = await User.countDocuments();
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      passwordHash,
      role: userCount === 0 ? "admin" : "user",
    });

    const token = signToken(user._id);
    return res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account is disabled" });
    }

    const token = signToken(user._id);
    return res.json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/logout", (req, res) => {
  res.json({ ok: true });
});

router.get("/profile", auth, async (req, res) => {
  res.json(req.user);
});

router.put("/profile", auth, async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim() },
      { new: true },
    ).select("_id name email role isActive");

    return res.json(user);
  } catch (error) {
    return next(error);
  }
});

router.put("/password", auth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) {
      return res.status(401).json({ message: "Invalid current password" });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

router.delete("/account", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await User.updateMany({ friends: userId }, { $pull: { friends: userId } });
    await FriendRequest.deleteMany({
      $or: [{ requester: userId }, { recipient: userId }],
    });
    await Expense.deleteMany({
      $or: [
        { createdBy: userId },
        { participants: userId },
        { paidBy: userId },
      ],
    });
    await User.findByIdAndDelete(userId);

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

router.get("/export", auth, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, expenses] = await Promise.all([
      User.findById(userId).select("_id name email friends").lean(),
      Expense.find({
        $or: [
          { createdBy: userId },
          { participants: userId },
          { paidBy: userId },
        ],
      })
        .populate("paidBy", "_id name email")
        .populate("participants", "_id name email")
        .populate("splits.user", "_id name email")
        .lean(),
    ]);

    return res.json({
      exportedAt: new Date().toISOString(),
      user,
      expenses,
    });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
