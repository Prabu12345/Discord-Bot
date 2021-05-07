const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class ResumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'resume',
      aliases: ['resume-song', 'continue'],
      memberName: 'resume',
      group: 'music',
      description: 'Resume the current paused song',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  run(message) {
    const errresumeEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(`${xmoji} | Join a channel and try again`);
      return;
    } 
    
    const { clientperm } = require('../../resources/permission')
    const acces = await clientperm(message, ['EMBED_LINKS'], [] )
    if (acces === true) {
    } else {
      return;
    } 

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher === null
    ) {
      errresumeEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errresumeEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errresumeEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errresumeEmbed);
      return;
    }
    const resumeEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`${cmoji} | resumed :play_pause:`)
    message.say(resumeEmbed);
    message.guild.musicData.songDispatcher.resume();
  }
};
