const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.0",
    author: "Saimx69x",
    role: 0,
    usePrefix: true,
    shortDescription: {
      en: "Check bot uptime with ping and image"
    },
    longDescription: {
      en: "Display how long the bot is running along with ping time and a custom image"
    },
    category: "system",
    guide: {
      en: "{pn} → check bot uptime with ping"
    }
  },

  onStart() {
    console.log("✅ Uptime command loaded.");
  },

  onChat: async function ({ event, message, args, commandName }) {
    const prefix = global.GoatBot.config.prefix || "/";
    const body = event.body?.trim() || "";
    if (!body.startsWith(prefix + commandName) && !this.config.aliases.some(a => body.startsWith(prefix + a))) return;

    const imagePath = path.join(__dirname, "uptime_image.png");

    try {
      const pingMsg = await message.reply("⚡ Checking ping...");
      const start = Date.now();
      await new Promise(res => setTimeout(res, 100));
      const ping = Date.now() - start;

      const uptime = Math.floor(process.uptime()); // in seconds
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = uptime % 60;
      const upTimeStr = `${days}d ${hours}h ${minutes}m ${seconds}s`;

      const canvas = createCanvas(1000, 500);
      const ctx = canvas.getContext("2d");

      const bgUrl = "https://i.postimg.cc/ZRjqJF69/Screenshot-20251128-075006.png";
      const background = await loadImage(bgUrl);
      ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 45px Arial";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(0,0,0,0.7)";
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.shadowBlur = 4;

      ctx.fillText("🤖 BOT UPTIME", 60, 100);
      ctx.fillText(`⏳ ${upTimeStr}`, 60, 200);
      ctx.fillText(`⚡ Ping: ${ping}ms`, 60, 280);
      ctx.fillText(`👤 Owner: Màybè Nx`, 60, 360);

      const buffer = canvas.toBuffer("image/png");
      fs.writeFileSync(imagePath, buffer);

      await message.unsend(pingMsg.messageID);

      await message.reply({
        body: `
━━━━━━━━━━━━━━
𝐁𝐎𝐓 𝐒𝐓𝐀𝐓𝐔𝐒 ✅
╭─╼━━━━ ━━━━╾─╮
│ 💤 Uptime : ${upTimeStr}
│ ⚡ Ping   : ${ping}ms
│ 👑 Owner  :Màybè Mx
╰─━━━━━ ━━━━╾─╯
━━━━━━━━━━━━━━
        `,
        attachment: fs.createReadStream(imagePath)
      });

    } catch (err) {
      console.error("❌ Error in uptime command:", err);
      await message.reply(
        "⚠️ Failed to generate uptime."
      );
    } finally {
      
      if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
    }
  }
};
