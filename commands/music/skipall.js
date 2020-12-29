const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class SkipAllCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipall',
      aliases: ['skip-all'],
      memberName: 'skipall',
      group: 'music',
      description: 'Skip all songs in queue',
      guildOnly: true
    });
  }

  run(message) {
    const errskipallEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errskipallEmbed.setDescription('Join a channel and try again')
      return message.say(errskipallEmbed)
    };

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskipallEmbed.setDescription('There is no song playing right now!')
      return message.say(errskipallEmbed)
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskipallEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      return message.say(errskipallEmbed)
    }
    if (!message.guild.musicData.queue) {
      errskipallEmbed.setDescription('There are no songs in queue')
      return message.say(errskipallEmbed)
    };
    message.guild.musicData.queue.length = 0; // clear queue
    message.guild.musicData.songDispatcher.end();
    message.react('⏭️');
    message.guild.musicData.loop = 'off';
    return;
  }
};
