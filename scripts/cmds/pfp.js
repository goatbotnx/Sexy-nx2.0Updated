const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function handlePFP({ api, event, message, args }) {
  const { senderID, mentions, type, messageReply, messageID } = event;
  let userId;

  try {

    api.setMessageReaction("🕧", messageID, () => {}, true);

    if (mentions && Object.keys(mentions).length > 0) {
      userId = Object.keys(mentions)[0];
    }
    else if (type === "message_reply" && messageReply) {
      userId = messageReply.senderID;
    }
    else if (args[0] && /^\d+$/.test(args[0])) {
      userId = args[0];
    }
    else {
      userId = senderID;
    }

    const fbURL = `https://graph.facebook.com/${userId}/picture?width=512&height=512&access_token=350685531728|62f8ce9f74b12f84c123cc23437a4a32`;

    const res = await axios.get(fbURL, { responseType: "arraybuffer" });

    const imgPath = path.join(__dirname, `pfp_${userId}.png`);
    fs.writeFileSync(imgPath, res.data);

    await message.reply({
      body: "✨ Here's your profile picture!🌬️",
      attachment: fs.createReadStream(imgPath)
    });

    fs.unlinkSync(imgPath);

    api.setMessageReaction("✅", messageID, () => {}, true);

  } catch (err) {
    console.error(err);
    api.setMessageReaction("❌", messageID, () => {}, true);
    message.reply("");
  }
}

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp"],
    version: "2.8",
    author: "xalman",
    role: 0,
    shortDescription: { en: "Show profile picture" },
    category: "image"
  },

  onStart: async function ({ api, event, message, args }) {
    await handlePFP({ api, event, message, args });
  }
};
