module.exports = {
  config: {
    name: "autoJoinVideo",
    version: "1.0",
    author: "xalman",
    category: "event",             // 🔥 MUST HAVE (Fixes your error)
    eventType: ["log:subscribe"],  // Event listener
  },

  onStart: () => {},

  onEvent: async function({ event, message }) {
    try {
      const added = event.logMessageData?.addedParticipants;
      if (!added) return;

      // Bot join detect
      const isBotAdded = added.some(p => p.userFbId == global.GoatBot.botID);
      if (!isBotAdded) return;

      // Video (MP4 link)
      const videoURL = "https://files.catbox.moe/8o4is6.mp4";

      await message.send({
        body: "",
        attachment: await global.utils.getStreamFromURL(videoURL)
      });

    } catch (e) {
      console.error("autoJoinVideo error:", e);
    }
  }
};
