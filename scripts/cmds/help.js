const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "〲MAYBE NX ";

module.exports = {
  config: {
    name: "help",
    version: "2.0",
    author: "xalman",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View command usage" },
    longDescription: { en: "View command usage" },
    category: "info",
    priority: 1,
    guide: {
      en:
        "{pn} [page]\n" +
        "{pn} <command>\n" +
        "{pn} <command> -u (usage)\n" +
        "{pn} <command> -i (info)\n" +
        "{pn} <command> -a (alias)\n" +
        "{pn} <command> -r (role)"
    }
  },

  langs: {
    en: {
      help:
        "╭───────────⦿\n%1\n✪──────⦿" +
        "\n✪ Page [ %2/%3 ]" +
        "\n│ Bot has %4 commands" +
        "\n│ Type %5help <page>" +
        "\n│ Type %5help <command>" +
        "\n✪──────⦿\n%6\n╰─────────────⦿",

      help2:
        "%1╭──────────⦿\n│ Total:「%2」 commands\n╰─────────────⦿" +
        "\n╭─────────────⦿\n%4╰────────────⦿",

      commandNotFound: `Command "%1" not found`,

      getInfoCommand:
        "⦿────── COMMAND INFO ──────⦿" +
        "\n✪ Name: %1" +
        "\n✪ Description: %2" +
        "\n✪ Aliases: %3" +
        "\n✪ Group Aliases: %4" +
        "\n✪ Version: %5" +
        "\n✪ Role: %6" +
        "\n✪ Cooldown: %7s" +
        "\n✪ Author: %8" +
        "\n✪ Usage:\n» %9" +
        "\n⦿─────────────────⦿",

      onlyInfo:
        "╭────⦿ INFO ─────⦿" +
        "\n✪ Name: %1" +
        "\n✪ Description: %2" +
        "\n✪ Aliases: %3" +
        "\n✪ Group Aliases: %4" +
        "\n✪ Version: %5" +
        "\n✪ Role: %6" +
        "\n✪ Time: %7s" +
        "\n✪ Author: %8" +
        "\n╰─────────────⦿",

      onlyUsage: "╭───⦿ USAGE ─────⦿\n%1\n╰─────────────⦿",

      onlyAlias:
        "╭───⦿ ALIAS ─────⦿" +
        "\n✪ Aliases: %1" +
        "\n✪ Group Aliases: %2" +
        "\n╰─────────────⦿",

      onlyRole: "╭────⦿ ROLE ───⦿\n✪ %1\n╰─────────────⦿",

      doNotHave: "None",

      roleText0: "0 (All users)",
      roleText1: "1 (Group admins)",
      roleText2: "2 (Bot admin)",
      roleText0setRole: "0 (Custom: all users)",
      roleText1setRole: "1 (Custom: group admins)",

      pageNotFound: "Page %1 does not exist"
    }
  },

  // MAIN FUNCTION
  onStart: async function ({ message, args, event, threadsData, getLang, role }) {
    const langCode =
      (await threadsData.get(event.threadID, "data.lang")) ||
      global.GoatBot.config.language;

    let customLang = {};
    const pathCustomLang = path.normalize(
      `${process.cwd()}/languages/cmds/${langCode}.js`
    );
    if (fs.existsSync(pathCustomLang)) customLang = require(pathCustomLang);

    const prefix = getPrefix(event.threadID);
    const threadData = await threadsData.get(event.threadID);

    let sortHelp = threadData.settings.sortHelp || "category";
    if (!["category", "name"].includes(sortHelp)) sortHelp = "name";

    const commandName = (args[0] || "").toLowerCase();
    const command =
      commands.get(commandName) || commands.get(aliases.get(commandName));

    // ---------- LIST ALL COMMANDS ----------
    if ((!command && !args[0]) || !isNaN(args[0])) {
      const arrayInfo = [];
      let msg = "";

      // ===== SORT BY NAME =====
      if (sortHelp === "name") {
        const page = parseInt(args[0]) || 1;
        const perPage = 30;

        for (const [name, value] of commands) {
          if (value.config.role > role) continue;

          let desc = name;
          let short =
            customLang[name]?.shortDescription ||
            value.config.shortDescription;

          if (short)
            short = checkLangObject(short, langCode);

          if (short)
            desc += ": " + cropContent(short, 50);

          arrayInfo.push({ data: desc });
        }

        arrayInfo.sort((a, b) => a.data.localeCompare(b.data));

        const total = arrayInfo.length;
        const totalPage = Math.ceil(total / perPage);

        if (page < 1 || page > totalPage)
          return message.reply(getLang("pageNotFound", page));

        const list = arrayInfo.slice((page - 1) * perPage, page * perPage);

        msg += list
          .map((item, i) => `✵${i + 1 + (page - 1) * perPage}. ${item.data}`)
          .join("\n");

        return message.reply(
          getLang("help", msg, page, totalPage, commands.size, prefix, doNotDelete)
        );
      }

      // ===== SORT BY CATEGORY (OPTIMIZED + FIXED NEW LINE) =====
      if (sortHelp === "category") {
        const categories = {};

        for (const [, value] of commands) {
          if (value.config.role > role) continue;

          const cat = value.config.category?.toLowerCase() || "other";
          if (!categories[cat]) categories[cat] = [];
          categories[cat].push(value.config.name);
        }

        
