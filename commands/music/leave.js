const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['end'],
      group: 'music',
      memberName: 'leave',
      guildOnly: true,
      description: 'Leaves voice channel if in one'
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
        message.guild.musicData.loop = 'off';
      message.react('👌')
      setTimeout(() => {
        message.guild.me.voice.channel.leave();
      }, 100);
      return;
      } else {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('There is no song playing right now!')
      message.say(errleaveEmbed);
      return;
      }
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errleaveEmbed);
      return;
    } else if (!message.guild.musicData.queue) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('There are no songs in queue')
      message.say(errleaveEmbed);
      return;
    } else if (message.guild.musicData.songDispatcher.paused) {
      message.guild.musicData.songDispatcher.resume();
      message.guild.musicData.loop = 'off';
      message.guild.musicData.queue.length = 0;
      setTimeout(() => {
        message.guild.musicData.songDispatcher.end();
      }, 100);
      setTimeout(() => {
        message.guild.me.voice.channel.leave();
      }, 200);
      message.react('👌')
      
      return;
    } else {
      message.guild.musicData.queue.length = 0;
      message.guild.musicData.loop = 'off';
      message.guild.musicData.songDispatcher.end();
      message.react('👌')
      setTimeout(() => {
        message.guild.me.voice.channel.leave();
      }, 100);
      return;
    }
  }
};
