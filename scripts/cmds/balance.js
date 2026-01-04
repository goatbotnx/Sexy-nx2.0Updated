const { config } = global.GoatBot;
const { createCanvas, loadImage, registerFont } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: "balance",
        aliases: ["bal", "money"],
        version: "3.0.0",
        author: "xalman",
        countDown: 5,
        role: 0,
        description: "View your balance on a premium Visa card with custom styling",
        category: "economy",
        guide: { en: "{pn} | {pn} @tag" }
    },

    onStart: async function ({ message, usersData, event, args }) {
        const senderID = event.senderID;
        const cardImageURL = "https://i.postimg.cc/N0VqRMFB/Screenshot-20260105-004415.png"; 

        const getTargetUID = () => {
            if (event.messageReply) return event.messageReply.senderID;
            if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
            if (args[0] && !isNaN(args[0])) return args[0];
            return null;
        };

        const createVisaCard = async (name, balance, uid) => {
            const canvas = createCanvas(800, 500);
            const ctx = canvas.getContext('2d');

            try {
                const baseImage = await loadImage(cardImageURL);
                ctx.drawImage(baseImage, 0, 0, 800, 500);
                try {
                    const avatarURL = `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
                    const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
                    const avatarImg = await loadImage(Buffer.from(response.data));

                    ctx.save();
                    ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
                    ctx.shadowBlur = 15;
                    ctx.beginPath();
                    ctx.arc(650, 130, 75, 0, Math.PI * 2, true);
                    ctx.closePath();
                    ctx.clip();
                    ctx.drawImage(avatarImg, 575, 55, 150, 150);
                    ctx.restore();

                    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
                    ctx.lineWidth = 4;
                    ctx.stroke();
                } catch (err) {
                    console.log("Avatar load failed");
                }

                ctx.save();
                ctx.shadowColor = "rgba(0,0,0,0.8)";
                ctx.shadowBlur = 8;
                ctx.fillStyle = "#FFFFFF";
                ctx.font = "20px Arial";
                ctx.globalAlpha = 0.7;
                ctx.fillText("AVAILABLE BALANCE", 80, 280);
                ctx.globalAlpha = 1.0;
                ctx.font = "bold 75px sans-serif"; 
                ctx.fillText(`$${Number(balance).toLocaleString()}`, 80, 350);
                ctx.font = "32px monospace";
                ctx.letterSpacing = "4px"; 
                const formattedUID = uid.toString().padEnd(16, '0').match(/.{1,4}/g).join("  ");
                ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
                ctx.fillText(formattedUID, 80, 410);
                ctx.font = "bold 30px Arial";
                ctx.shadowBlur = 3;
                ctx.fillText(name.toUpperCase(), 80, 460);
                ctx.font = "14px Arial";
                ctx.fillText("VALID THRU: 12/29", 350, 460);
                ctx.restore();

                const cachePath = path.join(__dirname, "cache");
                if (!fs.existsSync(cachePath)) fs.mkdirSync(cachePath);
                
                const cardPath = path.join(cachePath, `visa_${uid}.png`);
                fs.writeFileSync(cardPath, canvas.toBuffer());
                return cardPath;
            } catch (e) {
                console.error(e);
                return null;
            }
        };

        if (!args[0] || (args[0] && !["add", "delete", "transfer"].includes(args[0]))) {
            const targetID = getTargetUID() || senderID;
            const userData = await usersData.get(targetID);
            if (!userData) return message.reply("User not found!");

            message.reply("Loading please wait ✨");
            const cardImage = await createVisaCard(userData.name || "Global User", userData.money || 0, targetID);
            
            if (!cardImage) return message.reply("❌ Failed to create card.");

            return message.reply({
                body: `✨ Premium Visa Card: ${userData.name}`,
                attachment: fs.createReadStream(cardImage)
            }, () => {
                if(fs.existsSync(cardImage)) fs.unlinkSync(cardImage);
            });
        }

        if (args[0] === "transfer") {
            const targetUID = getTargetUID();
            const amount = parseInt(args[args.length - 1]);
            if (!targetUID || isNaN(amount) || amount <= 0) return message.reply("❌ Usage: balance transfer @tag 100");

            const senderData = await usersData.get(senderID);
            if (Number(senderData.money) < amount) return message.reply("❌ Insufficient balance!");

            const receiverData = await usersData.get(targetUID);
            await usersData.set(senderID, { money: (Number(senderData.money) - amount).toString() });
            await usersData.set(targetUID, { money: (Number(receiverData.money || 0) + amount).toString() });

            return message.reply(`✅ Transferred $${amount} to ${receiverData.name}`);
        }
    }
};
