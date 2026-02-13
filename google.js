const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    version: "40.0.0",
    role: 0,
    author: "Gemini AI",
    description: "গুগল এআই মোডের মতো সরাসরি উত্তর (No Key/No Login)",
    category: "ai",
    guide: "{pn} <আপনার প্রশ্ন>",
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return api.sendMessage("❓ কি জানতে চান তা লিখুন।\nযেমন: /google kmn acho", threadID, messageID);

    api.sendMessage("🔍 গুগল থেকে তথ্য সংগ্রহ করা হচ্ছে...", threadID, messageID);

    try {
      // এটি একটি হাই-পারফরম্যান্স ফ্রি এআই এপিআই যা সরাসরি উত্তর জেনারেট করে
      const response = await axios.get(`https://api.pawan.krd/cosmosrp/v1/chat/completions?prompt=${encodeURIComponent("Answer in Bengali like Google AI summary: " + query)}`);
      
      // পবন এপিআই যদি কোনো কারণে ডাউন থাকে তবে বিকল্প ওপেন গেটওয়ে
      const answer = response.data.choices[0].text || response.data.choices[0].message.content;

      if (answer) {
        return api.sendMessage(`🤖 **Google AI Overview** ✨\n\n${answer.trim()}`, threadID, messageID);
      } else {
        throw new Error("API Limit");
      }

    } catch (error) {
      // চূড়ান্ত ব্যাকআপ: এটি গুগলের আসল Gemini ব্যাকএন্ড ব্যবহার করা একটি ফ্রি প্রক্সি
      try {
        const resAlt = await axios.get(`https://api.vyturex.com/gemini?prompt=${encodeURIComponent(query + " answer in bengali accurately")}`);
        const finalAnswer = resAlt.data.answer || resAlt.data.result;
        
        return api.sendMessage(`🤖 **Google AI Overview** ✨\n\n${finalAnswer}`, threadID, messageID);
      } catch (err) {
        return api.sendMessage(`❌ সব ফ্রি মেথড এখন বিজি। গুগলে সরাসরি দেখুন:\nhttps://www.google.com/search?q=${encodeURIComponent(query)}`, threadID, messageID);
      }
    }
  }
};
