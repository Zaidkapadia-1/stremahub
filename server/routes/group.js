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
const { requireAuth } = require("../middleware/auth");
const { client: redisClient } = require("../config/redis");
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

// 1. POST /group — requires registered & logged-in StreamHub user account
router.post("/", requireAuth, async (req, res) => {
  try {
    const createGroupSchema = z.object({
      name: z.string().trim().min(1, "Group name is required")
    });

    const parsed = createGroupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Please provide a valid group name." });
    }

    const { name } = parsed.data;
    const creatorName = req.user.name;

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
      userId: req.user._id,
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

// 2. POST /group/:code/join — requires registered & logged-in StreamHub user account
router.post("/:code/join", joinLimiter, requireAuth, async (req, res) => {
  try {
    const codeParam = req.params.code.trim().toUpperCase();
    const group = await Group.findOne({ inviteCode: codeParam });

    if (!group) {
      return res.status(404).json({ error: "Group not found. Check your invite code." });
    }

    // Check if user is already a member of this group
    let existingMember = await Member.findOne({ groupId: group._id, userId: req.user._id }).select("+sessionToken");
    if (existingMember) {
      return res.status(200).json({
        groupId: group._id,
        memberId: existingMember._id.toString(),
        role: existingMember.role,
        sessionToken: existingMember.sessionToken
      });
    }

    const member = await Member.create({
      groupId: group._id,
      userId: req.user._id,
      name: req.user.name,
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

// 6. POST /group/:groupId/leave — member or owner leaves
router.post("/:groupId/leave", requireMember, async (req, res) => {
  try {
    const { groupId } = req.params;
    const member = req.member;

    if (member.role === "owner") {
      const otherMembers = await Member.countDocuments({ groupId, _id: { $ne: member._id } });
      if (otherMembers > 0) {
        return res.status(400).json({
          error: "Transfer ownership before leaving this group.",
          requiresTransfer: true
        });
      }
      return res.status(400).json({
        error: "As the only member and owner, you must either keep the group or explicitly delete it.",
        canDelete: true
      });
    }

    await Member.findByIdAndDelete(member._id);
    recordActivity({
      groupId,
      actorId: member._id,
      actorName: member.name,
      type: "member_left",
      detail: "left the group"
    });

    return res.status(200).json({ success: true, message: "Left group successfully." });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /group/:groupId/leave:`, error);
    return res.status(500).json({ error: "Something went wrong. Try again." });
  }
});

// 7. POST /group/:groupId/transfer-ownership — owner transfers ownership to another member
router.post("/:groupId/transfer-ownership", requireRole(["owner"]), async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newOwnerMemberId } = req.body;

    if (!mongoose.isValidObjectId(newOwnerMemberId)) {
      return res.status(400).json({ error: "Invalid target member." });
    }

    const newOwner = await Member.findOne({ _id: newOwnerMemberId, groupId });
    if (!newOwner) {
      return res.status(404).json({ error: "Member not found in this group." });
    }

    newOwner.role = "owner";
    await newOwner.save();

    req.member.role = "admin";
    await req.member.save();

    recordActivity({
      groupId,
      actorId: req.member._id,
      actorName: req.member.name,
      type: "role_changed",
      detail: `transferred group ownership to ${newOwner.name}`
    });

    return res.status(200).json({
      success: true,
      message: `Ownership transferred to ${newOwner.name}.`,
      newRole: "admin"
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /group/:groupId/transfer-ownership:`, error);
    return res.status(500).json({ error: "Failed to transfer ownership." });
  }
});

// 8. DELETE /group/:groupId — owner-only explicit confirmed permanent deletion
router.delete("/:groupId", requireRole(["owner"]), async (req, res) => {
  try {
    const { groupId } = req.params;

    // Clean up Redis slot keys for all accounts in this group
    const accounts = await Account.find({ groupId });
    for (const acc of accounts) {
      for (let s = 1; s <= (acc.totalSlots || 20); s++) {
        try {
          await redisClient.del(`slot:${acc._id}:${s}`);
        } catch (e) {
          // ignore redis deletion errors
        }
      }
    }

    // Delete all MongoDB resources for this group
    await Promise.all([
      Group.findByIdAndDelete(groupId),
      Member.deleteMany({ groupId }),
      Account.deleteMany({ groupId }),
      Activity.deleteMany({ groupId }),
      Message.deleteMany({ groupId })
    ]);

    return res.status(200).json({ success: true, message: "Group and all associated data deleted permanently." });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in DELETE /group/:groupId:`, error);
    return res.status(500).json({ error: "Failed to delete group." });
  }
});

module.exports = router;
