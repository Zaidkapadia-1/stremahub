const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: "Member" },
  actorName: { type: String, required: true, trim: true },
  type: { type: String, required: true, enum: ["group_created", "member_joined", "member_left", "role_changed", "account_added", "slot_claimed", "slot_released", "slot_pinged"] },
  detail: { type: String, required: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Activity", activitySchema);
