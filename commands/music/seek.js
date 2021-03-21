const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { playSong } = require('./play')

module.exports = class SeekCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'seek',
      group: 'music',
      aliases: ['set'],
      memberName: 'seek',
      guildOnly: true,
      description: 'Set duration of music',
      examples: ['seek f 1:30', 'seek b 30', 'seek 1:30', 'seek 30'],
      args: [
        {
          key: 'time1',
          default: '',
          type: 'string',
          prompt: 'Enter seek time. E.g. f 1:30 or 0:30'
        }
      ]
    });
  }

  async run(message, { time1 }) {
    const video = message.guild.musicData.nowPlaying;
    var timevar = time1;
    var type = timevar.substring(0,timevar.search(" ")).toLowerCase();
    var time = timevar.substring(timevar.search(" ") + 1, timevar.end);
    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)
    if (timevar.length == 0) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
	.setDescription(`**Usage:** -seek [forward | backward] <time(2:00 | 120)> or -seek <duration(2:00 | 120)>`)
      return message.say(errvideoEmbed);
    } else if (!message.guild.musicData.isPlaying) {
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
    } else if (video.live == true || video.duration == "Live Stream") {
      message.channel.send('I can\'t set Live Stream video')
      return; 
    }
    if (!type) {
      if (time.search(/[abcdefghijklmnopqrstuvwxyz]/)) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
	      .setDescription(`**Usage:** -seek [forward | backward] <time(2:00 | 120)> or -seek <duration(2:00 | 120)>`)
        return message.say(errvideoEmbed);
      } else if (time.search(/[:]/) >= 0) { 
        var waktu1 = time.split(':'); 
        var allwaktu = parseInt(waktu1[0] * 60) + parseInt(waktu1[1]);
        loopEmbed.setDescription(`**Set to** \`${msToTime(parseInt(allwaktu) * 1000)}\``)
      } else if (time.search(/[.]/) >= 0) {
        var waktu2 = time.split('.');
        var allwaktu = parseInt(waktu2[0] * 60) + parseInt(waktu2[1]);
        loopEmbed.setDescription(`**Set to** \`${msToTime(parseInt(allwaktu) * 1000)}\``)
      } else {
        var allwaktu = time
        loopEmbed.setDescription(`**Set to** \`${msToTime(parseInt(allwaktu) * 1000)}\``)
      }
    } else {
      if (type == 'forward' || type == 'f') {
        if (time.search(/[abcdefghijklmnopqrstuvwxyz]/)) {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
	        .setDescription(`**Usage:** -seek [forward | backward] <time(2:00 | 120)> or -seek <duration(2:00 | 120)>`)
          return message.say(errvideoEmbed);
        } else if (time.search(/[:]/) >= 0) { 
          var waktu1 = time.split(':'); 
          var allwaktu = parseInt(waktu1[0] * 60) + parseInt(waktu1[1]);
          let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          let afterseek = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          loopEmbed.setDescription(`**Set forward by** \`${msToTime(beforeseek * 1000)}\` **to** \`${msToTime(afterseek * 1000)}\``)
        } else if (time.search(/[.]/) >= 0) {
          var waktu2 = time.split('.');
          var allwaktu = parseInt(waktu2[0] * 60) + parseInt(waktu2[1]);
          let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          let afterseek = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          loopEmbed.setDescription(`**Set forward by** \`${msToTime(beforeseek * 1000)}\` **to** \`${msToTime(afterseek * 1000)}\``)
        } else {
          var allwaktu = time
          let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          let afterseek = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          loopEmbed.setDescription(`**Set forward by** \`${msToTime(beforeseek * 1000)}\` **to** \`${msToTime(afterseek * 1000)}\``)
        }
      } else if (type == 'backward' || type == 'b') {
        if (time.search(/[abcdefghijklmnopqrstuvwxyz]/)) {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`**Usage:** -seek [forward | backward] <time(2:00 | 120)> or -seek <duration(2:00 | 120)>`)
          return message.say(errvideoEmbed);
        } else if (time.search(/[:]/) >= 0) { 
          var waktu1 = time.split(':'); 
          var allwaktu = parseInt(waktu1[0] * 60) + parseInt(waktu1[1]);
          let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          let afterseek = Math.ceil(message.guild.musicData.seek + (message.guild.musicData.songDispatcher.streamTime / 1000) - parseInt(allwaktu));
          loopEmbed.setDescription(`**Set backward by** \`${msToTime(beforeseek * 1000)}\` **to** \`${msToTime(afterseek * 1000)}\``)
        } else if (time.search(/[.]/) >= 0) {
          var waktu2 = time.split('.');
          var allwaktu = parseInt(waktu2[0] * 60) + parseInt(waktu2[1]);
          let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          let afterseek = Math.ceil(message.guild.musicData.seek + (message.guild.musicData.songDispatcher.streamTime / 1000) - parseInt(allwaktu));
          loopEmbed.setDescription(`**Set backward by** \`${msToTime(beforeseek * 1000)}\` **to** \`${msToTime(afterseek * 1000)}\``)
        } else {
          var allwaktu = time
          let beforeseek = Math.ceil((message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
          let afterseek = Math.ceil(message.guild.musicData.seek + (message.guild.musicData.songDispatcher.streamTime / 1000) - parseInt(allwaktu));
          loopEmbed.setDescription(`**Set backward by** \`${msToTime(beforeseek * 1000)}\` **to** \`${msToTime(afterseek * 1000)}\``)
        }
      } else {
        return;
      }
    }
    let seekAmount = Math.ceil(parseInt(allwaktu));
    let seekAmountf = Math.ceil(parseInt(allwaktu) + (message.guild.musicData.songDispatcher.streamTime / 1000) + message.guild.musicData.seek);
    let seekAmountb = Math.ceil(message.guild.musicData.seek + (message.guild.musicData.songDispatcher.streamTime / 1000) - parseInt(allwaktu));
    let completed = Math.ceil(message.guild.musicData.songDispatcher.streamTime + message.guild.musicData.seek);
    let videotime = (video.rawDuration / 1000);
    if (seekAmount >= videotime) {
      return message.channel.send('The duration is more than video duration!');
    }
    if (!type) {
      message.guild.musicData.seek = seekAmount
    } else {
      if (type == 'forward' || type == 'f') {
        message.guild.musicData.seek = seekAmountf
      } else if (type == 'backward' || type == 'b') {
        if (seekAmountb <= 0) {
          return message.channel.send(`You can't backward that much. Currently on \`${msToTime(completed)} / ${msToTime(videotime*1000)}\`!`);
        }
        message.guild.musicData.seek = seekAmountb
      }
    }
    message.say(loopEmbed)
    message.guild.musicData.queue.unshift(video);
    message.guild.musicData.songDispatcher.destroy();
    if (!type) {
      playSong(message.guild.musicData.queue, message, seekAmount);
    } else {
      if (type == 'forward' || type == 'f') {
        playSong(message.guild.musicData.queue, message, seekAmountf);
      } else if (type == 'backward' || type == 'b') {
        playSong(message.guild.musicData.queue, message, seekAmountb);
      }
    }
  }
};

function msToTime(duration) {
  var seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  if (hours !== "00")
  	return hours + ":" + minutes + ":" + seconds;
  else
  	return minutes + ":" + seconds;
}