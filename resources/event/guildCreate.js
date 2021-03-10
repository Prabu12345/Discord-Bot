const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = async (client, guild) => {
    let new1 = await db.get(guild.id)
    if (!new1) {
        db.createModel(guild.id)
        db.set(guild.id, { settings: [] })
        db.push(`${guild.id}.settings`, { volume: 50, timeout: 60000 })
        console.log(`I have joined to ${guild.name}`);
        return;
    } else {
        return;
    }
}