const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');
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
    message.guild.musicData.songDispatcher.end();

    seekplaying.voiceChannel.join()
    .then(connection => {
      const dispatcher = connection
          .play(
            ytdl(seekplaying.url, {
              quality: 'highestaudio',
              highWaterMark: 1 << 25,
              begin: time
            })
          ) 
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(message.guild.musicData.volume / 100);
            message.guild.musicData.nowPlaying = message.guild.musicData.queue.queue[0];
            message.guild.musicData.queue.shift();
            return;
          })  
          .on('finish', function() {
            if (queue.length >= 1) {
              return playSong(queue, message);
            } else {
              message.guild.musicData.isPlaying = false;
              message.guild.musicData.nowPlaying = null;
              message.guild.musicData.songDispatcher = null;
              if (message.guild.me.voice.channel) {
                setTimeout(function onTimeOut() {
                  if (
                    message.guild.musicData.isPlaying == false &&
                    message.guild.me.voice.channel
                  ) {
                    message.guild.musicData.loop = 'off';
                    message.guild.me.voice.channel.leave();
                  }
                }, 90000);
              }
            }
          });
    }).catch(err => {
      console.error(err)
    })
  }   
};