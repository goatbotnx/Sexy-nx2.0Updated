const os = require('os');
const moment = require('moment');
const fs = require('fs');

module.exports = {
  config: {
    name: "uptime5",
    version: "2.0",
    author: "Dbz Mahin",
    role: 0,
    shortDescription: "System status with member stats",
    longDescription: "Displays system status with real group member statistics",
    category: "system",
    aliases: ["up5", "upt5"],
    guide: {
      en: "{p}uptime5"
    }
  },

  onStart: async function ({ api, event, threadsData, usersData }) {
    try {
      // Calculate uptime
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      
      // Get system info
      const totalMem = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(2);
      const freeMem = (os.freemem() / (1024 * 1024 * 1024)).toFixed(2);
      const usedMem = (totalMem - freeMem).toFixed(2);
      const disk = fs.statSync('/');
      const totalDisk = (disk.blocks * disk.blksize / (1024 * 1024 * 1024)).toFixed(2);
      const freeDisk = (totalDisk - (disk.blocks - disk.bfree) * disk.blksize / (1024 * 1024 * 1024)).toFixed(2);
      const usedDisk = (totalDisk - freeDisk).toFixed(2);

      // Count all group members and genders
      let maleCount = 0;
      let femaleCount = 0;
      let totalUsers = 0;
      let groupCount = 0;

      try {
        const allThreads = await threadsData.getAll();
        groupCount = allThreads.filter(t => t.isGroup).length;
        
        const allUsers = await usersData.getAll();
        totalUsers = allUsers.length;
        
        for (const user of allUsers) {
          if (user.gender === 'MALE') maleCount++;
          if (user.gender === 'FEMALE') femaleCount++;
        }
      } catch (e) {
        console.error("Error counting users:", e);
      }

      // Create status message
      const statusMessage = `## ${os.userInfo().username}
-💌 Prefix: ${global.GoatBot.config?.prefix || '!'} / J
- 🙀Bot Running: ${hours}Hrs ${minutes}Min

### ${moment().format('SS')}Sec
- 👀Boys: ${maleCount}
- 👀Girls: ${femaleCount}
- 🍫Groups: ${groupCount}
- 🌊Users: ${totalUsers}
- 🎀OS: ${os.type()} ${os.release()}
- 🍷Model: ${os.cpus()[0].model}

### ${os.cpus().length}-Core Processor
- 👑Cores: ${os.cpus().length}
- ✨Architecture: ${os.arch()}
- 🥥🍒Disk Information:

---

**Usage:** ${usedDisk} GB
**Total:** ${totalDisk} GB
**👑📊Memory Information:**

---

**Usage:** ${(process.memoryUsage().rss / (1024 * 1024)).toFixed(2)} MB
**Total:** ${totalMem} GB
**😚Ram Information:**

---

**Usage:** ${usedMem} GB
**Total:** ${totalMem} GB

---
## ${os.userInfo().username}
- Kalker uptime dekho
- Message`;

      api.sendMessage(statusMessage, event.threadID);

    } catch (error) {
      console.error('Uptime5 command error:', error);
      api.sendMessage("❌ Error generating status report. Please try again later.", event.threadID);
    }
  }
};
