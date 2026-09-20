const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Member", required: true },
  senderName: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true, maxlength: 500 }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);
