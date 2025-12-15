const fs = require("fs");
const path = __dirname + "/autoreact.json";

module.exports = {
  config: {
    name: "at",
    version: "2.0",
    author: "ChatGPT",
    countDown: 0,
    role: 0,
    shortDescription: "Advanced auto-react + add your own triggers",
    longDescription: "",
    category: "utility"
  },

  // Create storage file if not exists
  onStart: async function () {
    if (!fs.existsSync(path)) {
      fs.writeFileSync(path, JSON.stringify({ triggers: {} }, null, 2));
    }
  },

  // User Commands
  onCommand: async function ({ args, message }) {
    const db = JSON.parse(fs.readFileSync(path));

    if (args[0] === "add") {
      const word = args[1];
      const emoji = args[2];

      if (!word || !emoji) {
        return message.reply("Use: autoreact add <text> <emoji>");
      }

      db.triggers[word.toLowerCase()] = emoji;
      fs.writeFileSync(path, JSON.stringify(db, null, 2));

      return message.reply(`Added new trigger:\nText: **${word}**\nReact: ${emoji}`);
    }

    if (args[0] === "list") {
      const list = Object.entries(db.triggers)
        .map(([k, v]) => `${k} → ${v}`)
        .join("\n");

      return message.reply("🔥 Auto-react list:\n" + list);
    }

    return message.reply("Commands:\n• autoreact add <text> <emoji>\n• autoreact list");
  },

  // React System
  onChat: async function ({ event, api }) {
    if (!event.body) return;
    const msg = event.body.toLowerCase();

    // Load triggers
    const db = JSON.parse(fs.readFileSync(path));
    const custom = db.triggers;

    function react(e) {
      return api.setMessageReaction(e, event.messageID, () => {}, true);
    }

    // 🔥 DEFAULT REACTIONS (LARGE PACK + Banglish)
    const defaults = [
      ["hi", "💗"], ["hello", "💗"], ["hey", "💗"], ["gm", "💗"], ["gn", "💗"],
      ["good morning", "💗"], ["good night", "💗"], ["good evening", "❤️"],
      ["love you", "💗"], ["iloveyou", "💗"], ["i love you", "💗"],
      ["miss you", "💗"], ["i miss you", "💗"], ["sorry", "😔"],
      ["thanks", "😊"], ["thank you", "😊"], ["ty", "😊"],
      ["lol", "😆"], ["lmao", "😆"], ["😂", "😆"], ["🤣", "😆"], ["😆", "😆"],
      ["haha", "😆"], ["wtf", "🤨"], ["omg", "😮"], ["wow", "😮"],
      ["sad", "😢"], ["😢", "😢"], ["😭", "😢"], ["heartbroken", "💔"],
      ["😍", "😍"], ["😘", "😘"], ["🥺", "🥺"], ["😏", "😏"],
      ["angry", "😡"], ["😡", "😡"], ["🤬", "🤬"], ["fuck", "🤬"], ["pakyu", "🤬"],
      ["siyam", "🥺😉"], ["nila", "🍼"], ["kid", "👧"], ["nusu", "😘"],
      ["nice", "👍"], ["good job", "👍"], ["perfect", "👍"],
      ["bye", "👋"], ["goodbye", "👋"], ["brb", "👋"],
      ["cute", "😊"], ["beautiful", "💗"], ["handsome", "😎"],
      ["pogi", "😎"], ["ganda", "💗"],
      ["busy", "⏳"], ["zope", "⏳"],

      // Banglish / English-Bangla
      ["kemon aso", "🙂"], ["bhalo aso", "😎"], ["kharap", "😢"], ["khushi lagse", "😄"],
      ["mone hocche na", "🤔"], ["valo laglo", "😍"], ["kothai", "📍"], ["siyam", "🥰"],
      ["khub valo", "👍"], ["tomar jonno", "💗"], ["amar sathe", "🤝"], ["dhonnobad", "🙏"],
      ["thik ache", "👌"], ["bhai", "👊"], ["bon", "👭"], ["shundor", "😍"],
      ["baje", "😠"], ["mone porlo", "💭"], ["bhoy lagse", "😨"], ["valo", "😊"],
      ["pothik", "🧭"], ["khaua khawa", "🍽️"], ["bhut", "👻"], ["vabo", "🤔"],
      ["chinta koro na", "😌"], ["hasi", "😂"], ["rudro", "😡"], ["prem", "💖"],
      ["mon kharap", "😞"], ["ajker din", "📅"], ["kal", "🗓️"], ["bikel", "🌇"],
      ["sokal", "🌅"], ["nila", "😘"], ["ghum", "😴"], ["khela", "⚽"],
      ["sundor lagse", "😍"], ["ajke bhalo", "😊"], ["tomake miss korchi", "🥺"],
      ["amar sathe cholo", "🚶‍♂️"], ["valo thakbe", "💪"], ["shanti", "☮️"], ["gopon", "🤫"],
      ["shundor meye", "👸"], ["shundor chele", "🤴"], ["khusi", "😄"], ["dukkho", "😢"],
      ["harate chai na", "😤"], ["jibon", "🌍"], ["bondhu", "👬"], ["poribar", "👨‍👩‍👧‍👦"],
      ["kaj", "💼"], ["pora", "📚"], ["masti", "😜"], ["ghumay", "😴"], ["kotha bolo", "💬"],
      ["haso", "😂"], ["bhoy", "😱"], ["dosti", "🤝"], ["shopno", "💭"], ["sundor ghum", "😴"],
      ["premer", "💌"], ["moner kotha", "💖"], ["shukh", "😊"], ["mone rakhbe", "📝"],
      ["ajker plan", "📅"], ["sundor jaiga", "🌴"], ["pahar", "⛰️"], ["nodi", "🌊"],
      ["ful", "🌸"], ["shopno dekho", "💤"], ["din valo", "☀️"], ["rat valo", "🌙"],
      ["khela", "⚽"], ["gan", "🎵"], ["nach", "💃"], ["majhe", "😌"],
      ["ekdom valo", "💯"], ["tumar sathe", "🤝"], [" nai", "❌"]
    ];

    // Check Default Triggers
    for (const [text, emoji] of defaults) {
      if (msg.includes(text)) return react(emoji);
    }

    // Check Custom User-added Triggers
    for (const text in custom) {
      if (msg.includes(text)) return react(custom[text]);
    }
  }
};
