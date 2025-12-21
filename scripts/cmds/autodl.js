const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getBaseAPI() {
  const res = await axios.get(
    "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json"
  );
  return res.data.api;
}

function cleanTitle(title, url) {
  if (!title || title === "N/A") {
    try {
      const u = new URL(url);
      return `Video from ${u.hostname.replace("www.", "")}`;
    } catch {
      return "Downloaded Video";
    }
  }

  return title
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function downloadStream(url, savePath) {
  const res = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });

  return new Promise((resolve, reject) => {
    const writer = fs.createWriteStream(savePath);
    res.data.pipe(writer);
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

module.exports = {
  config: {
    name: "autodown",
    aliases: ["autodl"],
    version: "2.1.0",
    author: "Nazrul | modified by xalman",
    role: 0,
    description: "Auto download media with real video title",
    category: "media",
    guide: { en: "Send any supported media link" }
  },

  onStart: async () => {},

  onChat: async ({ api, event }) => {
    if (!event.body) return;

    const linkMatch = event.body.match(/https?:\/\/\S+/);
    if (!linkMatch) return;

    const inputUrl = linkMatch[0];

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const baseApi = await getBaseAPI();
      const res = await axios.get(
        `${baseApi}/nazrul/alldlxx?url=${encodeURIComponent(inputUrl)}`
      );

      const data = res.data;
      if (!data || !data.url) throw new Error("No media link");

      const videoTitle = cleanTitle(data.t, inputUrl);
      const platform = data.p || "Unknown";

      const filePath = path.join(
        __dirname,
        `auto_${Date.now()}.mp4`
      );

      await downloadStream(data.url, filePath);

      await api.sendMessage(
        {
          body:
`✨💎𝗠𝗲𝗱𝗶𝗮 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿💎✨

🎬 Title : ${videoTitle}
🌐 Platform : ${platform}
📥 Status : Successfully Downloaded

— Powered by xalman`,
          attachment: fs.createReadStream(filePath)
        },
        event.threadID
      );

      fs.unlinkSync(filePath);
      api.setMessageReaction("✅", event.messageID, () => {}, true);

    } catch (err) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      console.error("[AUTODOWN ERROR]", err.message);
    }
  }
};
