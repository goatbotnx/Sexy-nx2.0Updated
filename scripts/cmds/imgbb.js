const axios = require('axios');
const FormData = require('form-data');

module.exports = {
    config: {
        name: "imgbb",
        aliases: ["i", "ibb"],
        version: "3.0",
        hasPermssion: 0,
        credits: "xalman",
        description: "Upload image in imagebb reply any photo",
        commandCategory: "image",
        usages: "[reply to an image]",
        cooldowns: 5,
    },

    onStart: async function ({ api, event }) {
        if (event.type !== "message_reply" || !event.messageReply.attachments[0] || event.messageReply.attachments[0].type !== "photo") {
            return api.sendMessage("❌ please reply any image", event.threadID, event.messageID);
        }

        const imageUrl = event.messageReply.attachments[0].url;

        try {
            api.setMessageReaction("🕑", event.messageID, (err) => {}, true);

            const githubLink = "https://raw.githubusercontent.com/goatbotnx/Sexy-nx2.0Updated/refs/heads/main/nx-apis.json";
            const configRes = await axios.get(githubLink);
            const apiBaseUrl = configRes.data.imgbb; 
            if (!apiBaseUrl) throw new Error("API URL not found in JSON");

            const finalEndpoint = `${apiBaseUrl.replace(/\/$/, "")}/upload`;

            const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(imageRes.data);

            const form = new FormData();
            form.append('image', buffer, { filename: 'image.jpg' });

            const response = await axios.post(finalEndpoint, form, {
                headers: form.getHeaders()
            });

            if (response.data.success) {
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);
                api.sendMessage(`✅ Upload Success!\n\n🔗 Link: ${response.data.url}`, event.threadID, event.messageID);
            } else {
                throw new Error("ImgBB upload failed");
            }

        } catch (error) {
            console.error(error);
            api.setMessageReaction("❌", event.messageID, (err) => {}, true);
            
            let msg = error.message;
            if (error.response && error.response.status === 404) {
                msg = "Server endpoint not found (404). Check if Render app is sleeping.";
            }
            api.sendMessage(`⚠️ Error: ${msg}`, event.threadID, event.messageID);
        }
    }
};
