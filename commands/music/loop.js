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
      description: 'Loop the current playing song',
      args: [
        {
          key: 'numOfTimesToLoop',
          type: 'string',
          prompt: 'Loop **one** for looped current song, loop **all** for loopied all queue'
        }
      ]
    });
  }

  run(message, { numOfTimesToLoop }) {
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

    if (numOfTimesToLoop == 'one') {
      loopEmbed.setDescription('Looped **One track**, **loop off** if you want to stop looping!')
      message.say(loopEmbed)
      message.guild.musicData.loop = numOfTimesToLoop
    } else if (numOfTimesToLoop == 'all') {
      loopEmbed.setDescription('Looped **All track**, **loop off** if you want to stop looping!')
      message.say(loopEmbed)
      message.guild.musicData.loop = numOfTimesToLoop
    } else if (numOfTimesToLoop == 'off') {
      loopEmbed.setDescription('Loop **off**!')
      message.say(loopEmbed)
      message.guild.musicData.loop = numOfTimesToLoop
    };
    return;
  }
};
