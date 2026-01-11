const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    config: {
        name: "imgup",
      aliases: ["freeimage", "freeimgup", "freeimg"],
        version: "2.1.0",
        hasPermssion: 0,
        author: "xalman",
        description: "Upload image using GitHub JSON Config",
        commandCategory: "utility",
        usages: "[reply to an image]",
        cooldowns: 5,
    },

    onStart: async function ({ api, event }) {

        if (event.type !== "message_reply" || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo") {
            return api.sendMessage("❌ please reply any image ", event.threadID, event.messageID);
        }

        const imageUrl = event.messageReply.attachments[0].url;

        try {

            api.setMessageReaction("🕑", event.messageID, (err) => {}, true);

            const githubRaw = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";
            const configRes = await axios.get(githubRaw);

            let baseUrl = configRes.data.freeimg; 

            const endpoint = `${baseUrl.replace(/\/$/, "")}/upload-free`;
            const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageRes.data);
            const form = new FormData();
            form.append('image', buffer, { filename: 'upload.jpg' });

            const response = await axios.post(endpoint, form, {
                headers: form.getHeaders()
            });

            if (response.data.success) {
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                api.sendMessage(`✅ Uploaded Successfully!\n\n🔗 Link: ${response.data.url}`, event.threadID, event.messageID);
            } else {
                throw new Error("Server failed to return URL");
            }

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            api.sendMessage(`⚠️ Error: ${error.message}`, event.threadID, event.messageID);
        }
    }
};
