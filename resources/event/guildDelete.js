const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = async (client, guild) => {
    let new1 = await db.get(guild.id)
    if (!new1) {
        return;
    } else {
        db.delete(guild.id).then(() => console.log(`Deleted data, Because ${guild.name} has kicked out me from the server.`));
    }
}