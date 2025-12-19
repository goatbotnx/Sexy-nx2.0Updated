const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
config: {
name: "operator",
alias: ["o"],
version: "2",
author: "xalman",
countDown: 5,
role: 0, // everyone can use list
shortDescription: { en: "Operator system" },
longDescription: { en: "Add/remove operator (only owner), list operator (everyone)" },
category: "box chat",
guide: {
en: '   {pn} add <uid/@tag>\n   {pn} remove <uid/@tag>\n   {pn} list'
}
},

langs: {  
	en: {  
		added: "✅ | Added operator for %1 users:\n%2",  
		alreadyAdmin: "\n⚠️ | %1 users already operator:\n%2",  
		missingIdAdd: "⚠️ | Please enter ID or tag user to add",  
		removed: "✅ | Removed operator of %1 users:\n%2",  
		notAdmin: "⚠️ | %1 users are not operator:\n%2",  
		missingIdRemove: "⚠️ | Please enter ID or tag user to remove",  
		listAdmin: "👑 | Operator list:\n%1"  
	}  
},  

onStart: async function ({ message, args, usersData, event, getLang }) {  

	const senderID = event.senderID;
	const OWNER = "61583129938292"; // change if needed

	switch (args[0]) {

		// ======================================
		//               ADD OPERATOR
		// ======================================
		case "add":
		case "-a": {

			if (senderID !== OWNER)
				return message.reply("❌ | Only NX can add operator.");

			if (!args[1])
				return message.reply(getLang("missingIdAdd"));

			let uids = [];
			if (Object.keys(event.mentions).length > 0)
				uids = Object.keys(event.mentions);
			else if (event.messageReply)
				uids.push(event.messageReply.senderID);
			else
				uids = args.filter(arg => !isNaN(arg));

			const notAdminIds = [];
			const adminIds = [];

			for (const uid of uids) {
				if (config.adminBot.includes(uid))
					adminIds.push(uid);
				else
					notAdminIds.push(uid);
			}

			config.adminBot.push(...notAdminIds);

			const getNames = await Promise.all(
				uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
			);

			writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

			return message.reply(
				(notAdminIds.length > 0 ? getLang(
					"added",
					notAdminIds.length,
					getNames.filter(n => notAdminIds.includes(n.uid)).map(i => `• ${i.name} (${i.uid})`).join("\n")
				) : "")
				+ 
				(adminIds.length > 0 ? getLang(
					"alreadyAdmin",
					adminIds.length,
					adminIds.map(uid => `• ${uid}`).join("\n")
				) : "")
			);
		}

		// ======================================
		//             REMOVE OPERATOR
		// ======================================
		case "remove":
		case "-r": {

			if (senderID !== OWNER)
				return message.reply("❌ | Only NX can remove operator.");

			if (!args[1])
				return message.reply(getLang("missingIdRemove"));

			let uids = [];
			if (Object.keys(event.mentions).length > 0)
				uids = Object.keys(event.mentions);
			else if (event.messageReply)
				uids.push(event.messageReply.senderID);
			else
				uids = args.filter(arg => !isNaN(arg));

			const notAdminIds = [];
			const adminIds = [];

			for (const uid of uids) {
				if (config.adminBot.includes(uid))
					adminIds.push(uid);
				else
					notAdminIds.push(uid);
			}

			for (const uid of adminIds)
				config.adminBot.splice(config.adminBot.indexOf(uid), 1);

			const getNames = await Promise.all(
				adminIds.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
			);

			writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

			return message.reply(
				(adminIds.length > 0 ? getLang(
					"removed",
					adminIds.length,
					getNames.map(i => `• ${i.name} (${i.uid})`).join("\n")
				) : "")
				+
				(notAdminIds.length > 0 ? getLang(
					"notAdmin",
					notAdminIds.length,
					notAdminIds.map(uid => `• ${uid}`).join("\n")
				) : "")
			);
		}

		// ======================================
		//               LIST OPERATORS
		// ======================================
		case "list":
		case "-l": {

			const getNames = await Promise.all(
				config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
			);

			const ownerBox =
`╭━━━〔 👑 OWNER 〕━━━╮
│ Name : negative xalman (nx)
│ UID  : ${OWNER}
╰━━━━━━━━━━━━━━━━━━━━╯`;

			const operatorsBox =
`╭━━〔 🛠 OPERATOR LIST 〕━━╮
${getNames.length > 0
	? getNames.map(i => `│ • ${i.name} (${i.uid})`).join("\n")
	: "│ No Operators Found"}
╰━━━━━━━━━━━━━━━━━━━━━━╯`;

			return message.reply(ownerBox + "\n\n" + operatorsBox);
		}

		default:
			return message.SyntaxError();
	}
}
};
