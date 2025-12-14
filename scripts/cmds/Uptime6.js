const os = require("os");

module.exports.config = {
  name: "uptime6",
  aliases: ["up6", "upt6", "status6", "bot6"],
  version: "2.0.0",
  author: "Jan + ChatGPT",
  role: 0,
  category: "system",
  guide: {
    en: "{pn} - Shows advanced bot stats with style"
  }
};

module.exports.onStart = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const start = Date.now();

  // Measure ping
  const tempMsg = await api.sendMessage("📡 Connecting to bot core...", threadID);
  const ping = Date.now() - start;

  // Uptime
  const uptimeSec = process.uptime();
  const d = Math.floor(uptimeSec / 86400);
  const h = Math.floor((uptimeSec % 86400) / 3600);
  const m = Math.floor((uptimeSec % 3600) / 60);
  const s = Math.floor(uptimeSec % 60);
  const uptime = `${d}d ${h}h ${m}m ${s}s`;

  // Memory
  const totalMem = os.totalmem() / 1024 / 1024; // MB
  const freeMem = os.freemem() / 1024 / 1024;
  const usedMem = totalMem - freeMem;

  // CPU
  const cpuLoad = os.loadavg()[0].toFixed(2); // 1-min average

  // Platform Info
  const platform = `${os.type()} ${os.arch()}`;
  const nodeVersion = process.version;

  const status = `
╭──────── ⌬ 𝗕𝗢𝗧 𝗦𝗧𝗔𝗧𝗨𝗦 ⌬ ────────╮
│ 🟢 𝗦𝘁𝗮𝘁𝘂𝘀: Online & Healthy
│ ⏱️ 𝗨𝗽𝘁𝗶𝗺𝗲: ${uptime}
│ ⚡ 𝗣𝗶𝗻𝗴: ${ping}ms
│ 💾 𝗠𝗲𝗺𝗼𝗿𝘆: ${usedMem.toFixed(1)}MB / ${totalMem.toFixed(1)}MB
│ 🖥️ 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱: ${cpuLoad} %
│ 🧠 𝗡𝗼𝗱𝗲JS: ${nodeVersion}
│ 🌐 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform}
╰──────────────────────────────╯

🌟 𝗕𝗼𝘁 𝗶𝘀 𝘄𝗼𝗿𝗸𝗶𝗻𝗴 𝘀𝗺𝗼𝗼𝘁𝗵 & 𝗳𝗮𝘀𝘁 ⚙️
`.trim();

  api.editMessage(status, tempMsg.messageID, threadID);
};
