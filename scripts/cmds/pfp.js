const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp"],
    version: "2.0",
    author: "xalman",
    role: 0,
    useprefix: false,
    shortDescription: { en: "Show profile picture without prefix" },
    category: "image"
  },

  onChat: async function ({ event, message, args }) {
    try {
      const body = event.body?.toLowerCase();
      if (!body || (!body.startsWith("pp") && !body.startsWith("pfp"))) return;

      const { senderID, mentions, type, messageReply } = event;
      let userId;


      if (mentions && Object.keys(mentions).length > 0) {
        userId = Object.keys(mentions)[0];
      }

      else if (type === "message_reply" && messageReply) {
        userId = messageReply.senderID;
      }

      else if (args[1] && /^\d+$/.test(args[1])) {
        userId = args[1];
      }
      
      else {
        userId = senderID;
      }

      const fbURL = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

      const res = await axios.get(fbURL, { responseType: "arraybuffer" });

      const imgPath = path.join(__dirname, `pfp_${userId}.png`);
      fs.writeFileSync(imgPath, res.data);

      await message.reply({
        body: "✨ 𝑯𝑒𝑟𝑒'𝑠 𝑦𝑜𝑢𝑟 𝑝𝑓𝑝 𝑖𝑚𝑎𝑔𝑒!🌬️",
        attachment: fs.createReadStream(imgPath)
      });

      fs.unlinkSync(imgPath);

    } catch (e) {
      console.error(e);
      message.reply("❌ 𝑓𝑎𝑖𝑙𝑒𝑑 𝑡𝑜 𝑙𝑜𝑎𝑑 𝑖𝑚𝑎𝑔𝑒.");
    }
  }
};
