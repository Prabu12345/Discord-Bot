const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

module.exports = class searchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'search',
      aliases: ['src'],
      memberName: 'search',
      group: 'music',
      description: 'search any song from youtube',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 2,
        duration: 5
      },
      args: [
        {
          key: 'query',
          prompt: 'What song would you like to listen to?',
          type: 'string',
          validate: function(query) {
            return query.length > 0 && query.length < 200;
          }
        }
      ]
    });
  }

  async run(message, { query }) {
    const voiceChannel = message.member.voice.channel;
    const videos = await youtube.searchVideos(query, 5).catch(async function() {
      const errvideoEmbed = new MessageEmbed()
      .setColor('#e9f931')
      .setDescription('There was a problem searching the video you requested :(')
      await message.say(errvideoEmbed);
      return;
    });
    if (videos.length < 5 || !videos) {
      const errvideoEmbed = new MessageEmbed()
      .setColor('#e9f931')
      .setDescription('I had some trouble finding what you were looking for, please try again or be more specific')
      message.say(errvideoEmbed);
      return;
    }
    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(`${i + 1}: ${videos[i].title}`);
    }
    vidNameArr.push('exit');
    const embed = new MessageEmbed()
      .setColor('#e9f931')
      .setTitle('Choose a song by commenting a number between 1 and 5')
      .addField('Song 1', vidNameArr[0])
      .addField('Song 2', vidNameArr[1])
      .addField('Song 3', vidNameArr[2])
      .addField('Song 4', vidNameArr[3])
      .addField('Song 5', vidNameArr[4])
      .addField('Exit', 'Write "exit" to cancel');
    var songEmbed = await message.channel.send({ embed });
    message.channel
      .awaitMessages(
        function(msg) {
          return (msg.content > 0 && msg.content < 6) || msg.content === 'exit';
        },
        {
          max: 1,
          time: 60000,
          errors: ['time']
        }
      )
      .then(function(response) {
        const videoIndex = parseInt(response.first().content);
        if (response.first().content === 'exit') {
          songEmbed.delete();
          return;
        }
        youtube
          .getVideoByID(videos[videoIndex - 1].id)
          .then(function(video) {
            // // can be uncommented if you don't want the bot to play live streams
            // if (video.raw.snippet.liveBroadcastContent === 'live') {
            //   songEmbed.delete();
            //   return message.say("I don't support live streams!");
            // }

            // // can be uncommented if you don't want the bot to play videos longer than 1 hour
            // if (video.duration.hours !== 0) {
            //   songEmbed.delete();
            //   return message.say('I cannot play videos longer than 1 hour');
            // }

            // // can be uncommented if you don't want to limit the queue
            // if (message.guild.musicData.queue.length > 10) {
            //   songEmbed.delete();
            //   return message.say(
            //     'There are too many songs in the queue already, skip or wait a bit'
            //   );
            // }
            message.guild.musicData.queue.push(
              searchCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            if (message.guild.musicData.isPlaying == false) {
              message.guild.musicData.isPlaying = true;
              if (songEmbed) {
                songEmbed.delete();
              }
              searchCommand.playSong(message.guild.musicData.queue, message);
            } else if (message.guild.musicData.isPlaying == true) {
              if (songEmbed) {
                songEmbed.delete();
              }
              const addvideoEmbed = new MessageEmbed()
              .setColor('#e9f931')
              .setDescription(`**${video.title}** added to queue`)
              message.say(addvideoEmbed);
              return;
            }
          })
          .catch(function() {
            if (songEmbed) {
              songEmbed.delete();
            }
            const errvideoEmbed = new MessageEmbed()
            .setColor('#e9f931')
            .setDescription('An error has occured when trying to get the video ID from youtube')
            message.say(errvideoEmbed);
            return;
          });
      })
      .catch(function() {
        if (songEmbed) {
          songEmbed.delete();
        }
        const errvideoEmbed = new MessageEmbed()
        .setColor('#e9f931')
        .setDescription('Please try again and enter a number between 1 and 5 or exit')
        message.say(errvideoEmbed);
        return;
      });  
  }
  static async playSong(queue, message) {
    const classThis = this; // use classThis instead of 'this' because of lexical scope below
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const dispatcher = connection
          .play(
            ytdl(queue[0].url, {
              quality: 'highestaudio',
              highWaterMark: 1 << 25
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
                classThis.playSong(queue, message);
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
                classThis.playSong(queue, message);
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
                classThis.playSong(queue, message);
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
      .setColor('#e9f931')
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
  }
  static constructSongObj(video, voiceChannel, user) {
    let duration = this.formatDuration(video.duration);
    if (duration == '00:00') duration = 'Live Stream';
    return {
      url: `https://youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnails.high.url,
      voiceChannel,
      memberDisplayName: user.username,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }
  // prettier-ignore
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '00'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }
}
