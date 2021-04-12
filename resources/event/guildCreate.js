const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = async (client, guild) => {
    let new1 = await db.get(guild.id)
    if (!new1) {
        db.set(guild.id, {
            settings: { volume: 50, maxvolume: 100, nowplaying: true, timeout: 60000, filters: { bassboost: false, nightcore: false, karaoke: false } }
          });
        console.log(`I have joined to ${guild.name}`);
    } else {
    }
}