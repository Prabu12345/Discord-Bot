const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { playSong } = require('./play')

module.exports = class SeekCommand extends Command {
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
    var timevar = time;
    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)
    if (timevar.search(/[:]/) >= 0) { 
      var waktu1 = time.split(':'); 
      var allwaktu = parseInt(waktu1[0] * 60) + parseInt(waktu1[1]);
      let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
      let afterseek = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
      loopEmbed.setDescription(`Seeking by ${msToTime(beforeseek)} to ${msToTime(afterseek)}.`)
    } else if (timevar.search(/[.]/) >=0) {
      var waktu2 = time.split('.');
      var allwaktu = parseInt(waktu2[0] * 60) + parseInt(waktu2[1]);
      let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
      let afterseek = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
      loopEmbed.setDescription(`Seeking by ${msToTime(beforeseek)} to ${msToTime(afterseek)}.`)
    } else {
      var allwaktu = time
      loopEmbed.setDescription(`Seeked ${time} Second.`)
    }
    let seekAmount = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
    let videotime = (video.srawDuration / 1000);
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
    } else if (seekAmount >= videotime) {
      return message.channel.send('seeknya kelebihan coy, ga sesuai ama durasi lagunya');
    }
    var seekplaying = null;
    seekplaying = video
    message.say(loopEmbed)
    message.guild.musicData.queue.unshift(video);
    message.guild.musicData.songDispatcher.destroy();
    playSong(message.guild.musicData.queue, message, seekAmount);
    message.guild.musicData.seek = seekAmount
  }
};

function msToTime(duration) {
  var seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  if (hours !== 0)
  	return hours + ":" + minutes + ":" + seconds;
  else
  	return minutes + ":" + seconds;
}