const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const ytdl = require('discord-ytdl-core');
const { playSong } = require('./play')

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'seek',
      group: 'music',
      memberName: 'seek',
      guildOnly: true,
      description: 'Loop the current playing song',
      examples: ['seek 1:30', 'seek 0:30'],
      args: [
        {
          key: 'time',
          default: '',
          type: 'string',
          prompt: 'Enter seek time. E.g. 1:30 or 0:30'
        }
      ]
    });
  }

  async run(message, queue, { time }) {
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
      .setDescription('You cannot seek over a trivia!')
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
    var seekplaying = null;
    const video = message.guild.musicData.nowPlaying;
    seekplaying = video
    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription('seek')
    message.say(loopEmbed)

    let seekAmount = Math.ceil(parseInt(time) + (message.guild.musicData.songDispatcher.streamTime / 1000) + time);
    playSong(queue, message, seekAmount);
  }
};