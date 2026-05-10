const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Expense = require("../models/Expense");
const Settlement = require("../models/Settlement");
const { computeBalances } = require("../utils/balance");

const router = express.Router();

router.use(auth);

router.get("/friends", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("friends");
    const friends = await User.find({ _id: { $in: user.friends } }).select(
      "_id name email",
    );

    const expenses = await Expense.find({
      $or: [{ participants: req.user._id }, { paidBy: req.user._id }],
    }).select("amount splitType splits participants paidBy");

    const settlements = await Settlement.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    }).select("from to amount");

    const balanceMap = computeBalances({
      userId: req.user._id.toString(),
      expenses,
      settlements,
    });

    const payload = friends.map((friend) => ({
      friend,
      balance: Number((balanceMap.get(friend._id.toString()) || 0).toFixed(2)),
    }));

    return res.json(payload);
  } catch (error) {
    return next(error);
  }
});

router.post("/settle", async (req, res, next) => {
  try {
    const { friendId, amount } = req.body;
    if (!friendId || !amount) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const friend = await User.findById(friendId).select("_id");
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    const me = await User.findById(req.user._id).select("friends");
    const isFriend = me.friends.some(
      (entry) => entry.toString() === friend._id.toString(),
    );
    if (!isFriend) {
      return res.status(403).json({ message: "Not friends" });
    }

    const expenses = await Expense.find({
      $or: [{ participants: req.user._id }, { paidBy: req.user._id }],
    }).select("amount splitType splits participants paidBy");

    const settlements = await Settlement.find({
      $or: [{ from: req.user._id }, { to: req.user._id }],
    }).select("from to amount");

    const balanceMap = computeBalances({
      userId: req.user._id.toString(),
      expenses,
      settlements,
    });

    const currentBalance = balanceMap.get(friendId.toString()) || 0;
    if (currentBalance === 0) {
      return res.status(400).json({ message: "Already settled" });
    }

    const from = currentBalance < 0 ? req.user._id : friend._id;
    const to = currentBalance < 0 ? friend._id : req.user._id;

    await Settlement.create({
      from,
      to,
      amount: amountValue,
      createdBy: req.user._id,
    });

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
