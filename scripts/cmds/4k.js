const axios = require('axios');

module.exports = {
  config: {
    name: "4k",
    aliases: ["upscale"],
    version: "3.0",
    author: "xalman",
    countDown: 10,
    role: 0,
    description: "Upscale images to 4K quality",
    category: "tools",
    guide: { en: "{p}upscale [reply to a photo]" }
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

      if (!imageUrl) return message.reply("⚠️ | Please reply to an image to upscale it.");

      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      const configUrl = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";
      const apiList = await axios.get(configUrl);
      const baseUrl = apiList.data["4k"]; 
      
      const upscaleUrl = `${baseUrl}/upscale?url=${encodeURIComponent(imageUrl)}`;
      
      const response = await axios.get(upscaleUrl, { responseType: 'stream', timeout: 300000 });

      api.setMessageReaction("✅", event.messageID, (err) => {}, true);

      return message.reply({
        body: "✨ 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹 ✨\n\n🖼️ Quality: 4K Ultra HD\n👤 Author: xalman\n💎 Status: Enhanced",
        attachment: response.data
      });

    } catch (error) {
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      return message.reply("❌ | Upscaling failed. The server might be offline or busy.");
    }
  }
};
