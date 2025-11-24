module.exports = {
  config: {
    name: "autoJoinVideo",
    version: "1.1",
    author: "xalman",
    eventType: ["log:subscribe"],  // ONLY this needed
  },

  onStart: () => {},

  onEvent: async function ({ event, api }) {
    try {
      const added = event.logMessageData?.addedParticipants;
      if (!added) return;

      // Get bot ID safely
      const botID = api.getCurrentUserID();

      // Check if the bot is added
      const isBotAdded = added.some(p => p.userFbId == botID);
      if (!isBotAdded) return;

      // Video URL
      const videoURL = "https://files.catbox.moe/8o4is6.mp4";

      api.sendMessage(
        {
          body: "🔥 Bot joined the group!",
          attachment: await global.utils.getStreamFromURL(videoURL)
        },
        event.threadID
      );

    } catch (e) {
      console.error("autoJoinVideo error:", e);
    }
  }
};
