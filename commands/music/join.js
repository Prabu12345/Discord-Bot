const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      aliases: ['come'],
      group: 'music',
      memberName: 'join',
      guildOnly: true,
      description: 'Joins Voice Channel',
      throttling: {
        usages: 1,
        duration: 5
      },
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('Join a channel and try again')
      message.say(errleaveEmbed);
      return;
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      if(message.guild.me.voice.channel) {
        return message.channel.send(`I already in voice channel, ${message.author}`);
      }
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errleaveEmbed);
      return;
    }
    try {
      voiceChannel.join()
      message.react('👌')
    } catch {
      return message.reply(':x Something went wrong when joining channels');
    }
  }
};
