const axios = require("axios");

module.exports = {
  config: {
    name: "coupledp",
    aliases: ["cdp"],
    version: "3.1",
    author: "xalman",
    description: "Just type {p}cdp to get boy and girl pair profile picture🌬️",
    category: "love",
    cooldown: 5
  },

  onStart: async function ({ api, event, args }) {
    try {
      api.setMessageReaction("🕜", event.messageID, () => {}, true);
      api.sendTypingIndicator(event.threadID, true);

      const baseRes = await axios.get(
        "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"
      );

      const cdpBase = baseRes.data.cdp;
      if (!cdpBase) {
        api.sendTypingIndicator(event.threadID, false);
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      if (args[0] && args[0].toLowerCase() === "list") {
        const res = await axios.get(`${cdpBase}/status`);
        const { total } = res.data;
        api.sendTypingIndicator(event.threadID, false);
        return api.sendMessage(`🎀 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏: ${total}`, event.threadID);
      }

      const res = await axios.get(`${cdpBase}/cdp`);
      const pair = res.data.pair;

      if (!pair || !pair.boy || !pair.girl) {
        api.sendTypingIndicator(event.threadID, false);
        return api.setMessageReaction("❌", event.messageID, () => {}, true);
      }

      const getImgStream = async (url) => {
        return (await axios.get(url, {
          responseType: "stream",
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            'Referer': 'https://imgur.com/'
          }
        })).data;
      };

      const boyStream = await getImgStream(pair.boy);
      const girlStream = await getImgStream(pair.girl);

      api.sendTypingIndicator(event.threadID, false);

      api.sendMessage(
        {
          body: "🎀 Here's your couple dp bbz 🌬️",
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
