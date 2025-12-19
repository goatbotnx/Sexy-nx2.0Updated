const moment = require("moment-timezone");

const COOLDOWN_HOURS = 12;
const MIN_PRIZE = 1000;
const MAX_PRIZE = 1000000;
const OPEN_COST = 100;

module.exports = {
  config: {
    name: "mysterybox",
    aliases: ["mbox", "mystery"],
    version: "1.6-fixed",
    author: "xnil6x (fixed by xalman)",
    countDown: 5,
    role: 0,
    description: "🎁 Open a mystery box every 12 hours",
    category: "game",
    guide: {
      en: "{pn} → Open mystery box\n{pn} top → View top winners"
    }
  },

  onStart: async function ({ api, event, args, usersData }) {
    const { senderID, threadID, messageID } = event;

    // ===== Load User =====
    let user = await usersData.get(senderID);
    if (!user) user = {};

    // money system (balance.js compatible)
    user.money = Number(user.money) || 0;

    if (!user.data) user.data = {};
    user.data.mysteryLastOpen = Number(user.data.mysteryLastOpen) || 0;
    user.data.mysteryMaxWin = Number(user.data.mysteryMaxWin) || 0;

    // ===== TOP COMMAND =====
    if (args[0] && args[0].toLowerCase() === "top") {
      const allUsers = await usersData.getAll();

      const now = moment().tz("Asia/Dhaka");
      const hour = now.hour();

      let windowStart = now.clone()
        .hour(hour < 6 ? 18 : 6)
        .minute(0).second(0).millisecond(0);

      if (hour < 6) windowStart.subtract(1, "day");

      const filtered = allUsers.filter(u => {
        if (!u?.data) return false;
        return (
          Number(u.data.mysteryLastOpen) >= windowStart.valueOf() &&
          Number(u.data.mysteryMaxWin) > 0
        );
      });

      filtered.sort((a, b) =>
        Number(b.data.mysteryMaxWin) - Number(a.data.mysteryMaxWin)
      );

      const top = filtered.slice(0, 10);

      if (!top.length) {
        return api.sendMessage(
          "❗ এই ১২ ঘণ্টায় এখনো কেউ mystery box জেতে নাই",
          threadID,
          messageID
        );
      }

      let text = "╔════════════════════════════╗\n";
      text += "║  🏆 MYSTERY BOX TOP 10 🏆  ║\n";
      text += "╠════════════════════════════╣\n";

      top.forEach((u, i) => {
        text += `║ ${i + 1}. ${(u.name || "Unknown").slice(0, 14).padEnd(14)} - ${Number(u.data.mysteryMaxWin).toLocaleString().padStart(8)} ৳ ║\n`;
      });

      text += "╚════════════════════════════╝";

      return api.sendMessage(text, threadID, messageID);
    }

    // ===== COOLDOWN CHECK =====
    const nowTs = Date.now();
    const lastOpen = user.data.mysteryLastOpen;

    if (nowTs - lastOpen < COOLDOWN_HOURS * 3600 * 1000) {
      const remain = COOLDOWN_HOURS * 3600 * 1000 - (nowTs - lastOpen);
      const h = Math.floor(remain / 3600000);
      const m = Math.floor((remain % 3600000) / 60000);
      const s = Math.floor((remain % 60000) / 1000);

      return api.sendMessage(
        `⏳ Cooldown Active\nTime Left: ${h}h ${m}m ${s}s`,
        threadID,
        messageID
      );
    }

    // ===== BALANCE CHECK =====
    if (user.money < OPEN_COST) {
      return api.sendMessage(
        `❌ Mystery box খুলতে ${OPEN_COST} ৳ লাগবে\n💰 তোমার balance: ${user.money.toLocaleString()} ৳`,
        threadID,
        messageID
      );
    }

    // ===== CUT OPEN COST =====
    user.money -= OPEN_COST;
    await usersData.set(senderID, user);

    // ===== OPEN ANIMATION =====
    const frames = [
      "🎁 Mystery Box Opening...\n[■□□□□] 20%",
      "🎁 Mystery Box Opening...\n[■■□□□] 40%",
      "🎁 Mystery Box Opening...\n[■■■□□] 60%",
      "🎁 Mystery Box Opening...\n[■■■■□] 80%",
      "🎁 Mystery Box Opening...\n[■■■■■] 100%"
    ];

    let msg = await api.sendMessage(frames[0], threadID);
    for (let i = 1; i < frames.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      await api.editMessage(frames[i], msg.messageID);
    }

    // ===== PRIZE =====
    const prize = Math.floor(
      Math.random() * (MAX_PRIZE - MIN_PRIZE + 1)
    ) + MIN_PRIZE;

    user.money += prize;
    user.data.mysteryLastOpen = nowTs;

    if (prize > user.data.mysteryMaxWin) {
      user.data.mysteryMaxWin = prize;
    }

    await usersData.set(senderID, user);

    // ===== RESULT =====
    return api.sendMessage(
      `🎉 Congratulations!\nতুমি Mystery Box থেকে পেয়েছো: ${prize.toLocaleString()} ৳\n\n💰 বর্তমান Balance: ${user.money.toLocaleString()} ৳`,
      threadID,
      messageID
    );
  }
};
