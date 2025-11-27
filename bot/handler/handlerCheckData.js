const { db, utils, GoatBot } = global;
const { config } = GoatBot;
const { log, getText } = utils;
const { creatingThreadData, creatingUserData } = global.client.database;
const { isBanned } = require("./database/ban-check");

async function ensureThreadData(threadID, threadsData) {
    if (!threadID) return;

    try {
        if (global.temp.createThreadDataError.includes(threadID)) return;

        const existing = creatingThreadData.find(t => t.threadID === threadID);
        if (existing) {
            await existing.promise;
            return;
        }

        if (global.db.allThreadData.some(t => t.threadID === threadID)) return;

        const threadData = await threadsData.create(threadID);
        log.info("DATABASE", `New Thread: ${threadID} | ${threadData.threadName} | ${config.database.type}`);
    } catch (err) {
        if (err.name !== "DATA_ALREADY_EXISTS") {
            global.temp.createThreadDataError.push(threadID);
            log.err("DATABASE", getText("handlerCheckData", "cantCreateThread", threadID), err);
        }
    }
}

async function ensureUserData(senderID, usersData) {
    if (!senderID) return;

    try {
        const existing = creatingUserData.find(u => u.userID === senderID);
        if (existing) {
            await existing.promise;
            return;
        }

        if (db.allUserData.some(u => u.userID === senderID)) return;

        const userData = await usersData.create(senderID);
        log.info("DATABASE", `New User: ${senderID} | ${userData.name} | ${config.database.type}`);
    } catch (err) {
        if (err.name !== "DATA_ALREADY_EXISTS") {
            log.err("DATABASE", getText("handlerCheckData", "cantCreateUser", senderID), err);
        }
    }
}

module.exports = async function (usersData, threadsData, event, api) {
    const threadID = event.threadID;
    const senderID = event.senderID || event.author || event.userID;

    // ———————————— BAN CHECK ———————————— //
    if (await isBanned(senderID)) {
        return api.sendMessage("🚫 তুমি এই bot ব্যবহার করতে পারবে না (banned user)।", threadID);
    }

    // ———————————— DATABASE CHECK ———————————— //
    await ensureThreadData(threadID, threadsData);
    await ensureUserData(senderID, usersData);
};
