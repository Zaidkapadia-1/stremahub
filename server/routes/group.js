const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { z } = require("zod");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const Group = require("../models/Group");
const Member = require("../models/Member");
const Account = require("../models/Account");
const Message = require("../models/Message");
const { requireRole, requireMember } = require("../middleware/checkRole");
const Activity = require("../models/Activity");
const { recordActivity } = require("../utils/activity");

const createSessionToken = () => crypto.randomBytes(32).toString("hex");

const joinLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return res.status(429).json({ error: "Too many attempts. Please wait a moment and try again." });
  }
});

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// 1. POST /group — body: {name, creatorName}
router.post("/", async (req, res) => {
  try {
    const createGroupSchema = z.object({
      name: z.string().trim().min(1),
      creatorName: z.string().trim().min(1)
    });

    const parsed = createGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    const { name, creatorName } = parsed.data;

    let inviteCode = generateInviteCode();
    let existingGroup = await Group.findOne({ inviteCode });
    while (existingGroup) {
      inviteCode = generateInviteCode();
      existingGroup = await Group.findOne({ inviteCode });
    }

    const group = await Group.create({
      name,
      inviteCode
    });

    const member = await Member.create({
      groupId: group._id,
      name: creatorName,
      role: "owner",
      sessionToken: createSessionToken()
    });
    recordActivity({ groupId: group._id, actorId: member._id, actorName: member.name, type: "group_created", detail: `created ${group.name}` });

    return res.status(201).json({
      groupId: group._id,
      inviteCode: group.inviteCode,
      memberId: member._id.toString(),
      sessionToken: member.sessionToken
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /group:`, error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// 2. POST /group/:code/join — body: {name}
router.post("/:code/join", joinLimiter, async (req, res) => {
  try {
    const joinSchema = z.object({
      name: z.string().trim().min(1)
    });

    const parsed = joinSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Please fill in all fields." });
    }

    const codeParam = req.params.code.trim().toUpperCase();
    const group = await Group.findOne({ inviteCode: codeParam });

    if (!group) {
      return res.status(404).json({ error: "Group not found. Check your invite code." });
    }

    const member = await Member.create({
      groupId: group._id,
      name: parsed.data.name,
      role: "member",
      sessionToken: createSessionToken()
    });
    recordActivity({ groupId: group._id, actorId: member._id, actorName: member.name, type: "member_joined", detail: "joined the group" });

    return res.status(200).json({
      groupId: group._id,
      memberId: member._id.toString(),
      role: member.role,
      sessionToken: member.sessionToken
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /group/:code/join:`, error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// 3. GET /group/:groupId
router.get("/:groupId", requireMember, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(404).json({ error: "Group not found." });
    }

    const [group, members, accounts] = await Promise.all([
      Group.findById(groupId),
      Member.find({ groupId }),
      Account.find({ groupId })
    ]);

    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    return res.status(200).json({
      group,
      members,
      accounts
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /group/:groupId:`, error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// 4. POST /group/:groupId/account — protected by requireRole(['owner','admin'])
router.post("/:groupId/account", requireRole(["owner", "admin"]), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { serviceName, totalSlots } = req.body;

    if (!mongoose.isValidObjectId(groupId)) {
      return res.status(404).json({ error: "Group not found." });
    }

    const accountSchema = z.object({
      serviceName: z.string().trim().min(1),
      totalSlots: z.coerce.number().int().positive()
    });

    const parsed = accountSchema.safeParse({ serviceName, totalSlots });
    if (!parsed.success) {
      return res.status(400).json({ error: "Please provide a valid service name and slot count." });
    }

    const account = await Account.create({
      groupId,
      serviceName: parsed.data.serviceName,
      totalSlots: parsed.data.totalSlots,
      addedBy: req.member._id
    });
    recordActivity({ groupId, actorId: req.member._id, actorName: req.member.name, type: "account_added", detail: `added ${account.serviceName}` });

    return res.status(201).json({ accountId: account._id });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /group/:groupId/account:`, error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

router.get("/:groupId/activity", requireMember, async (req, res) => {
  try {
    const activities = await Activity.find({ groupId: req.params.groupId }).sort({ createdAt: -1 }).limit(50).lean();
    return res.json({ activities });
  } catch (error) {
    return res.status(500).json({ error: "Could not load activity." });
  }
});

// 5. PATCH /group/:groupId/member/:memberId/role — protected by requireRole(['owner'])
router.patch("/:groupId/member/:memberId/role", requireRole(["owner"]), async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const { newRole } = req.body;

    if (!mongoose.isValidObjectId(groupId) || !mongoose.isValidObjectId(memberId)) {
      return res.status(404).json({ error: "Member not found." });
    }

    const roleSchema = z.object({
      newRole: z.enum(["admin", "member"])
    });

    const parsed = roleSchema.safeParse({ newRole });
    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid role specified." });
    }

    const updatedMember = await Member.findOneAndUpdate(
      { _id: memberId, groupId },
      { role: parsed.data.newRole },
      { new: true }
    );

    if (!updatedMember) {
      return res.status(404).json({ error: "Member not found." });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in PATCH /group/:groupId/member/:memberId/role:`, error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// Last 100 messages, visible only to a current group member.
router.get("/:groupId/messages", requireMember, async (req, res) => {
  try {
    const messages = await Message.find({ groupId: req.params.groupId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return res.json({ messages: messages.reverse().map((message) => ({ ...message, id: message._id.toString() })) });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET messages:`, error);
    return res.status(500).json({ error: "Could not load messages. Try again." });
  }
});

module.exports = router;
