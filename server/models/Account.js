const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true
  },
  serviceName: {
    type: String,
    required: true,
    trim: true
  },
  totalSlots: {
    type: Number,
    required: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  }
});

module.exports = mongoose.model("Account", accountSchema);
