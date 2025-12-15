const fs = require("fs-extra");

const getStreamFromURL = global.utils.getStreamFromURL;

const gifList = [
	"https://i.postimg.cc/D0Tmyxtq/4.webp",
	"https://i.postimg.cc/XvPQhCT7/3.webp",
	"https://i.postimg.cc/mgMWtjRD/xalman.webp"
];

function getRandomGif() {
	return gifList[Math.floor(Math.random() * gifList.length)];
}

module.exports = {
	config: {
		name: "prefix",
		version: "1.8",
		author: "NTKhang + Modified & Fixed by xalman",
		countDown: 5,
		role: 0,
		description: "Change bot prefix",
		category: "config"
	},

	langs: {
		en: {
			reset: "✅ Prefix reset to default:\n➡️ System prefix: %1",
			onlyAdmin: "⛔ Only admin can change global prefix.",
			confirmGlobal: "⚙️ Global prefix change requested.\n👍 React to confirm.",
			confirmThisThread: "🛠️ Group prefix change requested.\n👍 React to confirm.",
			successGlobal: "✅ Global prefix changed!\n🆕 New prefix: %1",
			successThisThread: "✅ Group prefix updated!\n🆕 New prefix: %1"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0]) return message.SyntaxError();

		const gif = getRandomGif();

		if (args[0] === "reset") {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply({
				body: getLang("reset", global.GoatBot.config.prefix),
				attachment: await getStreamFromURL(gif)
			});
		}

		const newPrefix = args[0];
		const setGlobal = args[1] === "-g";

		if (setGlobal && role < 2)
			return message.reply(getLang("onlyAdmin"));

		const confirmMsg = setGlobal
			? getLang("confirmGlobal")
			: getLang("confirmThisThread");

		return message.reply({
			body: confirmMsg,
			attachment: await getStreamFromURL(gif)
		}, (err, info) => {
			if (err) return;

			global.GoatBot.onReaction.set(info.messageID, {
				commandName,
				author: event.senderID,
				newPrefix,
				setGlobal
			});
		});
	},

	onReaction: async function ({ message, threadsData, event, reaction, getLang }) {
		if (event.userID !== reaction.author) return;
		if (event.reaction !== "👍") return;

		global.GoatBot.onReaction.delete(event.messageID);

		if (reaction.setGlobal) {
			global.GoatBot.config.prefix = reaction.newPrefix;
			fs.writeFileSync(
				global.client.dirConfig,
				JSON.stringify(global.GoatBot.config, null, 2)
			);
			return message.reply(getLang("successGlobal", reaction.newPrefix));
		} else {
			await threadsData.set(event.threadID, reaction.newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", reaction.newPrefix));
		}
	},

	onChat: async function ({ event, message }) {
		if (event.body?.toLowerCase() === "prefix") {
			const gif = getRandomGif();

			const systemPrefix = global.GoatBot.config.prefix;
			const groupPrefix = global.utils.getPrefix(event.threadID);

			return message.reply({
				body:
`╔═════ CHATBOT ═════╗
🌐 System Prefix : ${systemPrefix}
💬 Group Prefix  : ${groupPrefix}
╚══════════════════╝`,
				attachment: await getStreamFromURL(gif)
			});
		}
	}
};
