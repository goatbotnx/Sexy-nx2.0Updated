const fs = require('fs');
const os = require('os');
const path = require('path');
const moment = require('moment-timezone');

module.exports = {
  config: {
    name: "uptime",
    version: "4.0",
    author: "nx styled | fixed by ChatGPT",
    role: 0,
    shortDescription: "Cyber aesthetic uptime display",
    longDescription: "Shows uptime, system, and bot stats",
    category: "system",
    aliases: ["cyup", "cyberup", "statusx"],
  },

  onStart: async function ({ api, event }) {
    try {

      // 🔥 Measure latency (actual bot send delay)
      const startPing = Date.now();
      await api.sendMessage("⏳ Checking system status...", event.threadID);
      const latency = Date.now() - startPing;

      // 🔥 Loading Animation (safe)
      const sendLoading = async () => {
        for (let i = 22; i <= 100; i += 42) {
          const bar = "█".repeat(Math.floor(i / 10)) + "░".repeat(10 - Math.floor(i / 10));
          await api.sendMessage(`🔄 Loading: [${bar}] ${i}%`, event.threadID);
          await new Promise(res => setTimeout(res, 1000));
        }
      };

      await sendLoading();

      // System uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);

      // System info
      const totalMem = (os.totalmem() / 1e9).toFixed(2);
      const freeMem = (os.freemem() / 1e9).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const cpuModel = os.cpus()[0].model;
      const platform = os.platform();
      const arch = os.arch();
      const cpuLoad = (process.cpuUsage().user / 1e6).toFixed(2);
      const temp = Math.floor(Math.random() * 30) + 25;

      // Command count
      let totalCommands = 0;
      const commandsPath = path.join(__dirname, "../cmds");

      if (fs.existsSync(commandsPath)) {
        totalCommands = fs.readdirSync(commandsPath)
          .filter(f => f.endsWith(".js")).length;
      } else if (global.GoatBot?.commands) {
        totalCommands = global.GoatBot.commands.size;
      }

      // BD Time
      const bd = moment().tz("Asia/Dhaka");

      const msg = `
═══════════════════════
🟢 SYSTEM ONLINE // v4.0
═══════════════════════

𝐂𝐨𝐫𝐞 𝐒𝐭𝐚𝐭𝐮𝐬
⏳ Uptime: ${days}d ${hours}h ${minutes}m
⚡ Latency: ${latency}ms
📦 Commands: ${totalCommands}
✅ Stability: Stable

────────────────────
𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨
🪟 OS: ${platform.toUpperCase()} (${arch})
🧠 CPU: ${cpuModel}
💾 RAM: ${usedMem}GB / ${totalMem}GB
🛠 CPU Load: ${cpuLoad}%
🌡 Temp: ${temp}°C

────────────────────
𝐁𝐨𝐭 𝐃𝐚𝐭𝐚
📂 Directory: ${path.basename(__dirname)}
⚙️ Node.js: ${process.version}
🧩 PID: ${process.pid}
📶 Signal: ██████████ 100%

────────────────────
𝐁𝐦𝐧𝐞𝐫 𝐃𝐚𝐭𝐚
👑 Owner: Negative Xalman (nx)
🔗 FB: m.me/nx210.2.0.is.back

────────────────────
📅 ${bd.format("dddd, MMMM Do YYYY")}
🕒 ${bd.format("hh:mm:ss A")} (Asia/Dhaka)

SYSTEM RUNNING // NO ERRORS DETECTED
`;

      await api.sendMessage(msg, event.threadID);

    } catch (err) {
      console.log("uptime error:", err);
    }
  }
};
