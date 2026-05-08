const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amountOwed: { type: Number, required: true },
    percentage: { type: Number },
    shares: { type: Number },
  },
  { _id: false },
);

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number, required: true },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    splitType: {
      type: String,
      enum: ["equal", "unequal", "percentage", "shares"],
      default: "equal",
    },
    splits: [splitSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Expense", expenseSchema);
