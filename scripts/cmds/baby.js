const axios = require("axios");

const mahmud = [
  "baby",
  "bby",
  "jan",
  "bot",
  "sara",
  "xadika"
];


const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.jan;
};

module.exports = {
  config: {
    name: "bot",
    version: "1.7",
    author: "MahMUD",
    role: 0,
    category: "ai",
    guide: { en: "just type jan" },
  },

  onStart: async function () {},

  onReply: async function ({ api, event }) {
    if (event.type === "message_reply") {
      const message = event.body?.toLowerCase() || "lol";

      async function getBotResponse(message) {
        try {
          const base = await baseApiUrl();
          const response = await axios.get(`${base}/jan/font3/${encodeURIComponent(message)}`);
          return response.data?.message;
        } catch {
          return "error janu🥹";
        }
      }

      const replyMessage = await getBotResponse(message);
      api.sendMessage(replyMessage, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: "bot",
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            text: replyMessage,
          });
        }
      }, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const responses = [
      "kmn acho bby🥺",
      "assalamualaikum bbz🫠💋",
      "eto din por mine porlo amake🥺💔",
      "hea bolo 🥳🥳",
      "kire haramjada dakoch kn 😠",
      "kache adho bby🌚🫶",
      "ummahh bbz🌚🫶",
      "kisse ko 🫤",
      "nx er bow nai or bow hoba ...?🤧🌚",
      "__ফ্রী ফে'সবুক চালাই কা'রন ছেলেদের মুখ দেখা হারাম 😌",
      "মন সুন্দর বানাও মুখের জন্য তো 'Snapchat' আছেই! 🌚"
    ];

    const message = event.body?.toLowerCase() || "";
    const words = message.split(" ");
    const wordCount = words.length;

    if (event.type !== "message_reply" && mahmud.some(word => message.startsWith(word))) {
      api.setMessageReaction("🪶", event.messageID, () => {}, true);
      api.sendTypingIndicator(event.threadID, true);

      async function getBotResponse(message) {
        try {
          const base = await baseApiUrl();
          const response = await axios.get(`${base}/jan/font3/${encodeURIComponent(message)}`);
          return response.data?.message;
        } catch {
          return "error janu🥹";
        }
      }

      if (wordCount === 1) {
        const randomMsg = responses[Math.floor(Math.random() * responses.length)];
        api.sendMessage(randomMsg, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              link: randomMsg,
            });
          }
        }, event.messageID);
      } else {
        const userText = words.slice(1).join(" ");
        const botResponse = await getBotResponse(userText);
        api.sendMessage(botResponse, event.threadID, (err, info) => {
          if (!err) {
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID,
              text: botResponse,
            });
          }
        }, event.messageID);
      }
    }
  },
};
