const express = require("express");
const auth = require("../middleware/auth");
const Expense = require("../models/Expense");

const router = express.Router();

router.use(auth);

const normalizeParticipants = (participants = []) => {
  const unique = Array.from(new Set(participants.map((id) => id.toString())));
  return unique;
};

const buildSplits = ({ splitType, splits, participants, amount }) => {
  if (splitType === "equal") {
    return [];
  }

  const normalized = [];
  const splitList = Array.isArray(splits) ? splits : [];
  const splitMap = new Map();

  splitList.forEach((split) => {
    if (!split?.user) return;
    splitMap.set(split.user.toString(), split);
  });

  if (splitType === "unequal") {
    let total = 0;
    participants.forEach((participant) => {
      const entry = splitMap.get(participant) || {};
      const amountOwed = Number(entry.amountOwed || 0);
      total += amountOwed;
      normalized.push({ user: participant, amountOwed });
    });

    if (Math.abs(total - amount) > 0.02) {
      throw new Error("Unequal splits must sum to total amount");
    }

    return normalized;
  }

  if (splitType === "percentage") {
    let totalPercent = 0;
    participants.forEach((participant) => {
      const entry = splitMap.get(participant) || {};
      const percentage = Number(entry.percentage || 0);
      totalPercent += percentage;
      normalized.push({
        user: participant,
        percentage,
        amountOwed: (amount * percentage) / 100,
      });
    });

    if (Math.abs(totalPercent - 100) > 0.1) {
      throw new Error("Percentage splits must sum to 100");
    }

    return normalized;
  }

  let totalShares = 0;
  participants.forEach((participant) => {
    const entry = splitMap.get(participant) || {};
    totalShares += Number(entry.shares || 0);
  });

  if (totalShares <= 0) {
    throw new Error("Shares must total more than 0");
  }

  participants.forEach((participant) => {
    const entry = splitMap.get(participant) || {};
    const shares = Number(entry.shares || 0);
    normalized.push({
      user: participant,
      shares,
      amountOwed: (amount * shares) / totalShares,
    });
  });

  return normalized;
};

router.post("/", async (req, res, next) => {
  try {
    const {
      title,
      description,
      amount,
      paidBy,
      participants,
      splitType,
      splits,
    } = req.body;

    if (!title || !amount || !paidBy || !participants?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const amountValue = Number(amount);
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const normalizedParticipants = normalizeParticipants(participants);
    if (!normalizedParticipants.includes(paidBy.toString())) {
      return res.status(400).json({ message: "Paid by must be a participant" });
    }

    const splitTypeNormalized = splitType || "equal";
    const normalizedSplits = buildSplits({
      splitType: splitTypeNormalized,
      splits,
      participants: normalizedParticipants,
      amount: amountValue,
    });

    const expense = await Expense.create({
      title: title.trim(),
      description: description?.trim() || "",
      amount: amountValue,
      paidBy,
      participants: normalizedParticipants,
      splitType: splitTypeNormalized,
      splits: normalizedSplits,
      createdBy: req.user._id,
    });

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "_id name email")
      .populate("participants", "_id name email")
      .populate("splits.user", "_id name email");

    return res.json(populated);
  } catch (error) {
    return next(error);
  }
});

router.get("/user", async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      $or: [{ participants: req.user._id }, { paidBy: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("paidBy", "_id name email")
      .populate("participants", "_id name email")
      .populate("splits.user", "_id name email");

    return res.json(expenses);
  } catch (error) {
    return next(error);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const {
      title,
      description,
      amount,
      paidBy,
      participants,
      splitType,
      splits,
    } = req.body;

    const amountValue = Number(amount);
    if (!title || !amountValue || !paidBy || !participants?.length) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const normalizedParticipants = normalizeParticipants(participants);
    if (!normalizedParticipants.includes(paidBy.toString())) {
      return res.status(400).json({ message: "Paid by must be a participant" });
    }

    const splitTypeNormalized = splitType || "equal";
    const normalizedSplits = buildSplits({
      splitType: splitTypeNormalized,
      splits,
      participants: normalizedParticipants,
      amount: amountValue,
    });

    expense.title = title.trim();
    expense.description = description?.trim() || "";
    expense.amount = amountValue;
    expense.paidBy = paidBy;
    expense.participants = normalizedParticipants;
    expense.splitType = splitTypeNormalized;
    expense.splits = normalizedSplits;

    await expense.save();

    const populated = await Expense.findById(expense._id)
      .populate("paidBy", "_id name email")
      .populate("participants", "_id name email")
      .populate("splits.user", "_id name email");

    return res.json(populated);
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();
    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
