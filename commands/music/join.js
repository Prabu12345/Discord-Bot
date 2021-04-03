const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
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
        duration: 10
      },
    });
  }

  run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | Join a channel and try again`)
      message.say(errleaveEmbed);
      return;
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      if(message.guild.me.voice.channel) {
        return message.channel.send(`${xmoji} | I already in voice channel, ${message.author}`);
      }
    } else if (message.guild.musicData.isPlaying == true) {
      return message.channel.send(`${xmoji} | I already in voice channel, ${message.author}`);
    }
    try {
      if (message.guild.musicData.queue.length === 0){
        voiceChannel.join()
      } else {
        message.guild.musicData.isPlaying = true
        playSong(message.guild.musicData.queue, message, 0);
      }
      console.log(`1` + message.channel)
      console.log(`2` + message.member.voice.channel)
      console.log(`3` + message.channel.name)
      console.log(`4` + message.member.voice.channel.name)
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${cmoji} | **Joined** \`${message.channel.name}\` **and bound to** \`${message.guild.me.voice.channel.name}\``)
      message.say(errleaveEmbed);
    } catch {
      return message.reply(':x: | Something went wrong when joining channels');
    }
  }
};
