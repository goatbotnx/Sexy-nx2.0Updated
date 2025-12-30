const axios = require("axios");

module.exports = {
  config: {
    name: "coupledp",
    aliases: ["cdp"],
    version: "3.0",
    author: "xalman",
    description: " just type {p}cdp to get boy and girl pair profile picture🌬️",
    category: "love",
    cooldown: 5
  },

  onStart: async function ({ api, event }) {
    try {
      api.setMessageReaction("🕜", event.messageID, () => {}, true);

      api.sendTypingIndicator(event.threadID, true);
      await new Promise(r => setTimeout(r, 1000));

      const baseRes = await axios.get(
        "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"
      );

      const cdpBase = baseRes.data.cdp;
      if (!cdpBase) {
        api.sendTypingIndicator(event.threadID, false);
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const res = await axios.get(`${cdpBase}/cdp`);
      const pair = res.data.pair;

      if (!pair || !pair.boy || !pair.girl) {
        api.sendTypingIndicator(event.threadID, false);
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const boyStream = await global.utils.getStreamFromURL(pair.boy);
      const girlStream = await global.utils.getStreamFromURL(pair.girl);

      api.sendTypingIndicator(event.threadID, false);

      api.sendMessage(
        {
          body: "🎀Here's your coupledp bbz🌬️",
          attachment: [boyStream, girlStream]
        },
        event.threadID,
        () => {
          api.setMessageReaction("✅", event.messageID, () => {}, true);
        }
      );

    } catch (err) {
      console.error("CDP Error:", err);
      api.sendTypingIndicator(event.threadID, false);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
