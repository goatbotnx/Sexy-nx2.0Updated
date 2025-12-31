const axios = require("axios");

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "3.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    description: "Getting and answering questions",
    category: "games",
    guide: "Type /quiz to get question then answer the question (a,b,c,d) Or type /quiz list to get total question"
  },

  onStart: async function ({ event, message, args, api }) {
    const { senderID } = event;
    const GITHUB_RAW_URL = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";

    try {
      
      const configRes = await axios.get(GITHUB_RAW_URL);
      const API_URL = configRes.data.quiz;

      if (args[0] === "list") {
        const res = await axios.get(`${API_URL}/mcq/list`);
        const { total, categories } = res.data;

        let msg = `📊 *MCQ LIST*\n━━━━━━━━━━━━━━━\n🔹 total question: ${total}\n`;
        for (const cat in categories) {
          msg += `• ${cat.charAt(0).toUpperCase() + cat.slice(1)}: ${categories[cat]}টি\n`;
        }
        msg += `━━━━━━━━━━━━━━━\n💡 কুইজ খেলতে শুধু /quiz লিখুন।`;
        return message.reply(msg);
      }

      const res = await axios.get(`${API_URL}/mcq`);
      const { question, options, time, category } = res.data;

      const msgText = `📝 *প্রশ্ন:* ${question}\n\n` +
                  `🅰️ ${options.A}\n` +
                  `🅱️ ${options.B}\n` +
                  `©️ ${options.C}\n` +
                  `Ⓓ ${options.D}\n\n` +
                  `⏳ time: ${time} second\n`;

      return message.reply(msgText, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: senderID,
          questionText: question,
          category: category,
          apiUrl: API_URL
        });

        setTimeout(() => {
          api.unsendMessage(info.messageID).catch(() => {});
        }, 60000); 
      });

    } catch (e) { 
      message.reply("❌ api error "); 
    }
  },

  onReply: async function ({ event, Reply, message, usersData, api }) {
    const { senderID, body } = event;

    if (senderID !== Reply.author) {
      return message.reply("⚠️ ιѕ ησт уσυя qυιz вву 🐸🌬️");
    }

    const userAnswer = body.trim().toUpperCase();
    if (!["A", "B", "C", "D"].includes(userAnswer)) return;

    try {
      const res = await axios.post(`${Reply.apiUrl}/mcq/check`, {
        userID: senderID,
        category: Reply.category,
        question: Reply.questionText,
        option: userAnswer
      });

      api.unsendMessage(Reply.messageID).catch(() => {});
      global.GoatBot.onReply.delete(Reply.messageID);

      if (res.data.correct) {

        const userData = await usersData.get(senderID);
        const reward = 500;
        const newMoney = (parseInt(userData.money || "0") + reward).toString();
        await usersData.set(senderID, { money: newMoney });

        return message.reply(`✅ r̷i̷g̷h̷t̷ A̷n̷s̷w̷e̷r̷!\n💰y̷o̷u̷ g̷o̷t̷ i̷t̷. : ${reward}$\n🏦 c̷u̷r̷r̷e̷n̷t̷ b̷A̷l̷A̷n̷c̷e̷: ${newMoney}$`);
      } else {
        return message.reply(`❌w̷r̷o̷n̷g̷ A̷n̷s̷w̷e̷r̷ !\n📖 t̷h̷e̷ c̷o̷r̷r̷e̷c̷t̷ A̷n̷s̷w̷e̷r̷ w̷A̷s̷: ${res.data.correctOption}`);
      }
    } catch (e) { 
      message.reply("❌ q̷u̷i̷z̷ s̷e̷r̷v̷e̷r̷ e̷r̷r̷o̷r̷"); 
    }
  }
};
