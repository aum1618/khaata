const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/User");
const FriendRequest = require("../models/FriendRequest");

const router = express.Router();

router.use(auth);

router.get("/", async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("friends");
    const friends = await User.find({ _id: { $in: user.friends } }).select(
      "_id name email",
    );
    return res.json(friends);
  } catch (error) {
    return next(error);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const email = (req.query.email || "").toString().toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email }).select("_id name email");
    if (!user || user._id.toString() === req.user._id.toString()) {
      return res.status(404).json({ message: "User not found" });
    }

    const me = await User.findById(req.user._id).select("friends");
    const isFriend = me.friends.some(
      (friendId) => friendId.toString() === user._id.toString(),
    );

    const pending = await FriendRequest.findOne({
      status: "pending",
      $or: [
        { requester: req.user._id, recipient: user._id },
        { requester: user._id, recipient: req.user._id },
      ],
    });

    return res.json({ user, isFriend, hasPendingRequest: !!pending });
  } catch (error) {
    return next(error);
  }
});

router.post("/request/:userId", async (req, res, next) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: "Cannot add yourself" });
    }

    const target = await User.findById(userId).select("_id name email");
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    const me = await User.findById(req.user._id).select("friends");
    const alreadyFriend = me.friends.some(
      (friendId) => friendId.toString() === target._id.toString(),
    );
    if (alreadyFriend) {
      return res.status(400).json({ message: "Already friends" });
    }

    const existing = await FriendRequest.findOne({
      status: "pending",
      $or: [
        { requester: req.user._id, recipient: target._id },
        { requester: target._id, recipient: req.user._id },
      ],
    });
    if (existing) {
      return res.status(400).json({ message: "Request already pending" });
    }

    const request = await FriendRequest.create({
      requester: req.user._id,
      recipient: target._id,
    });

    return res.json(request);
  } catch (error) {
    return next(error);
  }
});

router.get("/requests/pending", async (req, res, next) => {
  try {
    const requests = await FriendRequest.find({
      recipient: req.user._id,
      status: "pending",
    }).populate("requester", "_id name email");

    return res.json(requests);
  } catch (error) {
    return next(error);
  }
});

router.put("/request/:requestId/accept", async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    request.status = "accepted";
    await request.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { friends: request.requester },
    });
    await User.findByIdAndUpdate(request.requester, {
      $addToSet: { friends: request.recipient },
    });

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

router.put("/request/:requestId/reject", async (req, res, next) => {
  try {
    const { requestId } = req.params;
    const request = await FriendRequest.findById(requestId);
    if (!request || request.status !== "pending") {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    request.status = "rejected";
    await request.save();

    return res.json({ ok: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
