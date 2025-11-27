const { removeBan, isBanned } = require("database/ban-check");

module.exports = {
  config: {
    name: "unban",
    version: "1.0",
    author: "xalman",
    role: 2,
    shortDescription: "Unban a user",
    category: "system"
  },

  onStart: async function ({ api, event, args }) {
    const adminIds = global.GoatBot.config.ADMINBOT || [];
    const sender = event.senderID;

    if (!adminIds.includes(sender))
      return api.sendMessage("❌ শুধু admin এই command ব্যবহার করতে পারবে।", event.threadID);

    let target = null;
    if (event.type === "message_reply") target = event.messageReply.senderID;
    else if (args[0]) target = args[0];
    else return api.sendMessage("ব্যবহার: unban <uid>", event.threadID);

    if (!await isBanned(target))
      return api.sendMessage("⚠️ User banned না।", event.threadID);

    await removeBan(target);
    return api.sendMessage(`✅ সফলভাবে unbanned: ${target}`, event.threadID);
  }
};
