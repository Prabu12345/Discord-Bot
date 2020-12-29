const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      aliases: ['pause-song', 'hold', 'stop'],
      memberName: 'pause',
      group: 'music',
      description: 'Pause the current playing song',
      guildOnly: true
    });
  }

  run(message) {
    const errpauseEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errpauseEmbed.setDescription('Join a channel and try again')
      return message.reply(errpauseEmbed);
    }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errpauseEmbed.setDescription('There is no song playing right now!')
      return message.say(errpauseEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errpauseEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errpauseEmbed);
      return;
    }

    const pauseEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription('Song paused :pause_button:')
    message.say(pauseEmbed);

    message.guild.musicData.songDispatcher.pause();
  }
};
