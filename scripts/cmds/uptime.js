const os = require("os");

module.exports.config = {
  name: "uptime",
  aliases: ["up", "upt"],
  version: "3.0.1",
  author: "Mahin fixed by xalman",
  role: 0,
  category: "system",
  guide: {
    en: "{pn} - Stylized bot uptime & system monitor"
  }
};

module.exports.onStart = async function ({ api, event }) {
  const { threadID } = event;

  // ───── Ping Test ─────
  const start = Date.now();
  const tempMsg = await api.sendMessage("🔍 Booting core diagnostics...", threadID);
  const ping = Date.now() - start;

  // ───── Uptime ─────
  const uptimeSec = Math.floor(process.uptime());
  const d = Math.floor(uptimeSec / 86400);
  const h = Math.floor((uptimeSec % 86400) / 3600);
  const m = Math.floor((uptimeSec % 3600) / 60);
  const s = uptimeSec % 60;

  // ───── CPU & Memory ─────
  const cpuLoad = os.loadavg ? os.loadavg()[0].toFixed(2) : "N/A";

  const totalMem = os.totalmem() / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024;
  const usedMem = totalMem - freeMem;
  const memRatio = usedMem / totalMem;

  // ───── Mood ─────
  const loadMood =
    memRatio < 0.5 ? "🧘 Chill" :
    memRatio < 0.8 ? "⚠️ Alert" :
    "🔥 Overload";

  // ───── Ping Status ─────
  const pingBar =
    ping < 100 ? "📶 FAST" :
    ping < 250 ? "📶 MEDIUM" :
    "📶 SLOW";

  // ───── Energy Bar ─────
  const bars = 5;
  const filled = Math.round((1 - memRatio) * bars);
  const energyBar = "🔋".repeat(filled) + "❌".repeat(bars - filled);

  // ───── System Info ─────
  const nodeVersion = process.version;
  const platform = `${os.type()} (${os.arch()})`;

  const message = `
╔═━━━◥◣📊 𝗨𝗣𝗧𝗜𝗠𝗘 𝗦𝗧𝗔𝗧𝗨𝗦 ◢◤━━━═╗

🕒 𝗨𝗽𝘁𝗶𝗺𝗲: ${d}d ${h}h ${m}m ${s}s
📡 𝗣𝗶𝗻𝗴: ${ping}ms → ${pingBar}
🧠 𝗠𝗼𝗼𝗱: ${loadMood}
🔁 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱: ${cpuLoad}
💾 𝗠𝗲𝗺𝗼𝗿𝘆: ${usedMem.toFixed(1)}MB / ${totalMem.toFixed(1)}MB
⚙️ 𝗘𝗻𝗴𝗶𝗻𝗲: Node.js ${nodeVersion}
🌍 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform}

📶 𝗕𝗼𝘁 𝗘𝗻𝗲𝗿𝗴𝘆: ${energyBar}

╔═━━━━━🔒 𝗘𝗡𝗚𝗜𝗡𝗘 𝗖𝗢𝗥𝗘 ━━━━━═╗
┃ Powered by ⚡ Goat Bot Engine
┃ Protected by 🧠 SmartAI
┃ Status: Fully Under Control 💥
╚═━━━━━━━━━━━━━━━━━━━━━━═╝
`.trim();

  // ───── Safe Edit (fallback protected) ─────
  try {
    await api.editMessage(message, tempMsg.messageID, threadID);
  } catch (e) {
    await api.sendMessage(message, threadID);
  }
};
