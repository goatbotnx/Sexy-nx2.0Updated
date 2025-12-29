  const makeBar = (value, length = 18) => {
  const done = Math.floor((value / 100) * length);
  return "▓".repeat(done) + "░".repeat(length - done);
};

module.exports = {
  config: {
    name: "membergendercheak",
    alias: ["mgc"],
    version: "3.0",
    author: "xalman",
    role: 0,
    shortDescription: "Scan group gender count",
    longDescription: "Scans group members and displays gender count, type with cmd list to see count with members name .",
    category: "utility"
  },

  onStart: async ({ api, event, message, args }) => {
    const threadID = event.threadID;

    try {
      
      const loading = await api.sendMessage(
        "⏳ Running gender detection engine...",
        threadID
      );

      await new Promise(r => setTimeout(r, 500));
      api.setMessageReaction("🔍", loading.messageID, () => {}, true);

      const info = await api.getThreadInfo(threadID);
      const users = info.participantIDs || [];

      if (!users.length)
        return message.reply("⚠️ No users detected in this group.");

      const male = [];
      const female = [];
      const unknown = [];

      for (const uid of users) {
        try {
          const data = await new Promise((res, rej) => {
            api.getUserInfo(uid, (e, d) => e ? rej(e) : res(d));
          });

          const profile = data[uid] || {};
          const name = profile.name || "Unknown";

          if (profile.gender === 2) male.push(name);
          else if (profile.gender === 1) female.push(name);
          else unknown.push(name);
        } catch {
          unknown.push("Unknown");
        }
      }

      api.setMessageReaction("✅", loading.messageID, () => {}, true);

      const total = users.length;
      const mPct = +(male.length / total * 100).toFixed(1);
      const fPct = +(female.length / total * 100).toFixed(1);
      const uPct = +(unknown.length / total * 100).toFixed(1);

      const mode = (args[0] || "").toLowerCase();

      const title = `
╔══════════════════════════════╗
     🧬 GROUP GENDER CHECKER         
╠══════════════════════════════╣
`;

      if (!mode) {
        return message.reply(
`${title}
👦 BOYS   : ${male.length} (${mPct}%)
${makeBar(mPct).split("").join(" ")}

👧 GIRLS  : ${female.length} (${fPct}%)
${makeBar(fPct).split("").join(" ")}

👉ggc list › show reports with members name
POWERED BY XALMAN 🌬️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 TOTAL MEMBERS : ${total}`
        );
      }

      if (mode === "list") {
        return message.reply(
`${title}
👦 BOYS (${male.length} | ${mPct}%)
${male.join("\n") || "— None —"}

👧 GIRLS (${female.length} | ${fPct}%)
${female.join("\n") || "— None —"}

❓ UNKNOWN (${unknown.length} | ${uPct}%)
${unknown.join("\n") || "— None —"}

POWERED BY XALMAN 🌬️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 TOTAL MEMBERS : ${total}`
        );
      }

    } catch (e) {
      console.error(e);
      return message.reply("❌ Gender scan interrupted.");
    }
  },

  run: async function (ctx) {
    return this.onStart(ctx);
  }
};
