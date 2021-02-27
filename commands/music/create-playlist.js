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

  async run(message, { playlistName }) {
    // check if the user exists in the db
    let new1 = await db.get(message.member.id)
    if (!new1) {
      db.createModel(message.member.id)
      db.set(message.member.id, { savedPlaylist: [] })
      new.push(`${message.member.id}.savedPlaylist`, { name: playlistName, userid: message.member.id, urls: [] })
      message.reply(`Created a new playlist named **${playlistName}**`);
      return;
    }
    let new2 = await db.get(`${message.member.id}.savedPlaylist`)
    // make sure the playlist name isn't a duplicate
    for (let i = 0; i < new2.length; i++) {
        if (
            new2.savedPlaylist[i].name == playlistName
        ) {
          message.reply(
            `There is already a playlist named **${playlistName}** in your saved playlists!`
          );
          return;
        }
    }
    // create and save the playlist in the db
    db.push(${message.member.id}.savedPlaylist, { name: playlistName, userid: message.member.id, urls: [] });
    message.reply(`Created a new playlist named **${playlistName}**`);
  }
};