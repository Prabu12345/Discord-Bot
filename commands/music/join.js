const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { playSong } = require('../music/play');

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
    } else if (message.guild.musicData.isPlaying == true) {
      return message.channel.send(`I already in voice channel, ${message.author}`);
    }
    try {
      if (message.guild.musicData.queue.length == 0){
        voiceChannel.join()
      } else {
        message.guild.musicData.isPlaying = true
        playSong(message.guild.musicData.queue, message, 0);
      }
      message.react('👌')
    } catch {
      return message.reply(':x: Something went wrong when joining channels');
    }
  }
};
