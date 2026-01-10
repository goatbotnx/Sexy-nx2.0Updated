const axios = require('axios');

module.exports = {
  config: {
    name: "rbg",
    aliases: ["removebg"],
    version: "2.6.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    description: "Remove background from any image",
    category: "tools",
    guide: { en: "{p}rbg [reply to a photo]" }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      let imageUrl;
      if (event.type === "message_reply") {
        if (event.messageReply.attachments[0]?.type === "photo") {
          imageUrl = event.messageReply.attachments[0].url;
        }
      } else if (args[0]?.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif|png|jpeg)/g)) {
        imageUrl = args[0];
      }

      if (!imageUrl) return message.reply("⚠️ | Please reply to an image to remove background.");

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const configUrl = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";
      const apiList = await axios.get(configUrl);
      const baseUrl = apiList.data["rbg"]; 
      
      const rbgUrl = `${baseUrl}/rbg?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await axios.get(rbgUrl, { responseType: 'stream' });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      return message.reply({
        body: "✂️ 𝗕𝗮𝗰𝗸𝗴𝗿𝗼𝘂𝗻𝗱 𝗥𝗲𝗺𝗼𝘃𝗲𝗱 ✂️\n\n📁 Format: PNG (Transparent)\n👤 Author: xalman\n✅ Quality: Original",
        attachment: response.data
      });

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      return message.reply("❌ | Failed to remove background. Server is busy.");
    }
  }
};
