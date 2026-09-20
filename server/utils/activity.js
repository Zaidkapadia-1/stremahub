const Activity = require("../models/Activity");

const recordActivity = (activity) => Activity.create(activity).catch((error) => {
  console.error("Could not record activity:", error.message);
});

module.exports = { recordActivity };
