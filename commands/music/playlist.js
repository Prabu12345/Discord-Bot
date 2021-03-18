const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");
const { playSong } = require('../music/play')

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'playlist',
      group: 'music',
      memberName: 'playlist',
      guildOnly: true,
      description: 'Create and save playlist',
      args: [
        {
          key: 'type',
          prompt: 'What is the name of the playlist you would like to create?',
          type: 'string',
          default: ''
        },
        {
            key: 'additional',
            prompt: 'What is the name of the playlist you would like to create?',
            type: 'string',
            default: ''
          }
      ]
    });
  }

  async run(message, { type, additional }) {
    if (type.toLowerCase() == 'play') {
        const voiceChannel = message.member.voice.channel;
        if (additional == '') return message.channel.send('You must include a name for this playlist.')
        if (!voiceChannel) {
            const errvideoEmbed = new MessageEmbed()
            .setColor(errorcolor)
            .setDescription('Join a channel and try again')
            message.say(errvideoEmbed);
            return;
        }
        if (message.guild.triviaData.isTriviaRunning == true) {
            const errvideoEmbed = new MessageEmbed()
            .setColor(errorcolor)
            .setDescription('Please try after the trivia has ended')
            message.say(errvideoEmbed);
            return;
        }
        const userPlaylists = await db.get(`${message.member.id}.savedPlaylist`);
        const found = userPlaylists.find(element => element.name == additional);
        if (found) {
            const urlsArray = userPlaylists[userPlaylists.indexOf(found)].urls;
            if (!urlsArray.length) {
                message.reply(
                  `\`${additional}\` playlist is empty, add songs to it before attempting to play it`
                );
                return;
            }
            urlsArray.map(element =>
                message.guild.musicData.queue.push(element)
            );
            if (message.guild.musicData.isPlaying) {
                message.reply(`🎵 **${additional}** added ${urlsArray.length} songs to the queue!`);
            } else if (!message.guild.musicData.isPlaying) {
                message.guild.musicData.isPlaying = true;
                message.reply(`🎵 **${additional}** added ${urlsArray.length} songs to the queue!`);
                playSong(message.guild.musicData.queue, message, 0);
            }   
        } else {
            message.reply(`You have no playlist named ${additional}`)
        }
    } else if (type.toLowerCase() == 'add') {
        return message.client.commands.get("save-to-playlist").run(message, '');
    } else if (type.toLowerCase() == 'remove') {
        return message.client.commands.get("remove-from-playlist").run(message, '');
    } else if (type.toLowerCase() == 'create') {
        return message.client.commands.get("create-playlist").run(message, '');
    } else if (type.toLowerCase() == 'delete') {
        return message.client.commands.get("delete-playlist").run(message, '');
    } else if (type.toLowerCase() == 'see') {
        return message.client.commands.get("see-playlist").run(message, '');
    } else if (type.toLowerCase() == '') {
        
    }
  }
};