const os = require("os");
const moment = require("moment");

module.exports = {
  config: {
    name: "uptime3",
    version: "2.1",
    author: "Dbz Mahin fixed by xalman",
    role: 0,
    shortDescription: "Beautiful system & bot status",
    longDescription: "Displays uptime, system info, groups & users stats",
    category: "system",
    aliases: ["up5", "upt5"],
    guide: {
      en: "{p}uptime5"
    }
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      /* ===== UPTIME ===== */
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);

      /* ===== SYSTEM ===== */
      const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
      const freeMem = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const ramUsage = (process.memoryUsage().rss / 1024 / 1024).toFixed(2);

      /* ===== USERS & GROUPS ===== */
      let male = 0;
      let female = 0;
      let users = 0;
      let groups = 0;

      try {
        const allUsers = await usersData.getAll();
        users = allUsers.length;

        for (const u of allUsers) {
          if (u.gender === "MALE") male++;
          if (u.gender === "FEMALE") female++;
        }

        const allThreads = await threadsData.getAll();
        groups = allThreads.filter(t => t.isGroup).length;
      } catch (e) {
        console.log("Stats error:", e);
      }

      /* ===== MESSAGE ===== */
      const msg =
`╭─━━━━━━━━━━━━━━━━━━━─╮
        🤖 BOT STATUS
╰─━━━━━━━━━━━━━━━━━━━─╯

⏰ **Uptime**
• ${hours}h ${minutes}m ${seconds}s

📅 **Time**
• ${moment().format("DD MMM YYYY | hh:mm:ss A")}

👥 **Users Info**
• 👦 Boys: ${male}
• 👧 Girls: ${female}
• 🌊 Total Users: ${users}
• 🍫 Groups: ${groups}

💻 **System Info**
• 🖥 OS: ${os.type()} ${os.release()}
• 🧠 CPU: ${os.cpus()[0].model}
• ⚙️ Cores: ${os.cpus().length}
• 🧬 Arch: ${os.arch()}

📊 **Memory**
• 🧃 RAM Used: ${ramUsage} MB
• 🧠 RAM Total: ${totalMem} GB
• 🧠 RAM Free: ${freeMem} GB
• 🔥 RAM Usage: ${usedMem} GB

✨ Prefix: ${global.GoatBot.config?.prefix || "!"}
━━━━━━━━━━━━━━━━━━━━━━
❤️ Powered by Xalman`;

      api.sendMessage(msg, event.threadID);

    } catch (err) {
      console.error("uptime5 error:", err);
      api.sendMessage("❌ Failed to load system status.", event.threadID);
    }
  }
};
