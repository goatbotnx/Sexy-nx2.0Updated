const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp"],
    version: "2.2",
    author: "xalman",
    countDown: 5,
    useprefix: false,
    role: 0,
    shortDescription: { en: "Show profile picture" },
    description: { en: "Get your or mentioned user's profile picture" },
    category: "image",
    guide: { en: "{p}pp [mention or reply] to get profile picture" }
  },

  onStart: async function ({ event, message }) {
    try {
      const { senderID, mentions, type, messageReply } = event;

      const userId = (mentions && Object.keys(mentions).length > 0)
        ? Object.keys(mentions)[0]
        : (type === "message_reply" && messageReply ? messageReply.senderID : senderID);

      const fbURL = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

      const response = await axios.get(fbURL, { responseType: "arraybuffer" });

      const imagePath = path.join(__dirname, `profile_${userId}.png`);
      fs.writeFileSync(imagePath, response.data);

      await message.reply({
        body: "✨ 𝑯𝑒𝑟𝑒'𝑠 𝑦𝑜𝑢𝑟 𝑝𝑓𝑝 𝑖𝑚𝑎𝑔𝑒!🌬️",
        attachment: fs.createReadStream(imagePath)
      });

      fs.unlinkSync(imagePath);

    } catch (error) {
      console.error(error);
      message.reply("❌ 𝑓𝑎𝑖𝑙𝑒𝑑 𝑡𝑜 𝑙𝑜𝑎𝑑 𝑖𝑚𝑎𝑔𝑒.");
    }
  }
};
