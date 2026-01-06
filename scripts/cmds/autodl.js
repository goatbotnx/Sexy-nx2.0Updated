const axios = require('axios');

module.exports = {
  config: {
    name: "alldl",
    version: "7.5.0",
    author: "xalman",
    countDown: 3,
    role: 0,
    shortDescription: "Ultra Fast Auto Video Downloader",
    longDescription: "Download videos using dynamic GitHub API link.",
    category: "media",
    guide: "{pn} <link> or just send the link"
  },

  onStart: async function ({ api, event, args, message }) {
    const url = args[0];
    if (!url) return message.reply("⚠️ দয়া করে একটি ভিডিও লিঙ্ক দিন!");
    return await this.handleDownload(url, api, event, message);
  },

  onChat: async function ({ api, event, message }) {
    const { body, senderID } = event;
    if (!body || senderID === api.getCurrentUserID()) return;

    const linkRegEx = /(https?:\/\/[^\s]+)/g;
    const match = body.match(linkRegEx);

    if (match) {
      const url = match[0];
      const sites = ["tiktok.com", "facebook.com", "fb.watch", "instagram.com", "reels", "youtube.com", "youtu.be", "pinterest.com", "pin.it", "twitter.com", "x.com", "capcut.com"];
      
      if (sites.some(s => url.includes(s))) {
        return await this.handleDownload(url, api, event, message);
      }
    }
  },

  handleDownload: async function (url, api, event, message) {
    const { messageID } = event;
    const start = Date.now();

    try {
      if (api.setMessageReaction) api.setMessageReaction("⌛", messageID, () => {}, true);

      const configRes = await axios.get("https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json");
      const apiUrl = configRes.data.autodl;
      const res = await axios.get(`${apiUrl}/download?url=${encodeURIComponent(url)}`);

      if (res.data && res.data.success && res.data.data.video_url) {
        const { video_url, title, source, quality } = res.data.data;

        const stream = await axios.get(video_url, { responseType: 'stream' });
        const time = ((Date.now() - start) / 1000).toFixed(2);

        const xalmanBody = 
          `『 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥 』\n` +
          `━━━━━━━━━━━━━━━━━━\n` +
          `📝 𝗧𝗶𝘁𝗹𝗲: ${title || "No Title"}\n` +
          `🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${source.toUpperCase()}\n` +
          `🎬 𝗤𝘂𝗮𝗹𝗶𝘁𝘆: higher resolution\n` +
          `⏱️ 𝗧𝗶𝗺𝗲: ${time}s\n` +
          `👤 𝗔𝘂𝘁𝗵𝗼𝗿: xalman\n` +
          `━━━━━━━━━━━━━━━━━━`;

        await message.reply({
          body: xalmanBody,
          attachment: stream.data
        });

        if (api.setMessageReaction) api.setMessageReaction("✅", messageID, () => {}, true);
      }
    } catch (e) {
      console.error("Ultra DL Error:", e.message);
      if (api.setMessageReaction) api.setMessageReaction("❌", messageID, () => {}, true);
    }
  }
};
