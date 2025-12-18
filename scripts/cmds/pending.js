const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "pending",
    version: "2.1",
    author: "xalman",
    countDown: 5,
    role: 2,
    shortDescription: { en: "Manage pending group requests" },
    longDescription: { en: "Approve or refuse groups waiting for bot permission" },
    category: "owner"
  },

  langs: {
    en: {
      invalid: "❌ Invalid selection: %1",
      refused: "🚫 %1 group request refused",
      approved: "✅ %1 group successfully approved",
      fetchFail: "Unable to load pending groups",
      list: "🔔 PENDING GROUPS (%1)\n\n%2",
      empty: "✅ No pending groups found"
    }
  },

  onReply: async ({ api, event, Reply, getLang }) => {
    if (event.senderID != Reply.author) return;

    const input = event.body.trim();
    const { threadID, messageID } = event;
    const prefix = global.GoatBot?.config?.prefix || "/";
    let done = 0;

    const dateTime = moment().tz("Asia/Dhaka").format("ddd, YYYY-MMM-DD, HH:mm:ss");

    if (/^(c|cancel)/i.test(input)) {
      const nums = input.replace(/^(c|cancel)/i, "").trim().split(/\s+/);
      for (const n of nums) {
        if (!Number(n) || n < 1 || n > Reply.queue.length)
          return api.sendMessage(getLang("invalid", n), threadID, messageID);

        await api.removeUserFromGroup(
          api.getCurrentUserID(),
          Reply.queue[n - 1].threadID
        );

        api.sendMessage(
`╭─🚫 CANCELLED 🚫─╮
│ 🤖 Bot : Refused
│ 🔗 Prefix : ${prefix}
│ ⚡ Owner : xalman
│ ⏰ Date/Time : ${dateTime}
╰─❌ Access Denied─╯`,
          Reply.queue[n - 1].threadID
        );

        done++;
      }
      return api.sendMessage(getLang("refused", done), threadID, messageID);
    }
    
    const nums = input.split(/\s+/);
    for (const n of nums) {
      if (!Number(n) || n < 1 || n > Reply.queue.length)
        return api.sendMessage(getLang("invalid", n), threadID, messageID);

      api.sendMessage(
`╭─✨ SYSTEM GOAT ✨─╮
│ 🤖 Bot : Activated
│ 🔗 Prefix : ${prefix}
│ ⚡ Owner : xalman
│ ⏰ Date/Time : ${dateTime}
╰─✅ Access Granted─╯`,
        Reply.queue[n - 1].threadID
      );
      done++;
    }

    return api.sendMessage(getLang("approved", done), threadID, messageID);
  },

  onStart: async ({ api, event, getLang, commandName }) => {
    const { threadID, messageID, senderID } = event;
    let text = "";
    let i = 1;

    try {
      const other = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];

      const groups = [...other, ...pending].filter(
        t => t.isGroup && t.isSubscribed
      );

      if (!groups.length)
        return api.sendMessage(getLang("empty"), threadID, messageID);

      for (const g of groups)
        text += `${i++}. ${g.name} → ${g.threadID}\n`;

      api.sendMessage(
        getLang("list", groups.length, text),
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: senderID,
            queue: groups
          });
        },
        messageID
      );

    } catch (err) {
      return api.sendMessage(getLang("fetchFail"), threadID, messageID);
    }
  }
};│ ⚡ Owner : xalman
│ ⏰ Date/Time : ${dateTime}
╰─✅ Access Granted─╯`,
        Reply.queue[n - 1].threadID
      );
      done++;
    }

    return api.sendMessage(getLang("approved", done), threadID, messageID);
  },

  onStart: async ({ api, event, getLang, commandName }) => {
    const { threadID, messageID, senderID } = event;
    let text = "";
    let i = 1;

    try {
      const other = await api.getThreadList(100, null, ["OTHER"]) || [];
      const pending = await api.getThreadList(100, null, ["PENDING"]) || [];

      const groups = [...other, ...pending].filter(
        t => t.isGroup && t.isSubscribed
      );

      if (!groups.length)
        return api.sendMessage(getLang("empty"), threadID, messageID);

      for (const g of groups)
        text += `${i++}. ${g.name} → ${g.threadID}\n`;

      api.sendMessage(
        getLang("list", groups.length, text),
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            author: senderID,
            queue: groups
          });
        },
        messageID
      );

    } catch (err) {
      return api.sendMessage(getLang("fetchFail"), threadID, messageID);
    }
  }
};
