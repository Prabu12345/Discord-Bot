const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')

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
    let role = await message.guild.roles.cache.find(role => role.name === 'DJ');
    if(!message.member.roles.cache.get(role.id)) return message.channel.send("You don't have the DJ role");
    if (message.member.roles.cache !== role) return message.reply('You dont have permisison or DJ role')
    const errskipEmbed = new MessageEmbed()
    .setColor(errorcolor)
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errskipEmbed.setDescription('Join a channel and try again')
      return message.say(errskipEmbed)
    };

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskipEmbed.setDescription('There is no song playing right now!')
      return message.say(errskipEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskipEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errskipEmbed);
      return;
    } else if (message.guild.triviaData.isTriviaRunning) {
      errskipEmbed.setDescription(`You can't skip a trivia! Use end-trivia`)
      return message.say(errskipEmbed);
    }

      message.guild.musicData.sloop = message.guild.musicData.loop;
      message.guild.musicData.loop = 'off';
      message.guild.musicData.songDispatcher.end();
      message.react('⏭️');
      setTimeout(function onTimeOut() { message.guild.musicData.loop = message.guild.musicData.sloop }, 500);
  }
};
