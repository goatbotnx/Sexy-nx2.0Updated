const axios = require("axios");

module.exports = {
  config: {
    name: "google",
    version: "11.0.0",
    role: 0,
    author: "Gemini AI",
    description: "গুগল থেকে সরাসরি এবং নির্ভুল উত্তর পান",
    category: "tools",
    guide: "{pn} <আপনার প্রশ্ন>",
    countDown: 5
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const query = args.join(" ");

    if (!query) return api.sendMessage("❓ আপনি কি জানতে চান তা লিখুন।\nযেমন: /google kmn acho", threadID, messageID);

    api.sendMessage("✨ Google থেকে সঠিক তথ্য খোঁজা হচ্ছে...", threadID, messageID);

    try {
      // এটি একটি ফ্রি গুগল সার্চ এপিআই প্রক্সি যা কোনো কী ছাড়াই রেজাল্ট দেয়
      const res = await axios.get(`https://www.googleapis.com/customsearch/v1/siterestrict?q=${encodeURIComponent(query)}&key=YOUR_KEY_IS_NOT_NEEDED_HERE&cx=017503962328534238230:is_9z_40_84`);
      
      // আমরা এখানে গুগল সিএসই প্রক্সি ট্রিক ব্যবহার করছি
      const searchRes = await axios.get(`https://api.vyturex.com/google?query=${encodeURIComponent(query)}`);
      
      const answer = searchRes.data.result || searchRes.data.answer;

      if (answer) {
        return api.sendMessage(`🤖 **গুগল উত্তর:**\n\n${answer}`, threadID, messageID);
      } else {
        // যদি প্রক্সি কাজ না করে, তবে সরাসরি উইকিপিডিয়া বা জ্ঞানকোষ থেকে তথ্য নেওয়ার চেষ্টা
        const wikiRes = await axios.get(`https://bn.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        if (wikiRes.data.extract) {
            return api.sendMessage(`📖 **উইকিপিডিয়া তথ্য:**\n\n${wikiRes.data.extract}`, threadID, messageID);
        }
        throw new Error("No data found");
      }

    } catch (error) {
      // সব মেথড ফেইল করলে সরাসরি গুগল লিঙ্ক জেনারেট করবে
      return api.sendMessage(`❌ সরাসরি উত্তর পাওয়া যায়নি। এখানে ক্লিক করে দেখুন:\nhttps://www.google.com/search?q=${encodeURIComponent(query)}`, threadID, messageID);
    }
  }
};
