const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { clientperm } = require('../../resources/permission')

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'leave',
      aliases: ['end'],
      group: 'music',
      memberName: 'leave',
      guildOnly: true,
      description: 'Leaves voice channel if in one',
      throttling: {
        usages: 1,
        duration: 10
      },
    });
  }

  async run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(`${xmoji} | Join a channel and try again`);
      return;
    }    
    const acces = await clientperm(message, ['EMBED_LINKS'], [])
    if (acces === true) {
    } else {
      return;
    }
    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      if (message.guild.me.voice.channel) {
        message.guild.musicData.loop = 'off';
        message.react('👌')
        setTimeout(() => {
          message.guild.me.voice.channel.leave();
        }, 100);
        return;
      } else {
        const errleaveEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There is no song playing right now!`)
        message.say(errleaveEmbed);
        return;
      }
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errleaveEmbed);
      return;
    } else if (!message.guild.musicData.queue) {
      const errleaveEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | There are no songs in queue`)
      message.say(errleaveEmbed);
      return;
    } else if (message.guild.musicData.songDispatcher.paused) {
      message.guild.musicData.songDispatcher.resume();
      message.guild.musicData.loop = 'off';
      message.guild.musicData.pause = false
      message.guild.musicData.isPlaying = false;
      message.guild.musicData.nowPlaying = null;
      setTimeout(() => {
        message.guild.me.voice.channel.leave();
      }, 200);
      message.react('👌')
      return;
    } else {
      message.guild.musicData.loop = 'off';
      message.guild.musicData.isPlaying = false;
      message.guild.musicData.nowPlaying = null;
      message.guild.musicData.songDispatcher = null;
      message.react('👌')
      setTimeout(() => {
        message.guild.me.voice.channel.leave();
      }, 100);
      return;
    }
  }
};
