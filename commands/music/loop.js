const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      guildOnly: true,
      examples: ['Loop queue', 'Loop track'],
      description: 'Loop the current playing song',
      args: [
        {
          key: 'typeLoop',
          type: 'string',
          default: '',
          prompt: 'Loop **one** for looped current song, loop **all** for looped queue'
        }
      ],
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  run(message, { typeLoop }) {
    var totypeloop = typeLoop
    const totypelooplower = totypeloop.substring(totypeloop.search(" ") + 1, totypeloop.end).toLowerCase();
    if (!message.guild.musicData.isPlaying) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errloopEmbed);
    } else if (typeLoop.length == 0) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('**Usage:** -loop <track | queue | off>')
      return message.say(errloopEmbed);
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | You cannot loop over a trivia!`)
      return message.say(errloopEmbed);
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errloopEmbed);
      return;
    }

    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)

    if (totypelooplower == 'track') {
      loopEmbed.setDescription(`${cmoji} | Looped **One track**, **loop off** if you want to stop looping!`)
      message.say(loopEmbed)
      message.guild.musicData.loop = totypelooplower
    } else if (totypelooplower == 'queue') {
      loopEmbed.setDescription(`${cmoji} | Looped **All track**, **loop off** if you want to stop looping!`)
      message.say(loopEmbed)
      message.guild.musicData.loop = totypelooplower
    } else if (totypelooplower == 'off') {
      loopEmbed.setDescription(`${cmoji} | Loop **off**!`)
      message.say(loopEmbed)
      message.guild.musicData.loop = totypelooplower
    };
    return;
  }
};
