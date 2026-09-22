const mongoose = require("mongoose");
const Member = require("../models/Member");

const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("./auth");

const getSessionMember = async (req, groupId) => {
  if (!mongoose.isValidObjectId(groupId)) return null;

  // 1. Try x-session-token
  const token = req.get("x-session-token");
  if (token) {
    const member = await Member.findOne({ groupId, sessionToken: token }).select("+sessionToken");
    if (member) return member;
  }

  // 2. Try JWT auth token
  let authToken = req.headers["x-auth-token"] || req.headers.authorization;
  if (authToken && authToken.startsWith("Bearer ")) {
    authToken = authToken.slice(7).trim();
  }
  if (authToken) {
    try {
      const decoded = jwt.verify(authToken, JWT_SECRET);
      if (decoded?.id) {
        const member = await Member.findOne({ groupId, userId: decoded.id });
        if (member) return member;
      }
    } catch {
      // ignore invalid token here
    }
  }

  return null;
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
