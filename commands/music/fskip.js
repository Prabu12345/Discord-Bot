const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'fskip',
      aliases: ['fs', 'fc-song'],
      memberName: 'fskip',
      group: 'music',
      description: 'force Skip the current playing song',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  async run(message) {
    const voiceChannel = message.member.voice.channel;
    let role = await message.guild.roles.cache.find(role => role.name === 'DJ' || role.name === 'dj' || role.name === 'Dj');
    if (!role) { 
      if (message.guild.me.hasPermission("MANAGE_ROLES")) {
        return message.guild.roles.create({
          data: {
            name: 'DJ',
          },
          reason: 'we needed a role for DJ',
        })
        .then()
        .catch();
      }
      if (!message.member.hasPermission("MANAGE_GUILD")) {
        return message.channel.send("You don't have permission `MANAGE_GUILD` and role named *DJ*");
      }
    } else {
      if (!message.member.hasPermission("MANAGE_GUILD") || !message.member.roles.cache.get(role.id)) {
        return message.channel.send("You don't have permission `MANAGE_GUILD` and role named *DJ*");
      }
    }
    const errskipEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if(!message.member.roles.cache.get(role.id)) return message.channel.send("You don't have role named *DJ*");
    if (!voiceChannel) {
      errskipEmbed.setDescription(`${xmoji} | Join a channel and try again`)
      return message.say(errskipEmbed)
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskipEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errskipEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskipEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errskipEmbed);
      return;
    } else if (message.guild.triviaData.isTriviaRunning) {
      errskipEmbed.setDescription(`${xmoji} | You can't skip a trivia! Use end-trivia`)
      return message.say(errskipEmbed);
    }

      message.guild.musicData.sloop = message.guild.musicData.loop;
      message.guild.musicData.loop = 'off';
      message.guild.musicData.songDispatcher.end();
      message.react('⏭️');
      setTimeout(function onTimeOut() { message.guild.musicData.loop = message.guild.musicData.sloop }, 500);
  }
};
