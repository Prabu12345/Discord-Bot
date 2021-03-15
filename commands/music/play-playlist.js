const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");
const { playSong } = require('../music/play')

module.exports = class DisplayPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play-playlist',
      group: 'music',
      aliases: ['play-saved-songs'],
      memberName: 'play-playlist',
      guildOnly: true,
      description: 'Play a saved Playlists',
      args: [
        {
          key: 'playlistName',
          prompt: 'What is the name of the playlist you would like to display?',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { playlistName }) {
    const userPlaylists = await db.get(`${message.member.id}.savedPlaylist`);
    const found = userPlaylists.find(element => element.name == playlistName);
    if (found) {
        const urlsArray = userPlaylists[userPlaylists.indexOf(found)].urls;
        if (!urlsArray.length) {
            message.reply(
              `\`${playlistName}\` playlist is empty, add songs to it before attempting to play it`
            );
            return;
        }
        urlsArray.map(element =>
            message.guild.musicData.queue.push(element)
        );
        if (message.guild.musicData.isPlaying) {
            message.reply(`🎵 **${query}** added ${urlsArray.length} songs to the queue!`);
        } else if (!message.guild.musicData.isPlaying) {
            message.guild.musicData.isPlaying = true;
            message.reply(`🎵 **${query}** added ${urlsArray.length} songs to the queue!`);
            playSong(message.guild.musicData.queue, message, 0);
        }   
    } else {
        message.reply(`You have no playlist named ${playlistName}`)
    }
  }
};