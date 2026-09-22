const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");

const mongoose = require("mongoose");
const User = require("../models/User");
const Member = require("../models/Member");
const Group = require("../models/Group");
const Account = require("../models/Account");
const Activity = require("../models/Activity");
const { requireAuth, JWT_SECRET } = require("../middleware/auth");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
};

// POST /auth/register — body: { name, email, password }
router.post("/register", async (req, res) => {
  try {
    const registerSchema = z.object({
      name: z.string().trim().min(1, "Name is required"),
      email: z.string().trim().email("Please enter a valid email address"),
      password: z.string().min(6, "Password must be at least 6 characters")
    });

    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Invalid registration data.";
      return res.status(400).json({ error: errorMsg });
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: "An account with that email already exists. Please log in." });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: normalizedEmail,
      passwordHash
    });

    const token = generateToken(user);

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /auth/register:`, error);
    return res.status(500).json({ error: "Failed to create account. Please try again." });
  }
});

// POST /auth/login — body: { email, password }
router.post("/login", async (req, res) => {
  try {
    const loginSchema = z.object({
      email: z.string().trim().email("Please enter a valid email address"),
      password: z.string().min(1, "Password is required")
    });

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const errorMsg = parsed.error.issues[0]?.message || "Please provide email and password.";
      return res.status(400).json({ error: errorMsg });
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select("+passwordHash");
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = generateToken(user);

    return res.status(200).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /auth/login:`, error);
    return res.status(500).json({ error: "Failed to log in. Please try again." });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

// GET /auth/me — returns current authenticated user
router.get("/me", requireAuth, async (req, res) => {
  return res.status(200).json({
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
});

// GET /auth/groups — returns safe metadata for groups belonging to authenticated user
router.get("/groups", requireAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all memberships for this user (safe metadata only, no sessionToken)
    const memberships = await Member.find({ userId }).populate("groupId").lean();

    const groupsData = await Promise.all(
      memberships
        .filter((m) => m.groupId) // filter out if group was permanently deleted
        .map(async (m) => {
          const group = m.groupId;
          const [memberCount, accountCount, latestActivity] = await Promise.all([
            Member.countDocuments({ groupId: group._id }),
            Account.countDocuments({ groupId: group._id }),
            Activity.findOne({ groupId: group._id }).sort({ createdAt: -1 }).lean()
          ]);

          return {
            groupId: group._id.toString(),
            groupName: group.name,
            inviteCode: group.inviteCode,
            role: m.role,
            memberId: m._id.toString(),
            memberCount,
            accountCount,
            lastActivity: latestActivity ? latestActivity.createdAt : group.createdAt,
            createdAt: group.createdAt
          };
        })
    );

    return res.status(200).json({ groups: groupsData });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in GET /auth/groups:`, error);
    return res.status(500).json({ error: "Failed to load user groups." });
  }
});

// POST /auth/groups/:groupId/session — returns active group session info only for the specified group
router.post("/groups/:groupId/session", requireAuth, async (req, res) => {
  try {
    const { groupId } = req.params;

    if (!groupId || !mongoose.isValidObjectId(groupId)) {
      return res.status(404).json({ error: "Group not found." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: "Group not found." });
    }

    const member = await Member.findOne({ groupId, userId: req.user._id }).select("+sessionToken");
    if (!member) {
      return res.status(403).json({ error: "You are not a member of this group." });
    }

    return res.status(200).json({
      groupId: group._id.toString(),
      groupName: group.name,
      inviteCode: group.inviteCode,
      role: member.role,
      memberId: member._id.toString(),
      sessionToken: member.sessionToken,
      name: member.name
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in POST /auth/groups/:groupId/session:`, error);
    return res.status(500).json({ error: "Failed to open group session." });
  }
});

module.exports = router;
