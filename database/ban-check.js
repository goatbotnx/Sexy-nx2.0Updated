const Ban = require("./models/Ban");

module.exports = {
  async isBanned(userId) {
    const found = await Ban.findOne({ userId: String(userId) });
    return !!found;
  },

  async addBan(userId, reason, adminId) {
    const exists = await Ban.findOne({ userId: String(userId) });
    if (exists) return false;

    await Ban.create({
      userId: String(userId),
      reason: reason || "No reason",
      bannedBy: adminId
    });

    return true;
  },

  async removeBan(userId) {
    const res = await Ban.deleteOne({ userId: String(userId) });
    return res.deletedCount > 0;
  },

  async getAllBans() {
    return await Ban.find();
  }
};
