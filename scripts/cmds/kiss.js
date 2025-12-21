const fs = require("fs-extra");
const axios = require("axios");
const Canvas = require("canvas");
const path = require("path");

const ACCESS_TOKEN = "350685531728|62f8ce9f74b12f84c123cc23437a4a32"; // Facebook App token

module.exports = {
  config: {
    name: "kiss",
    aliases: ["kiss"],
    version: "2.2",
    author: "Efat fixed by xalman",
    countDown: 5,
    role: 0,
    shortDescription: "Kiss with custom image",
    longDescription: "Generate a kiss image using @mention, UID, or reply.",
    category: "funny",
    guide: "{pn} @mention / {pn} <UID> / reply with {pn}"
  },

  onStart: async function ({ api, message, event }) {
    let mentionedID;

    if (event.messageReply) {
      mentionedID = event.messageReply.senderID;
    }

    const mentionKeys = Object.keys(event.mentions);
    if (!mentionedID && mentionKeys.length > 0) {
      mentionedID = mentionKeys[0];
    }

    if (!mentionedID) {
      const parts = message.body.split(/\s+/);
      const uid = parts.find(p => /^\d+$/.test(p));
      if (uid) mentionedID = uid;
    }

    if (!mentionedID) return message.reply("Please mention someone, reply to a message, or provide a UID.");

    const senderID = event.senderID;

    try {

      const width = 512;
      const height = 512;
      const defaultAvatar = "https://i.postimg.cc/3x3QzSGq/default.png";

      const avatar1Url = `https://graph.facebook.com/${mentionedID}/picture?width=${width}&height=${height}&access_token=${ACCESS_TOKEN}`;
      const avatar2Url = `https://graph.facebook.com/${senderID}/picture?width=${width}&height=${height}&access_token=${ACCESS_TOKEN}`;


      let avatar1, avatar2;
      try { avatar1 = await Canvas.loadImage(avatar1Url); } catch { avatar1 = await Canvas.loadImage(defaultAvatar); }
      try { avatar2 = await Canvas.loadImage(avatar2Url); } catch { avatar2 = await Canvas.loadImage(defaultAvatar); }

      const bgUrl = "https://bit.ly/44bRRQG";
      const bgRes = await axios.get(bgUrl, { responseType: "arraybuffer" });
      const bg = await Canvas.loadImage(bgRes.data);

      const canvasWidth = 900;
      const canvasHeight = 600;
      const canvas = Canvas.createCanvas(canvasWidth, canvasHeight);
      const ctx = canvas.getContext("2d");

      ctx.drawImage(bg, 0, 0, canvasWidth, canvasHeight);

      const avatarSize = 230;
      const y = canvasHeight / 2 - avatarSize - 90; 

      ctx.save();
      ctx.beginPath();
      ctx.arc(150 + avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar1, 150, y, avatarSize, avatarSize);
      ctx.restore();

      ctx.save();
      ctx.beginPath();
      ctx.arc(canvasWidth - 150 - avatarSize / 2, y + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar2, canvasWidth - 150 - avatarSize, y, avatarSize, avatarSize);
      ctx.restore();

      const imgPath = path.join(__dirname, "tmp", `${senderID}_${mentionedID}_kiss.png`);
      await fs.ensureDir(path.dirname(imgPath));
      fs.writeFileSync(imgPath, canvas.toBuffer("image/png"));

      message.reply({
        body: "Kisssssss! 💋",
        attachment: fs.createReadStream(imgPath)
      }, () => fs.unlinkSync(imgPath));

    } catch (err) {
      console.error("Error in kiss command:", err);
      message.reply("There was an error creating the kiss image.");
    }
  }
};
