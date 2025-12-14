const os = require("os");

module.exports.config = {
  name: "uptime8",
  aliases: ["up8", "upt8", "status8", "bot8", "stats8"],
  version: "2.5.0",
  author: "Jan + ChatGPT",
  role: 0,
  category: "system",
  guide: {
    en: "{pn} - Shows complete and enhanced bot/system status report"
  }
};

module.exports.onStart = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const start = Date.now();

  // Uptime
  const uptimeSec = process.uptime();
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = Math.floor(uptimeSec % 60);
  const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;

  // Memory
  const totalMem = os.totalmem() / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024;
  const usedMem = totalMem - freeMem;

  // CPU
  const cpuLoad = os.loadavg()[0].toFixed(2);

  // Platform
  const platform = `${os.type()} (${os.arch()})`;
  const nodeVersion = process.version;

  // Ping
  const tempMsg = await api.sendMessage("🔄 Fetching enhanced stats...", threadID);
  const ping = Date.now() - start;

  // 🧠 Fancy Uptime8 Display
  const message = `
╔═══════════════ 🧩 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 🧩 ═══════════════╗

🟢 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦: Alive & Running Smoothly
⏳ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
⚡ 𝗣𝗶𝗻𝗴: ${ping} ms
📦 𝗠𝗲𝗺𝗼𝗿𝘆 𝗨𝘀𝗲𝗱: ${usedMem.toFixed(1)}MB / ${totalMem.toFixed(1)}MB
🧠 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱 (1min avg): ${cpuLoad} %
🌐 𝗢𝗦: ${platform}
🧪 𝗘𝗻𝗴𝗶𝗻𝗲: Node.js ${nodeVersion}

╭────────── ⋆⋅☆⋅⋆ ──────────╮
┃ 🔐 𝗕𝗢𝗧 𝗖𝗢𝗥𝗘: Stable Mode (v2.5)
┃ 🛠️ 𝗠𝗮𝗱𝗲 𝗳𝗼𝗿: Legends like YOU!
┃ 🎮 𝗠𝗼𝗱𝗲: ✨ Full Power Mode
╰────────── ⋆⋅☆⋅⋆ ──────────╯

💡 𝗡𝗲𝘅𝘁 𝗚𝗲𝗻. 𝗔𝗜 𝗕𝗼𝘁 𝗥𝘂𝗻𝗻𝗶𝗻𝗴 𝗼𝗻 𝗦𝘁𝗲𝗮𝗺.

═══════════════════════════════
✨ Stay calm. Bot’s under control 😎
  `;

  api.editMessage(message.trim(), tempMsg.messageID, threadID);
};
