const express = require("express");
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const User = require("../models/User");

const router = express.Router();

router.use(auth, requireRole("admin"));

router.get("/users", async (req, res, next) => {
	try {
		const users = await User.find()
			.select("_id name email role isActive createdAt")
			.sort({ createdAt: -1 });
		return res.json(users);
	} catch (error) {
		return next(error);
	}
});

router.put("/users/:id/role", async (req, res, next) => {
	try {
		const { role } = req.body;
		if (!role || !["admin", "user"].includes(role)) {
			return res.status(400).json({ message: "Invalid role" });
		}

		const updated = await User.findByIdAndUpdate(
			req.params.id,
			{ role },
			{ new: true },
		).select("_id name email role isActive createdAt");

		if (!updated) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.json(updated);
	} catch (error) {
		return next(error);
	}
});

router.put("/users/:id/status", async (req, res, next) => {
	try {
		const { isActive } = req.body;
		if (typeof isActive !== "boolean") {
			return res.status(400).json({ message: "Invalid status" });
		}

		const updated = await User.findByIdAndUpdate(
			req.params.id,
			{ isActive },
			{ new: true },
		).select("_id name email role isActive createdAt");

		if (!updated) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.json(updated);
	} catch (error) {
		return next(error);
	}
});

module.exports = router;
