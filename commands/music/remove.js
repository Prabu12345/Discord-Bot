const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      group: 'music',
      description: 'Remove a specific song from queue',
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          type: 'integer'
        }
      ]
    });
  }
  run(message, { songNumber }) {
    const errremoveEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (songNumber < 1 || songNumber > message.guild.musicData.queue.length) {
      errremoveEmbed.setDescription('Please enter a valid song number')
      return message.say(errremoveEmbed);
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errremoveEmbed.setDescription('Join a channel and try again')
      message.say(errremoveEmbed);
      return;
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errremoveEmbed.setDescription('There is no song playing right now!')
      message.say(errremoveEmbed);
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errremoveEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errremoveEmbed);
      return;
    }
    const removeEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`Removed song number ${songNumber} from queue`)
    message.guild.musicData.queue.splice(songNumber - 1, 1);
    message.say(removeEmbed);
  }
};
