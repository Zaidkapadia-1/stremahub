const { io } = require("socket.io-client");

const socket = io("http://localhost:5000");

const groupId = "6a9d4e2233e930e816e3e81d";
const accountId = "6a9d4e7333e930e816e3e820";

socket.on("connect", () => {
  console.log("Connected as", socket.id);

  socket.emit("join_group_room", { groupId });

socket.emit("claim_slot", {
  groupId,
  accountId,
  memberId: "6a9d4e5233e930e816e3e81f",
  memberName: "Aarav"
});
});

socket.on("slot_updated", (data) => {
  console.log("slot_updated received:", JSON.stringify(data, null, 2));
});

socket.on("error_event", (data) => {
  console.log("error_event received:", data);
});

socket.on("connect_error", (err) => {
  console.log("Connection failed:", err.message);
});

