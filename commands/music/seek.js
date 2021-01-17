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
    const video = message.guild.musicData.nowPlaying;
    const loopEmbed = new MessageEmbed()
    .setColor(normalcolor)
      loopEmbed.setDescription('seek')
      message.say(loopEmbed)
      queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              quality: 'highestaudio',
              highWaterMark: 1 << 25,
              seek: time / 1000
            })
          )
          .on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            dispatcher.setVolume(message.guild.musicData.volume / 100);
            message.guild.musicData.nowPlaying = queue[0];
            queue.shift();
            return;
          })  
          .on('finish', function() {
            if (collector && !collector.end) collector.stop();
            queue = message.guild.musicData.queue;
            if (message.guild.musicData.loop == 'one') {
              for (let i = 0; i < 1; i++) {
                message.guild.musicData.queue.unshift(message.guild.musicData.nowPlaying);
              }
              if (queue.length >= 1) {
                playSong(queue, message);
                return;
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
            } else if (message.guild.musicData.loop == 'all') {
              message.guild.musicData.queue.push(message.guild.musicData.nowPlaying);
              if (queue.length >= 1) {
                playSong(queue, message);
                return;
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
            } else if (message.guild.musicData.loop == 'off') {
              if (queue.length >= 1) {
                playSong(queue, message);
                return;
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
            };  
          })
          .on('error', function(e) {
            message.say('Cannot play song');
            console.error(e);
            message.guild.musicData.loop = 'off';
            message.guild.musicData.queue.length = 0;
            message.guild.musicData.isPlaying = false;
            message.guild.musicData.nowPlaying = null;
            message.guild.musicData.songDispatcher = null;
            message.guild.me.voice.channel.leave();
            return;
          });
      })
      .catch(function() {
        message.say('I have no permission to join your channel!');
        message.guild.musicData.loop = 'off';
        message.guild.musicData.queue.length = 0;
        message.guild.musicData.isPlaying = false;
        message.guild.musicData.nowPlaying = null;
        message.guild.musicData.songDispatcher = null;
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
        }
        return;

      }); 

      const videoEmbed = new MessageEmbed()
      .setThumbnail(queue[0].thumbnail)
      .setColor(normalcolor)
      .addField('Now Playing:', `[${queue[0].title}](${queue[0].url})`)
      .addField('Duration:', queue[0].duration)
      .setFooter(
        `Requested by ${queue[0].memberDisplayName}`,
        queue[0].memberAvatar
      );
    if (queue[1]) videoEmbed.addField('Next Song:', queue[1].title);
    var playingMessage = await message.channel.send(videoEmbed);
    
        
    const filter = (user) => user.id !== message.client.user.id;
    var collector = playingMessage.createReactionCollector(filter, {
      time: queue[0].rawDuration > 0 ? queue[0].rawDuration * 1000 : 600000
    });

    collector.on("end", () => { 
      playingMessage.delete({ timeout: 1000 }).catch(console.error);
    });
    return;
  }
};