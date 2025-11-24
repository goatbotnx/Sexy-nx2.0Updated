module.exports = {
  config: {
    name: "autoJoinVideo",
    version: "1.2",
    author: "xalman",
    eventType: ["log:subscribe"]   // SAME SYSTEM AS WELCOME EVENT
  },

  onStart: () => {},

  onEvent: async function ({ event, api, message }) {
    try {
      const added = event.logMessageData?.addedParticipants;
      if (!added) return;

      // Bot ID
      const botID = api.getCurrentUserID();

      // Check if bot was added
      const isBotAdded = added.some(p => p.userFbId == botID);
      if (!isBotAdded) return;

      // Video URL
      const videoURL = "https://files.catbox.moe/8o4is6.mp4";

      // Use same method as welcome event → message.send()
      return message.send({
        body: "",
        attachment: await global.utils.getStreamFromURL(videoURL)
      });

    } catch (e) {
      console.error("autoJoinVideo error:", e);
    }
  }
};
