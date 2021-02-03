const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      guildOnly: true,
      examples: ['Loop \'all\'', 'Loop \'one\''],
      description: 'Loop the current playing song',
      args: [
        {
          key: 'typeLoop',
          type: 'string',
          default: '',
          prompt: 'Loop **one** for looped current song, loop **all** for looped queue'
        }
      ]
    });
  }

  run(message, { typeLoop }) {
    var totypeloop = typeLoop
    const totypelooplower = totypeloop.substring(totypeloop.search(" ") + 1, totypeloop.end).toLowerCase();
    if (!message.guild.musicData.isPlaying) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('There is no song playing right now!')
      return message.say(errloopEmbed);
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('You cannot loop over a trivia!')
      return message.say(errloopEmbed);
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errloopEmbed);
      return;
    }

    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)

    if (totypelooplower == 'one') {
      loopEmbed.setDescription('Looped **One track**, **loop off** if you want to stop looping!')
      message.say(loopEmbed)
      message.guild.musicData.loop = totypelooplower
    } else if (totypelooplower == 'all') {
      loopEmbed.setDescription('Looped **All track**, **loop off** if you want to stop looping!')
      message.say(loopEmbed)
      message.guild.musicData.loop = totypelooplower
    } else if (totypelooplower == 'off') {
      loopEmbed.setDescription('Loop **off**!')
      message.say(loopEmbed)
      message.guild.musicData.loop = totypelooplower
    };
    return;
  }
};
