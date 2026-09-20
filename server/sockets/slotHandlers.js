const Account = require("../models/Account");
const Member = require("../models/Member");
const Message = require("../models/Message");
const { client } = require("../config/redis");
const { recordActivity } = require("../utils/activity");

const getAccountSlots = async (accountId, totalSlots) => Promise.all(
  Array.from({ length: totalSlots }, async (_, index) => {
    const slotNumber = index + 1;
    const rawData = await client.get(`slot:${accountId}:${slotNumber}`);
    return rawData ? { slotNumber, ...JSON.parse(rawData) } : { slotNumber, memberId: null, memberName: null };
  })
);

const emitAccountSlots = async (io, groupId, account) => {
  io.to(groupId).emit("slot_updated", {
    accountId: account._id.toString(), slots: await getAccountSlots(account._id, account.totalSlots)
  });
};

const setupSlotHandlers = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.sessionToken;
      const member = token && await Member.findOne({ sessionToken: token }).select("+sessionToken");
      if (!member) return next(new Error("Unauthorized socket connection"));
      socket.data.member = member;
      next();
    } catch (error) { next(error); }
  });

  io.on("connection", (socket) => {
    const member = socket.data.member;
    const groupId = member.groupId.toString();

    socket.on("join_group_room", async () => {
      try {
        socket.join(groupId);
        const accounts = await Account.find({ groupId });
        const slotState = await Promise.all(accounts.map(async (account) => ({
          accountId: account._id.toString(), slots: await getAccountSlots(account._id, account.totalSlots)
        })));
        socket.emit("slots_synced", slotState);
      } catch { socket.emit("error_event", { message: "Could not load current slots." }); }
    });

    socket.on("claim_slot", async (payload = {}) => {
      try {
        const account = await Account.findOne({ _id: payload.accountId, groupId });
        if (!account) return socket.emit("error_event", { message: "Account not found." });
        const currentSlots = await getAccountSlots(account._id, account.totalSlots);
        if (currentSlots.some((slot) => slot.memberId === member._id.toString())) {
          return socket.emit("error_event", { message: "You already have a slot on this account. Release it before claiming another." });
        }
        for (let slotNumber = 1; slotNumber <= account.totalSlots; slotNumber++) {
          const key = `slot:${account._id}:${slotNumber}`;
          const result = await client.set(key, JSON.stringify({ memberId: member._id.toString(), memberName: member.name }), { NX: true, EX: 7200 });
          if (result === "OK") {
            recordActivity({ groupId, actorId: member._id, actorName: member.name, type: "slot_claimed", detail: `claimed a ${account.serviceName} slot` });
            await emitAccountSlots(io, groupId, account);
            return;
          }
        }
        socket.emit("error_event", { message: "All slots are full." });
      } catch (error) {
        console.error("Error claiming slot:", error);
        socket.emit("error_event", { message: "Failed to claim slot. Try again." });
      }
    });

    socket.on("release_slot", async ({ accountId, slotNumber } = {}) => {
      try {
        const account = await Account.findOne({ _id: accountId, groupId });
        if (!account || !Number.isInteger(slotNumber) || slotNumber < 1 || slotNumber > account.totalSlots) return;
        const key = `slot:${account._id}:${slotNumber}`;
        const value = await client.get(key);
        if (!value || JSON.parse(value).memberId !== member._id.toString()) return socket.emit("error_event", { message: "You can only release your own slot." });
        await client.del(key);
        recordActivity({ groupId, actorId: member._id, actorName: member.name, type: "slot_released", detail: `released a ${account.serviceName} slot` });
        await emitAccountSlots(io, groupId, account);
      } catch { socket.emit("error_event", { message: "Failed to release slot. Try again." }); }
    });

    socket.on("nudge_slot", async ({ accountId, slotNumber } = {}) => {
      try {
        const account = await Account.findOne({ _id: accountId, groupId });
        if (!account) return;
        const key = `slot:${account._id}:${slotNumber}`;
        const value = await client.get(key);
        if (!value || JSON.parse(value).memberId === member._id.toString()) return;
        io.to(groupId).emit("ping_received", { accountId, slotNumber, requesterName: member.name });
        await client.expire(key, 120);
        recordActivity({ groupId, actorId: member._id, actorName: member.name, type: "slot_pinged", detail: `sent a reminder for a ${account.serviceName} slot` });
      } catch { socket.emit("error_event", { message: "Could not send that reminder." }); }
    });

    socket.on("chat_message", async ({ text } = {}) => {
      try {
        if (typeof text !== "string" || !text.trim() || text.trim().length > 500) return;
        const message = await Message.create({ groupId, senderId: member._id, senderName: member.name, text: text.trim() });
        io.to(groupId).emit("chat_message", { id: message._id.toString(), senderId: member._id.toString(), senderName: member.name, text: message.text, createdAt: message.createdAt });
      } catch { socket.emit("error_event", { message: "Message could not be sent." }); }
    });
  });
};

module.exports = setupSlotHandlers;