const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");

module.exports = class DeletePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'delete-playlist',
      group: 'music',
      memberName: 'delete-playlist',
      guildOnly: true,
      description: 'Delete a playlist from your saved playlists',
      args: [
        {
          key: 'playlistName',
          prompt: 'Which playlist would you like to delete?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { playlistName }) {
    // check if user has playlists or user is in the db
    const dbUserFetch = await db.get(message.member.id);
    if (!dbUserFetch) {
      message.reply('You have zero saved playlists!');
      return;
    }
    const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
    if (savedPlaylistsClone.length == 0) {
      message.reply('You have zero saved playlists!');
      return;
    }

    let found = false;
    let location;
    for (let i = 0; i < savedPlaylistsClone.length; i++) {
      if (savedPlaylistsClone[i].name == playlistName) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      savedPlaylistsClone.splice(location, 1);
      db.set(message.member.id, { savedPlaylist: savedPlaylistsClone });
      message.reply(`I removed **${playlistName}** from your saved playlists!`);
    } else {
      message.reply(`You have no playlist named ${playlistName}`);
    }
  }
};