const fs = require("fs-extra");
const path = require("path");
const { utils } = global;

const gifList = [
	path.join(__dirname, "../assets/gifs/1.webp"),
	path.join(__dirname, "../assets/gifs/2.webp"),
	path.join(__dirname, "../assets/gifs/3.webp"),
	path.join(__dirname, "../assets/gifs/4.webp")
];

function getRandomGif() {
	return gifList[Math.floor(Math.random() * gifList.length)];
}

module.exports = {
	config: {
		name: "prefix",
		version: "2.0",
		author: "xnil Fixed by xalman",  // main creator NTKhang 
		countDown: 5,
		role: 0,
		description: "Change bot prefix (group/global) with random image",
		category: "config",
		guide: {
			en:
				"{pn} <new prefix>: change prefix in this group\n" +
				"{pn} <new prefix> -g: change global prefix (admin only)\n" +
				"{pn} reset: reset prefix"
		}
	},

	langs: {
		en: {
			reset: "✅ Prefix reset done!\n➡️ System prefix: %1",
			onlyAdmin: "⛔ Only bot admin can change global prefix.",
			confirmGlobal: "⚙️ Global prefix change requested.\n🪄 React to confirm.",
			confirmThisThread: "🛠️ Group prefix change requested.\n🪄 React to confirm.",
			successGlobal: "✅ Global prefix changed!\n🆕 New prefix: %1",
			successThisThread: "✅ Group prefix updated!\n🆕 New prefix: %1"
		}
	},

	onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
		if (!args[0]) return message.SyntaxError();

		const imgPath = getRandomGif();

		if (args[0] === "reset") {
			await threadsData.set(event.threadID, null, "data.prefix");
			return message.reply({
				body: getLang("reset", global.GoatBot.config.prefix),
				attachment: fs.createReadStream(imgPath)
			});
		}

		const newPrefix = args[0];
		const formSet = {
			commandName,
			author: event.senderID,
			newPrefix,
			setGlobal: args[1] === "-g"
		};

		if (formSet.setGlobal && role < 2)
			return message.reply(getLang("onlyAdmin"));

		const confirmMsg = formSet.setGlobal
			? getLang("confirmGlobal")
			: getLang("confirmThisThread");

		return message.reply(
			{
				body: confirmMsg,
				attachment: fs.createReadStream(imgPath)
			},
			(err, info) => {
				formSet.messageID = info.messageID;
				global.GoatBot.onReaction.set(info.messageID, formSet);
			}
		);
	},

	onReaction: async function ({ message, threadsData, event, reaction, getLang }) {
		const { author, newPrefix, setGlobal } = reaction;
		if (event.userID !== author) return;

		if (setGlobal) {
			global.GoatBot.config.prefix = newPrefix;
			fs.writeFileSync(
				global.client.dirConfig,
				JSON.stringify(global.GoatBot.config, null, 2)
			);
			return message.reply(getLang("successGlobal", newPrefix));
		} else {
			await threadsData.set(event.threadID, newPrefix, "data.prefix");
			return message.reply(getLang("successThisThread", newPrefix));
		}
	},

	onChat: async function ({ event, message }) {
		if (event.body?.toLowerCase() === "prefix") {
			const systemPrefix = global.GoatBot.config.prefix;
			const groupPrefix = utils.getPrefix(event.threadID);
			const imgPath = getRandomGif();

			return message.reply({
				body:
`╔═════ CHATBOT ═════╗
🌐 System Prefix : ${systemPrefix}
💬 Group Prefix  : ${groupPrefix}
╚══════════════════╝`,
				attachment: fs.createReadStream(imgPath)
			});
		}
	}
};
