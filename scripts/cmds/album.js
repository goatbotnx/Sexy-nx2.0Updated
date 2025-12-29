const axios = require("axios");
const fs = require("fs");
const path = require("path");

const apiJsonUrl = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json"; // GitHub raw link

const ADMIN_UID = "61583129938292";

module.exports = {
  config: {
    name: "album",
    aliases: ["gallery", "alb"],
    version: "3.0",
    author: "xalman",  //don't cng 
    role: 0,
    category: "media",
    shortDescription: "🌸 Exclusive Album",
    longDescription: "A premium & unique album experience",
    guide: "{p}album"
  },

  onStart: async function ({ message, event, args }) {
    let BASE_API;

    try {
      const apiListResponse = await axios.get(apiJsonUrl);
      const apiList = apiListResponse.data;
      BASE_API = apiList.album;
    } catch (err) {
      console.log(err);
      return message.reply("⚠️ Error fetching album API from GitHub");
    }

    const senderID = event.senderID;

    const page1 = ["funny", "sad", "attitude", "bike_car",  "anime", "romantic",  "kissing", "islamic", "love"];
    const page2 = ["aesthetic", "cartoon", "flower",  "freefire", "football", "cricket", "hot"];

    const fancy = (t) =>
      t.replace(/[a-z]/g, c =>
        String.fromCodePoint(0x1d400 + c.charCodeAt(0) - 97)
      );

    const numStyle = (n) =>
      String(n).replace(/[0-9]/g, d =>
        String.fromCodePoint(0x1d7ec + Number(d))
      );

    const buildMenu = (list, start) =>
      list
        .map(
          (v, i) =>
            `✦✨ ${numStyle(start + i)} ┊ ${fancy(v)}`
        )
        .join("\n");

    if (args[0] === "2") {
      const text =
`╔═══════ ✦ 𝐀𝐋𝐁𝐔𝐌 ✦ ═══════╗
${buildMenu(page2, 1)}
╚══════════════════════════╝
📖 Page 2 / 2
↩ Type: album`;

      return message.reply(text, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: "album",
          author: senderID,
          categories: page2
        });
      });
    }

    const text =
`╔═══════ ✦ 𝐀𝐋𝐁𝐔𝐌 ✦ ═══════╗
${buildMenu(page1, 1)}
╚══════════════════════════╝
📖 Page 1 / 2
➕ Type: album 2`;

    return message.reply(text, (err, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: "album",
        author: senderID,
        categories: page1
      });
    });
  },

  onReply: async function ({ message, event, Reply }) {
    if (event.senderID !== Reply.author)
      return message.reply("⛔ This menu is not for you");

    const pick = parseInt(event.body);
    if (isNaN(pick))
      return message.reply("🔢 Reply with number only");

    const list = Reply.categories;
    if (pick < 1 || pick > list.length)
      return message.reply("❌ Invalid choice");

    const category = list[pick - 1];

    if (category === "18plus" && event.senderID !== ADMIN_UID)
      return message.reply("তোরা কি ভালো হইবি না নাকি 👽");

    let BASE_API;
    try {
      const apiListResponse = await axios.get(apiJsonUrl);
      const apiList = apiListResponse.data;
      BASE_API = apiList.album;
    } catch (err) {
      console.log(err);
      return message.reply("⚠️ Error fetching album API from GitHub");
    }

    try {
      message.reply("please wait ✨");

      const res = await axios.get(
        `${BASE_API}/album?type=${category}`
      );

      const mediaUrl = res.data.data;
      if (!mediaUrl)
        return message.reply("❌ Album empty");

      const ext = mediaUrl.split(".").pop().split("?")[0];
      const filePath = path.join(
        __dirname,
        "cache",
        `album_${Date.now()}.${ext}`
      );

      const stream = await axios.get(mediaUrl, {
        responseType: "stream"
      });

      stream.data
        .pipe(fs.createWriteStream(filePath))
        .on("finish", () => {
          message.reply(
            {
              body:
`✦ 𝐀𝐋𝐁𝐔𝐌 𝐃𝐄𝐋𝐈𝐕𝐄𝐑𝐄𝐃 ✦
💖 Category : ${category}
👑 Owner : XALMAN`,
              attachment: fs.createReadStream(filePath)
            },
            () => fs.unlinkSync(filePath)
          );
        });

    } catch (err) {
      console.log(err);
      message.reply("⚠️ Album api error");
    }
  }
};
