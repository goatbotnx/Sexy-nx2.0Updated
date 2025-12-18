module.exports = {
  config: {
    name: "bank",
    version: "1.2",
    description: "Deposit, withdraw, earn interest, loan system",
    guide: {
      vi: "",
      en:
        `💫 {pn}Bank Commands 💫\n\n💖 Bank - Show bank features\n💙 Bank balance - Show your balance\n💛 Bank deposit [amount] - Deposit money\n💜 Bank withdraw [amount] - Withdraw money\n✨ Bank interest - Earn double after 6h\n🌷 Bank loan - Take a 20k loan\n😇 Bank repay [amount] - Repay your loan\n😍 Bank top - Top 10 richest users`
    },
    category: "Economy",
    countDown: 1,
    role: 0,
    author: "〲T A N J I L ツ"
  },

  onStart: async function ({ message, event, args, usersData, api, commandName }) {
    const { MongoClient } = require("mongodb");
    const uri = "mongodb+srv://tanjil4:tanjil4@cluster0.lqh9lyk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    const client = new MongoClient(uri);

    await client.connect();
    const db = client.db("bankSystem");
    const users = db.collection("users");
    const uid = event.senderID;

    const action = args[0]?.toLowerCase();
    const amount = parseInt(args[1]);

    // Initialize user if not exists
    const user = await users.findOneAndUpdate(
      { uid },
      { $setOnInsert: { balance: 0, loan: 0, lastInterest: Date.now() } },
      { upsert: true, returnDocument: "after" }
    );

    switch (action) {
      case "balance": {
        return message.reply(`💙 your bank balance: ${user.value.balance}  $✨`);
      }

      case "deposit": {
        if (!amount || amount <= 0)
          return message.reply("🌷 example: Bank deposit 100");
        await users.updateOne({ uid }, { $inc: { balance: amount } });
        return message.reply(`💖 Deposited ${amount} $ successfully!`);
      }

      case "withdraw": {
  if (!amount || amount <= 0) {
    return message.reply("💖 Please enter a valid amount to withdraw. 🤗");
  }

  const userData = user.value;

  if (amount > userData.balance) {
    return message.reply("🪽 Not enough balance in your bank! 😢");
  }

  // 
  await users.updateOne({ uid }, { $inc: { balance: -amount } });

  // usersData 
  const currentMoney = await usersData.get(uid, "money") || 0;

  // 
  await usersData.set(uid, { money: currentMoney + amount });

  return message.reply(`✅ You withdrew $${amount} successfully! 🎀`);
}

      case "interest": {
  const cooldown = 6 * 60 * 60 * 1000; // 
  const currentTime = Date.now();
  const lastClaim = user.value.lastInterest || 0;
  const elapsed = currentTime - lastClaim;

  if (elapsed < cooldown) {
    const remaining = cooldown - elapsed;
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    return message.reply(`🕒 Please wait ${hours}h ${minutes}m ${seconds}s to claim interest again.`);
  }

  const earnedInterest = user.value.balance * 2;
  await users.updateOne(
    { uid },
    {
      $inc: { balance: earnedInterest },
      $set: { lastInterest: currentTime }
    }
  );

  return message.reply(`💸 You've earned $${earnedInterest} interest! Your new balance is $${user.value.balance + earnedInterest}`);
}

      case "loan": {
        if (user.value.loan > 0)
          return message.reply("👀 You already have a loan. Repay first.");
        await users.updateOne({ uid }, { $inc: { balance: 20000, loan: 20000 } });
        return message.reply(
          `😍 You received a loan of 20,000 $💸\n💫 Please repay within 3 days.`
        );
      }

      case "repay": {
        if (!amount || amount <= 0)
          return message.reply("💛 example: Bank repay 1000");
        if (user.value.loan <= 0)
          return message.reply("💙 You don’t have any active loans.");
        if (user.value.balance < amount)
          return message.reply("💫 Not enough balance to repay.");
        const repayment = Math.min(amount, user.value.loan);
        await users.updateOne(
          { uid },
          { $inc: { loan: -repayment, balance: -repayment } }
        );
        return message.reply(`💖 Repaid ${repayment} $ ✨. Remaining loan: ${user.value.loan - repayment} $✨`);
      }

       case "top": {
  const topUsers = await users
    .find({ balance: { $gt: 0 } })
    .sort({ balance: -1 })
    .limit(10)
    .toArray();

  if (topUsers.length === 0) {
    return message.reply("😶 No top users found. 💭");
  }

  // 
  function formatNumber(number) {
    if (number >= 1e18) return (number / 1e18).toFixed(2) + "Qi";
    if (number >= 1e15) return (number / 1e15).toFixed(2) + "Q";
    if (number >= 1e12) return (number / 1e12).toFixed(2) + "T";
    if (number >= 1e9) return (number / 1e9).toFixed(2) + "B";
    if (number >= 1e6) return (number / 1e6).toFixed(2) + "M";
    if (number >= 1e3) return (number / 1e3).toFixed(2) + "K";
    return number.toString();
  }

  let topMsg = "👑 TOP 10 BANK USERS 👑\n✨━━━━━━━━━━━━━━━✨\n";

  for (let i = 0; i < topUsers.length; i++) {
    const user = topUsers[i];
    const formattedBalance = formatNumber(user.balance);
    try {
      const userInfo = await api.getUserInfo(user.uid);
      const name = userInfo[user.uid]?.name || "Unknown";
      topMsg += `${i + 1}. ${name}\n   ➤ Balance: ${formattedBalance} ($${user.balance}) 💸\n`;
    } catch (err) {
      topMsg += `${i + 1}. Unknown User\n   ➤ Balance: ${formattedBalance} ($${user.balance}) 💸\n`;
    }
  }

  return message.reply(topMsg.trim());
}

      default: {
        return message.reply(
          `
✨ Bank System Menu ✨
━━━━━━━━━━━━━━━━━━
💖 balance 

💙 deposit [amount]

💛 withdraw [amount]

💜 interest [2x]

🌷 loan [only 20000]

😇 repay [amount]

😍 top [10 richest user]  `
        );
      }
    }
  }
};
