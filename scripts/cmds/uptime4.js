const os = require("os");

module.exports.config = {
  name: "uptime4",
  aliases: ["up4", "upt4"],
  version: "2.5.1",
  author: "Jan+fixed by xalman",
  role: 0,
  category: "system",
  guide: {
    en: "{pn} - Enhanced bot & system status report"
  }
};

module.exports.onStart = async function ({ api, event }) {
  const { threadID } = event;
  const start = Date.now();
  const tempMsg = await api.sendMessage("🔄 Fetching enhanced stats...", threadID);
  const ping = Date.now() - start;
  
  const uptimeSec = Math.floor(process.uptime());
  const days = Math.floor(uptimeSec / 86400);
  const hours = Math.floor((uptimeSec % 86400) / 3600);
  const minutes = Math.floor((uptimeSec % 3600) / 60);
  const seconds = uptimeSec % 60;
  const uptime = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  const totalMem = os.totalmem() / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024;
  const usedMem = totalMem - freeMem;
  const cpuLoad = os.loadavg
    ? os.loadavg()[0].toFixed(2)
    : "N/A";

  const platform = `${os.type()} (${os.arch()})`;
  const nodeVersion = process.version;

  const message = `
╔════════════ 🧩 𝗨𝗣𝗧𝗜𝗠𝗘 𝗥𝗘𝗣𝗢𝗥𝗧 🧩 ════════════╗

🟢 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦: Online & Stable
⏳ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
⚡ 𝗣𝗶𝗻𝗴: ${ping} ms
📦 𝗠𝗲𝗺𝗼𝗿𝘆: ${usedMem.toFixed(1)}MB / ${totalMem.toFixed(1)}MB
🧠 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱 (1m avg): ${cpuLoad}
🌐 𝗢𝗦: ${platform}
🧪 𝗘𝗻𝗴𝗶𝗻𝗲: Node.js ${nodeVersion}

╭────────── ⋆⋅☆⋅⋆ ──────────╮
┃ 🔐 𝗕𝗢𝗧 𝗖𝗢𝗥𝗘: Stable Mode
┃ 🛠️ 𝗕𝘂𝗶𝗹𝗱: GoatBot v2 💖
┃ 🎮 𝗦𝘁𝗮𝘁𝘂𝘀: Full Power ⚡
╰────────── ⋆⋅☆⋅⋆ ──────────╯

✨ Stay claim — everything is running smoothly 
══════════════════════════════════════════
`.trim();

  try {
    await api.editMessage(message, tempMsg.messageID, threadID);
  } catch (err) {
    await api.sendMessage(message, threadID);
  }
};
