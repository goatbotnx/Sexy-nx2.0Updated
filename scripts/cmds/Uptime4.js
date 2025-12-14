const fs = require('fs');
const os = require('os');
const moment = require('moment');

module.exports = {
  config: {
    name: "up4",
    version: "1.0",
    author: "Dbz Mahin",
    role: 0,
    shortDescription: "Display system uptime and stats",
    longDescription: "Shows bot uptime and system information in ICc Cream Community style",
    category: "system",
    aliases: ["up4", "status4", "upt4"],
    guide: {
      en: "{p}uptime4"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      // Calculate uptime
      const uptime = process.uptime();
      const days = Math.floor(uptime / (3600 * 24));
      const hours = Math.floor((uptime % (3600 * 24)) / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      // Get system info
      const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const cpuModel = os.cpus()[0].model;
      const platform = os.platform();
      const arch = os.arch();
      
      // Create status message
      const statusMessage = `


♡ ∩_∩
（„• ֊ •„)
╭─∪∪────────────⟡
│ BOT 🎀𝗨𝗣𝗧𝗜𝗠𝗘 𝗜𝗡𝗙𝗢
├───────────────⟡
⟡
│ ⏰ 𝗥𝗨𝗡𝗧𝗜𝗠𝗘
│  ${days}d ${hours}h ${minutes}m $25
├───────────────⟡

├───────────────⟡
│ 👑 𝗦𝗬𝗦𝗧𝗘𝗠 𝗜𝗡𝗙𝗢
│ 🚪OS: ${platform} ${arch}
│🍒LANG VER: ${process.version} 
│🥥 CPU MODEL: ${cpuModel}
│  🍷 Processor
│🍫 STORAGE: ${usedMem} GB / ${totalMem} GB
│ 🧊CPU USAGE: ${(process.cpuUsage().user / 1000000).toFixed(2)}%
│🌊 RAM USAGE: ${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)} MB

├───────────────⟡
│ ✅ 𝗢𝗧𝗛𝗘𝗥 𝗜𝗡𝗙𝗢
│📅DATE: ${moment().format('M/D/YYYY')}
│✨TIME: ${moment().format('h:mm:ss A')}
│🎀PING: ${Date.now() - event.timestamp}ms
│📊STATUS: ✔ Smooth System
╰───────────────⟡
      `;

      api.sendMessage(statusMessage, event.threadID);

    } catch (error) {
      console.error('Uptime command error:', error);
      api.sendMessage("❌ An error occurred while fetching system info.", event.threadID);
    }
  }
};
