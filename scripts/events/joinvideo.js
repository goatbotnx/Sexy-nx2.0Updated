module.exports = {
  config: {
    name: "autoJoinVideo",
    eventType: ["log:subscribe"],
  },

  onStart: () => {},

  onEvent: async function({ event, message }) {
    // Bot join detect
    try {
      const added = event.logMessageData.addedParticipants;
      if (!added) return;

      // Check bot join
      const isBotAdded = added.some(p => p.userFbId == global.GoatBot.botID);
      if (!isBotAdded) return;

      // Video URL (public direct MP4 link)
      const videoURL = "https://files.catbox.moe/8o4is6.mp4";

      await message.send({
        body: "",
        attachment: await global.utils.getStreamFromURL(videoURL)
      });
    }
    catch (e) {
      console.error(e);
    }
  }
};
