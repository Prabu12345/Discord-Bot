const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");
const { normalcolor, errorcolor } = require('../config.json')
const Pagination = require('discord-paginationembed');

module.exports = class MyPlaylistsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'my-playlists',
      aliases: ['mps', 'my-saved-queues', 'playlists'],
      group: 'music',
      memberName: 'my-playlists',
      guildOnly: true,
      description: 'List your saved playlists'
    });
  }

  async run(message) {
    // check if user has playlists or user is in the db
    const dbUserFetch = await db.get(`${message.member.id}.savedPlaylist`);
    if (!dbUserFetch) {
      message.reply('You have zero saved playlists!');
      return;
    }
    const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
    if (savedPlaylistsClone.length == 0) {
      message.reply('You have zero saved playlists!');
      return;
    }
    const playlistsEmbed = new Pagination.FieldsEmbed()
      .setArray(savedPlaylistsClone)
      .setAuthorizedUsers([message.author.id])
      .setChannel(message.channel)
      .setElementsPerPage(5)
      .formatField('# - Playlist', function(e) {
        return `**${savedPlaylistsClone.indexOf(e) + 1}**: ${e.name}`;
      });

    playlistsEmbed.embed.setColor(normalcolor).setTitle('💾 My Saved Playlists').setFooter(`${savedPlaylistsClone.length}/8`);
    playlistsEmbed.build();
  }
};