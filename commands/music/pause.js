const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { clientperm } = require('../../resources/permission')

module.exports = class PauseCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'pause',
      aliases: ['pause-song', 'hold', 'stop'],
      memberName: 'pause',
      group: 'music',
      description: 'Pause the current playing song',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  async run(message) {
    if(msg.channel.type !== 'dm') {
    const acces = await clientperm(message, ['EMBED_LINKS'], [] )
    if (acces === true) {
    } else {
      return;
    } 
  }
    const errpauseEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errpauseEmbed.setDescription(`${xmoji} | Join a channel and try again`)
      return message.reply(errpauseEmbed);
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errpauseEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errpauseEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errpauseEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errpauseEmbed);
      return;
    }
    const pauseEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`${cmoji} | paused :pause_button:`)
    message.say(pauseEmbed);
    message.guild.musicData.pause = true;
    message.guild.musicData.songDispatcher.pause();
  }
};
