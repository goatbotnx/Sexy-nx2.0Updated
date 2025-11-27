const { addBan, isBanned } = require("../../../database/ban-check");

module.exports = {
  config: {
    name: "ban",
    version: "1.0",
    author: "xalman",
    role: 2, // admin-level
    shortDescription: "Ban a user from using bot",
    category: "system"
  },

  onStart: async function ({ api, event, args }) {
    const adminIds = global.GoatBot.config.ADMINBOT || [];
    const sender = event.senderID;

    if (!adminIds.includes(sender))
      return api.sendMessage("❌ তুমি এই command ব্যবহার করতে পারবে না!", event.threadID, event.messageID);

    let target = null;
    if (event.type === "message_reply") target = event.messageReply.senderID;
    else if (args[0]) target = args[0];
    else return api.sendMessage("ব্যবহার: ban <uid> বা কারও মেসেজে reply করে ban", event.threadID);

    if (await isBanned(target))
      return api.sendMessage("⚠️ User আগে থেকেই banned!", event.threadID);

    const reason = args.slice(1).join(" ") || "No reason";
    await addBan(target, reason, sender);

    return api.sendMessage(`✅ সফলভাবে banned: ${target}`, event.threadID);
  }
};
