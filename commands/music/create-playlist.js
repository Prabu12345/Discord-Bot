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
      db.set(message.member.id, {
        savedPlaylist: [{ name: playlistName, urls: [] }]
      });
      message.reply(`Created a new playlist named **${playlistName}**`);
      return;
    }
    let new2 = await db.get(`${message.member.id}.savedPlaylist`)
    if(new2.length >= 8){
      message.reply(`There is already reached limit of playlist!`);
      return;
    }
    // make sure the playlist name isn't a duplicate
    for (let i = 0; i < new2.length; i++) {
        if (
            new2[i].name == playlistName
        ) {
          message.reply(
            `There is already a playlist named **${playlistName}** in your saved playlists!`
          );
          return;
        }
    }
    // create and save the playlist in the db
    db.push(`${message.member.id}.savedPlaylist`, { name: playlistName, urls: [] });
    message.reply(`Created a new playlist named **${playlistName}**`);
  }
};