const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ["owner", "admin", "member"],
    required: true
  },
  sessionToken: {
    type: String,
    required: true,
    unique: true,
    select: false
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Member", memberSchema);
