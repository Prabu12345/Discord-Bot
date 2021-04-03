const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class SkipCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skip',
      aliases: ['skip-song', 's'],
      memberName: 'skip',
      group: 'music',
      description: 'Skip the current playing song',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  run(message) {
    const errskipEmbed = new MessageEmbed()
    .setColor(errorcolor)
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errskipEmbed.setDescription(':x: | Join a channel and try again')
      return message.say(errskipEmbed)
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskipEmbed.setDescription(':x: | There is no song playing right now!')
      return message.say(errskipEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskipEmbed.setDescription(`:x: | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errskipEmbed);
      return;
    } else if (message.guild.triviaData.isTriviaRunning) {
      errskipEmbed.setDescription(`:x: | You can't skip a trivia! Use end-trivia`)
      return message.say(errskipEmbed);
    }

    if (message.guild.musicData.nowPlaying.memberDisplayName !== message.member.user.username) {
      let usersC = message.member.voice.channel.members.size;
      let required = Math.ceil(usersC/2);
      
      if(message.guild.musicData.svote.includes(message.member.id))
      return message.channel.send(":x: | You already voted to skip!")
  
	    message.guild.musicData.svote.push(message.member.id)

      if(message.guild.musicData.svote.length >= required){
        message.guild.musicData.sloop = message.guild.musicData.loop;
        message.guild.musicData.loop = 'off';
        message.guild.musicData.songDispatcher.end();
        message.react('⏭️');
        setTimeout(function onTimeOut() { message.guild.musicData.loop = message.guild.musicData.sloop }, 500);
        return;
      }

      message.channel.send(`:white_check_mark: | You voted to skip the song \`${message.guild.musicData.svote.length}\`/\`${required}\` votes`)
    } else {
      message.guild.musicData.sloop = message.guild.musicData.loop;
      message.guild.musicData.loop = 'off';
      message.guild.musicData.songDispatcher.end();
      message.react('⏭️');
      setTimeout(function onTimeOut() { message.guild.musicData.loop = message.guild.musicData.sloop }, 500);
    }
  }
};
