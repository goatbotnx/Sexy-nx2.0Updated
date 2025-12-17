const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function handlePFP({ event, message, args }) {
  try {
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
      body: "✨ 𝑯𝒆𝒓𝒆'𝒔 𝒚𝒐𝒖𝒓 𝒑𝒇𝒑 𝒊𝒎𝒂𝒈𝒆!🌬️",
      attachment: fs.createReadStream(imgPath)
    });

    fs.unlinkSync(imgPath);

  } catch (err) {
    console.error(err);
    message.reply("❌ 𝒇𝒂𝒊𝒍𝒆𝒅 𝒕𝒐 𝒍𝒐𝒂𝒅 𝒊𝒎𝒂𝒈𝒆😦.");
  }
}

module.exports = {
  config: {
    name: "pp",
    aliases: ["pfp"],
    version: "2.5",
    author: "xalman",
    role: 0,
    useprefix: false,
    shortDescription: { en: "Show profile picture" },
    category: "image"
  },

  onStart: async function ({ event, message, args }) {
    await handlePFP({ event, message, args });
  },

  onChat: async function ({ event, message, args }) {
    const body = event.body?.toLowerCase();
    if (!body) return;

    if (body.startsWith("pp") || body.startsWith("pfp")) {
      await handlePFP({ event, message, args });
    }
  }
};
