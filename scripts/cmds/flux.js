const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
    config: {
        name: "flux",
        version: "2.6.0",
        author: "xalman",
        countDown: 8,
        role: 0,
        shortDescription: "Generate High-Quality AI Images",
        longDescription: "Generate stunning images using Flux model with dynamic API fetching.",
        category: "AI-IMAGE",
        guide: "{pn} [your prompt]"
    },

    onStart: async function ({ api, event, args }) {
        const { threadID, messageID, senderID } = event;
        const prompt = args.join(" ");

        if (!prompt) {
            return api.sendMessage("✨ 𝖯𝗅𝖾𝖺𝗌𝖾 𝖾𝗇𝗍𝖾𝗋 𝖺 𝗉𝗋𝗈𝗆𝗉𝗍!\n━━━━━━━━━━━━━━━━━━━━\n𝖤𝗑𝖺𝗆𝗉𝗅𝖾: /flux a futuristic city", threadID, messageID);
        }

        api.setMessageReaction("⏳", messageID, (err) => {}, true);
        const startTime = Date.now();

        try {
            const configRes = await axios.get("https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json");
            const apiBase = configRes.data.flux;

            if (!apiBase) throw new Error("Could not find API URL in config");

            const response = await axios.get(`${apiBase}/generate?prompt=${encodeURIComponent(prompt)}`);
            const imageUrl = response.data.image_url;

            if (!imageUrl) throw new Error("Invalid API response");

            const cachePath = path.join(__dirname, 'cache', `flux_${senderID}_${Date.now()}.png`);

            const imgRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            fs.ensureDirSync(path.join(__dirname, 'cache'));
            fs.writeFileSync(cachePath, Buffer.from(imgRes.data, 'binary'));

            const endTime = Date.now();
            const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

            const msgBody = `✨ 𝗙𝗟𝗨𝗫 𝗔𝗜 𝗚𝗘𝗡𝗘𝗥𝗔𝗧𝗘𝗗 ✨\n━━━━━━━━━━━━━━━━━━━━\n📝 𝖯𝗋𝗈𝗆𝗉𝗍: ${prompt}\n👤 𝖠𝗎𝗍𝗁𝗈𝗋: ${response.data.author || "xalman"}\n⏱️ 𝖳𝗂𝗆𝖾 𝖳𝖺𝗄𝖾𝗇: ${timeTaken}𝗌\n━━━━━━━━━━━━━━━━━━━━`;

            api.setMessageReaction("✅", messageID, (err) => {}, true);

            return api.sendMessage({
                body: msgBody,
                attachment: fs.createReadStream(cachePath)
            }, threadID, () => {
                if (fs.existsSync(cachePath)) fs.unlinkSync(cachePath);
            }, messageID);

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", messageID, (err) => {}, true);
            return api.sendMessage("⚠️ 𝖦𝖾𝗇𝖾𝗋𝖺𝗍𝗂𝗈𝗇 𝖥𝖺𝗂𝗅𝖾𝖽! 𝖢𝗁𝖾𝖼𝗄 𝗂𝖿 𝗍𝗁𝖾 𝖠𝖯𝖨 𝗂𝗌 𝗈𝗇𝗅𝗂𝗇𝖾.", threadID, messageID);
        }
    }
};
