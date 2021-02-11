const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
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

  async run(message, { time }) {
    const video = message.guild.musicData.nowPlaying; 
    const choiceDur = time.split(":");
    const optDurr = (parseInt(choiceDur[0], 10) * 60000) + ((parseInt(choiceDur[1], 10) % 60000) * 1000);
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
    } else if (video.duration == 'Live Stream') {
      message.channel.send('Video Live stream ga bisa di seek goblok')
      return; 
    }
    var seekplaying = null;
    seekplaying = video
    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`Seeked ${parseInt(time)} seconds.`)
    message.say(loopEmbed)
    message.guild.musicData.queue.unshift(video);
    message.guild.musicData.songDispatcher.destroy();
    let seekAmount = Math.ceil(parseInt(optDurr) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
    playSong(message.guild.musicData.queue, message, seekAmount);
    message.guild.musicData.seek = seekAmount
  }
};