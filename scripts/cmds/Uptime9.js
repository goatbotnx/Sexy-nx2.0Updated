const os = require("os");

module.exports.config = {
  name: "uptime9",
  aliases: ["up9", "upt9", "bot9", "status9"],
  version: "3.0.0",
  author: "Mahin+ ChatGPT",
  role: 0,
  category: "system",
  guide: {
    en: "{pn} - Extra stylized bot monitor with fun visuals"
  }
};

module.exports.onStart = async function ({ api, event }) {
  const { threadID, messageID } = event;
  const start = Date.now();

  // Ping
  const tempMsg = await api.sendMessage("🔍 Booting up core diagnostics...", threadID);
  const ping = Date.now() - start;

  // Time
  const uptimeSec = process.uptime();
  const d = Math.floor(uptimeSec / 86400);
  const h = Math.floor((uptimeSec % 86400) / 3600);
  const m = Math.floor((uptimeSec % 3600) / 60);
  const s = Math.floor(uptimeSec % 60);

  // CPU + Memory
  const cpuLoad = os.loadavg()[0].toFixed(2);
  const totalMem = os.totalmem() / 1024 / 1024;
  const freeMem = os.freemem() / 1024 / 1024;
  const usedMem = totalMem - freeMem;

  // Mood based on memory load
  const loadMood = usedMem / totalMem < 0.5 ? "🧘 Chill" : usedMem / totalMem < 0.8 ? "⚠️ Alert" : "🔥 Overclock";

  // Ping bar
  const pingBar = ping < 100 ? "📶 FAST" : ping < 250 ? "📶 MEDIUM" : "📶 SLOW";

  // Battery style energy level
  const energyIcons = ["🔋", "🔋", "🔋", "🔋", "🔋"];
  const energyUsed = Math.min(Math.floor((usedMem / totalMem) * energyIcons.length), energyIcons.length - 1);
  energyIcons[energyUsed] = "❌";
  const energyBar = energyIcons.join("");

  const nodeVersion = process.version;
  const platform = `${os.type()} (${os.arch()})`;

  const message = `
╔═━━━◥◣📊 𝗨𝗣𝗧𝗜𝗠𝗘 𝟵 𝗦𝗧𝗔𝗧𝗨𝗦 ◢◤━━━═╗

🕒 𝗧𝗶𝗺𝗲 𝗢𝗻𝗹𝗶𝗻𝗲: ${d}d ⏰ ${h}h ${m}m ${s}s
📡 𝗣𝗶𝗻𝗴: ${ping}ms → ${pingBar}
🧠 𝗠𝗼𝗼𝗱: ${loadMood}
🔁 𝗖𝗣𝗨 𝗟𝗼𝗮𝗱: ${cpuLoad} %
💾 𝗠𝗲𝗺𝗼𝗿𝘆: ${usedMem.toFixed(1)}MB / ${totalMem.toFixed(1)}MB
⚙️ 𝗘𝗻𝗴𝗶𝗻𝗲: Node.js ${nodeVersion}
🌍 𝗣𝗹𝗮𝘁𝗳𝗼𝗿𝗺: ${platform}

📶 𝗕𝗼𝘁 𝗘𝗻𝗲𝗿𝗴𝘆: ${energyBar}

╔═━━━━━🔒 𝗘𝗡𝗚𝗜𝗡𝗘 𝗖𝗢𝗥𝗘 ━━━━━═╗
┃ This bot is powered by ⚡ NX
┃ Protected by 🧠 SmartAI
┃ Fully loaded, fully alive 💥
╚═━━━━━━━━━━━━━━━━━━━━━━═╝

🧬 𝗨𝗻𝗶𝗾𝘂𝗲. 𝗨𝗹𝘁𝗿𝗮. 𝗨𝗽𝗴𝗿𝗮𝗱𝗲𝗱.
`.trim();

  api.editMessage(message, tempMsg.messageID, threadID);
};
