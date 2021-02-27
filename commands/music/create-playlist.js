const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'create-playlist',
      group: 'music',
      memberName: 'create-playlist',
      guildOnly: true,
      description: 'Create a playlist',
      args: [
        {
          key: 'playlistName',
          prompt: 'What is the name of the playlist you would like to create?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { playlistName }) {
    // check if the user exists in the db
    let giaaa = db.get('savedPlaylists')
    if (!giaaa){
        db.createModel('savedPlaylists')
    }
    if (giaaa.userid !== message.member.id) {
      db.set("savedPlaylists", { name: playlistName, userid: message.member.id, urls: [] })
      message.reply(`Created a new playlist named **${playlistName}**`);
      return;
    }
    // make sure the playlist name isn't a duplicate
    var savedPlaylistsClone = db.get("savedPlaylists");
    console.log(savedPlaylistsClone)
    if (
        savedPlaylistsClone.name == playlistName && savedPlaylistsClone.userid == message.member.id
    ) {
      message.reply(
        `There is already a playlist named **${playlistName}** in your saved playlists!`
      );
      return;
    }
    // create and save the playlist in the db
    db.push({ name: playlistName, userid: message.member.id, urls: [] });
    db.set(`savedPlaylists`, savedPlaylistsClone);
    message.reply(`Created a new playlist named **${playlistName}**`);
  }
};