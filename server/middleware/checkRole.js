const mongoose = require("mongoose");
const Member = require("../models/Member");

const getSessionMember = async (req, groupId) => {
  const token = req.get("x-session-token");
  if (!token || !mongoose.isValidObjectId(groupId)) return null;
  return Member.findOne({ groupId, sessionToken: token }).select("+sessionToken");
};

const requireMember = async (req, res, next) => {
  try {
    const member = await getSessionMember(req, req.params.groupId);
    if (!member) return res.status(401).json({ error: "Your session is not valid for this group." });
    req.member = member;
    next();
  } catch (error) {
    next(error);
  }
};

const requireRole = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const groupId = req.body?.groupId || req.params?.groupId;

      if (!groupId || !mongoose.isValidObjectId(groupId)) {
        return res.status(403).json({ error: "You don't have permission to do this." });
      }

      const member = await getSessionMember(req, groupId);

      if (!member || !allowedRoles.includes(member.role)) {
        return res.status(403).json({ error: "You don't have permission to do this." });
      }

      req.member = member;
      next();
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error in requireRole middleware:`, error);
      return res.status(500).json({ error: "Something went wrong. Try again." });
    }
  };
};

module.exports = {
  requireRole,
  requireMember
};
