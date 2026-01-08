const { createCanvas, loadImage } = require('canvas');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

module.exports = {
    config: {
        name: "rank",
        version: "3.0",
        author: "xalman",
        countDown: 10,
        role: 0,
        description: "Rank Card for money and exp ",
        category: "system",
        guide: "{pn}"
    },

    onStart: async function ({ api, event, usersData }) {
        const { threadID, messageID, senderID } = event;

        api.setMessageReaction("⌛", event.messageID, (err) => {}, true);

        try {
            const allUsers = await usersData.getAll();
            const userData = await usersData.get(senderID);
            if (!userData) return api.sendMessage("User data not found!", threadID, messageID);

            const moneyRank = allUsers.sort((a, b) => (b.money || 0) - (a.money || 0)).findIndex(u => u.userID == senderID) + 1;
            const expRank = allUsers.sort((a, b) => (b.exp || 0) - (a.exp || 0)).findIndex(u => u.userID == senderID) + 1;

            const name = (userData.name || "User").toUpperCase();
            const exp = userData.exp || 0;
            const level = Math.floor(Math.sqrt(1 + (4 * exp) / 3) / 2);
            const nextLevelExp = Math.pow((level + 1) * 2, 2) * 3 / 4;
            const progress = Math.min((exp / nextLevelExp) * 100, 100);
            const canvas = createCanvas(1050, 550);
            const ctx = canvas.getContext('2d');

            ctx.fillStyle = "#0a0a0a";
            drawRoundedRect(ctx, 10, 10, 1030, 530, 40);
            ctx.fill();
            ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            drawRoundedRect(ctx, 30, 30, 990, 490, 30);
            ctx.clip();
            ctx.fillStyle = "#000000";
            ctx.fillRect(0, 0, 1050, 550);

            const addGlow = (x, y, r, color) => {
                const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
                grd.addColorStop(0, color);
                grd.addColorStop(1, 'transparent');
                ctx.globalAlpha = 0.4;
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 1050, 550);
            };
            addGlow(200, 150, 500, '#001eff'); 
            addGlow(900, 150, 450, '#00ff40'); 
            addGlow(500, 450, 400, '#ffee00'); 
            ctx.globalAlpha = 1.0;

            for (let i = 0; i < 180; i++) {
                ctx.fillStyle = `rgba(255, 255, 255, ${Math.random()})`;
                ctx.beginPath();
                ctx.arc(Math.random() * 1050, Math.random() * 550, Math.random() * 1.5, 0, Math.PI * 2);
                ctx.fill();
            }

            const avatarURL = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            try {
                const response = await axios.get(avatarURL, { responseType: 'arraybuffer' });
                const avatar = await loadImage(Buffer.from(response.data));
                ctx.save();
                ctx.shadowBlur = 20; ctx.shadowColor = "#ffffff";
                ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4;
                ctx.beginPath(); ctx.arc(220, 275, 110, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc(220, 275, 100, 0, Math.PI * 2); ctx.clip();
                ctx.drawImage(avatar, 120, 175, 200, 200);
                ctx.restore();
            } catch (e) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath(); ctx.arc(220, 275, 100, 0, Math.PI * 2); ctx.fill();
            }

            ctx.textAlign = "left";
            ctx.font = "italic bold 60px sans-serif";
            const nameGrd = ctx.createLinearGradient(400, 0, 950, 0);
            nameGrd.addColorStop(0, "#001eff"); 
            nameGrd.addColorStop(0.5, "#00ff40"); 
            nameGrd.addColorStop(1, "#ffee00"); 
            ctx.fillStyle = nameGrd;
            ctx.fillText(name, 400, 140);

            const drawStylishBox = (x, y, w, h, label, val, color) => {
                ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
                drawRoundedRect(ctx, x, y, w, h, 15); ctx.fill();
                ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.stroke();
                ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "rgba(255,255,255,0.8)";
                ctx.fillText(label, x + 25, y + 40);
                ctx.font = "bold 35px sans-serif"; ctx.fillStyle = color;
                ctx.textAlign = "right"; ctx.fillText(val, x + w - 25, y + 45);
                ctx.textAlign = "left";
            };

            drawStylishBox(400, 195, 500, 75, "TOP MONEY RANK", `#${moneyRank}`, "#00ff40");
            drawStylishBox(400, 290, 500, 75, "TOP EXP RANK", `#${expRank}`, "#ffee00");

            ctx.font = "bold 24px sans-serif"; ctx.fillStyle = "#ffffff";
            ctx.fillText(`LEVEL: ${level}`, 400, 410);

            ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
            drawRoundedRect(ctx, 400, 435, 520, 10, 5); ctx.fill();
            const barWidth = (progress / 100) * 520;
            ctx.fillStyle = "#00ff40";
            if (barWidth > 10) {
                drawRoundedRect(ctx, 400, 435, barWidth, 10, 5);
                ctx.fill();
            }
            ctx.restore();

            const imgPath = path.join(__dirname, 'cache', `rank_final_${senderID}.png`);
            if (!fs.existsSync(path.join(__dirname, 'cache'))) fs.mkdirSync(path.join(__dirname, 'cache'));
            fs.writeFileSync(imgPath, canvas.toBuffer());

            const messageBody = `✨ 𝗥𝗔𝗡𝗞 𝗖𝗔𝗥𝗗 ✨\n━━━━━━━━━━━━━━━━━━\n👤 𝐍𝐚𝐦𝐞: ${name}\n🆙 𝐋𝐞𝐯𝐞𝐥: ${level}\n🏆 𝐌𝐨𝐧𝐞𝐲 𝐑𝐚𝐧𝐤: #${moneyRank}\n📈 𝐄𝐱𝐩 𝐑𝐚𝐧𝐤: #${expRank}\n━━━━━━━━━━━━━━━━━━\n📊 𝐏𝐫𝐨𝐠𝐫𝐞𝐬𝐬: ${Math.round(progress)}%`;

            return api.sendMessage({
                body: messageBody,
                attachment: fs.createReadStream(imgPath)
            }, threadID, () => { 
                if(fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
                api.setMessageReaction("✅", event.messageID, (err) => {}, true);
            }, messageID);

        } catch (error) {
            console.error(error);
            api.sendMessage(`❌ Error: ${error.message}`, threadID, messageID);
        }
    }
};

function drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
