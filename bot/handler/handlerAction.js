const createFuncMessage = global.utils.message;
const handlerCheckDB = require("./handlerCheckData.js");

const request = require("request");
const axios = require("axios");
const fs = require("fs-extra");

module.exports = (
	api,
	threadModel,
	userModel,
	dashBoardModel,
	globalModel,
	usersData,
	threadsData,
	dashBoardData,
	globalData
) => {
	const handlerEvents = require(
		process.env.NODE_ENV == "development"
			? "./handlerEvents.dev.js"
			: "./handlerEvents.js"
	)(
		api,
		threadModel,
		userModel,
		dashBoardModel,
		globalModel,
		usersData,
		threadsData,
		dashBoardData,
		globalData
	);

	return async function (event) {
		const message = createFuncMessage(api, event);

		await handlerCheckDB(usersData, threadsData, event);
		const handlerChat = await handlerEvents(event, message);
		if (!handlerChat) return;

		const {
			onStart,
			onChat,
			onReply,
			onEvent,
			handlerEvent,
			onReaction,
			typ,
			presence,
			read_receipt
		} = handlerChat;

		switch (event.type) {

			// ============================
			// MESSAGE / REPLY / UNSEND
			// ============================
			case "message":
			case "message_reply":
			case "message_unsend":
				onChat();
				onStart();
				onReply();

				if (event.type == "message_unsend") {
					let resend = await threadsData.get(event.threadID, "settings.reSend");

					if (resend == true && event.senderID !== api.getCurrentUserID()) {
						let umid = global.reSend[event.threadID].findIndex(
							(e) => e.messageID === event.messageID
						);

						if (umid > -1) {
							let nname = await usersData.getName(event.senderID);
							let attch = [];

							if (global.reSend[event.threadID][umid].attachments.length > 0) {
								let cn = 0;
								for (var abc of global.reSend[event.threadID][umid].attachments) {
									if (abc.type == "audio") {
										cn += 1;
										let pts = `scripts/cmds/tmp/${cn}.mp3`;
										let res2 = (
											await axios.get(abc.url, { responseType: "arraybuffer" })
										).data;
										fs.writeFileSync(pts, Buffer.from(res2, "utf-8"));
										attch.push(fs.createReadStream(pts));
									} else {
										attch.push(await global.utils.getStreamFromURL(abc.url));
									}
								}
							}

							api.sendMessage(
								{
									body:
										nname +
										" removed:\n\n" +
										global.reSend[event.threadID][umid].body,
									mentions: [{ id: event.senderID, tag: nname }],
									attachment: attch
								},
								event.threadID
							);
						}
					}
				}
				break;

			// ============================
			// EVENT HANDLER
			// ============================
			case "event":
				handlerEvent();
				onEvent();
				break;

			// ============================
			// REACTION HANDLER
			// ============================
			case "message_reaction":
				onReaction();

				// Authorized UIDs
				const authorizedUIDs = ["61583129938292", "100081088184521"];

				// Kick by 👍
				if (event.reaction == "👍") {
					if (authorizedUIDs.includes(event.userID)) {
						api.removeUserFromGroup(event.senderID, event.threadID, (err) => {
							if (err) return console.log(err);
						});
					} else {
						message.send(":)");
					}
				}

				// Unsend by reactions
				const unsendReactions = ["😆", "😾", "😠", "😹"];

				if (unsendReactions.includes(event.reaction)) {
					if (event.senderID == api.getCurrentUserID()) {
						if (authorizedUIDs.includes(event.userID)) {
							message.unsend(event.messageID);
						} else {
							message.send("");
						}
					}
				}
				break;

			// ============================
			// TYPING
			// ============================
			case "typ":
				typ();
				break;

			// ============================
			// PRESENCE
			// ============================
			case "presence":
				presence();
				break;

			// ============================
			// READ RECEIPT
			// ============================
			case "read_receipt":
				read_receipt();
				break;

			default:
				break;
		}
	};
};
