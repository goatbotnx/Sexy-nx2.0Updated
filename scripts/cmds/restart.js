const fs = require("fs-extra");
const allowedUIDs = [
    "100081088184521", 
    "61583129938292"  
];

module.exports = {
	config: {
		name: "restart",
		version: "1.2",
		author: "xalman",
		countDown: 5,
		role: 0, 
		description: {
			vi: "Khởi động lại bot",
			en: "Restart bot"
		},
		category: "Owner",
		guide: {
			vi: "   {pn}: Khởi động lại bot",
			en: "   {pn}: Restart bot"
		}
	},

	langs: {
		vi: {
			restartting: "🔄 | Đang khởi động lại bot...",
			noPerm: "❌ | Bạn không có quyền dùng lệnh này!"
		},
		en: {
			restartting: "🔄 | Restarting bot...",
			noPerm: "❌ | You don't have permission to use this command!"
		}
	},

	onLoad: function ({ api }) {
		const pathFile = `${__dirname}/tmp/restart.txt`;
		if (fs.existsSync(pathFile)) {
			const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
			api.sendMessage(`✅ | Bot restarted\n⏰ | Time: ${(Date.now() - time) / 1000}s`, tid);
			fs.unlinkSync(pathFile);
		}
	},

	onStart: async function ({ message, event, getLang }) {

		
		if (!allowedUIDs.includes(event.senderID)) {
			return message.reply(getLang("noPerm"));
		}

		const pathFile = `${__dirname}/tmp/restart.txt`;
		fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
		await message.reply(getLang("restartting"));
		process.exit(2);
	}
};
