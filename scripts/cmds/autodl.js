const axios = require("axios");
const fs = require("fs");
const path = require("path");

async function getBaseAPI() {
  const res = await axios.get(
    "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json"
  );
  return res.data.api;
}

async function downloadStream(url, savePath) {
  const res = await axios({
    url,
    method: "GET",
    responseType: "stream",
    headers: {
      "User-Agent": "Mozilla/5.0",
      "Accept": "*/*"
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
    version: "2.0.1",
    author: "Nazrul | modified by xalman",
    role: 0,
    description: "Auto download media from supported platforms",
    category: "media",
    guide: { en: "Send any supported media link" }
  },

  onStart: async () => {},

  onChat: async ({ api, event }) => {
    if (!event.body) return;

    const match = event.body.match(/https?:\/\/\S+/);
    if (!match) return;

    const inputUrl = match[0];

    try {
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      const baseApi = await getBaseAPI();
      const res = await axios.get(
        `${baseApi}/nazrul/alldlxx?url=${encodeURIComponent(inputUrl)}`
      );

      const data = res.data;
      if (!data || !data.url) throw new Error("Download link not found");

      const fileName = `auto_${Date.now()}.mp4`;
      const filePath = path.join(__dirname, fileName);

      await downloadStream(data.url, filePath);

      await api.sendMessage(
        {
          body:
`💎✨  𝗠𝗲𝗱𝗶𝗮 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿 ✨💎

📌 Title : ${data.t || "N/A"}
🚀 Platform : ${data.p || "Unknown"}
📥 Status : Download Completed

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
