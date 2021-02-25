const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Youtube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const spotify = require('spotify-url-info')
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);
const { normalcolor, errorcolor, prefix } = require('../../config.json');

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'add'],
      memberName: 'play',
      group: 'music',
      description: 'Play any song or playlist from youtube',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT'],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'query',
          default: '',
          prompt: 'What song or playlist would you like to listen to?',
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
    if (!voiceChannel) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('Join a channel and try again')
      message.say(errvideoEmbed);
      return;
    }

    if (message.guild.triviaData.isTriviaRunning == true) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('Please try after the trivia has ended')
      message.say(errvideoEmbed);
      return;
    }

    if (message.guild.musicData.pause == true && query.length == 0) {
    const resumeEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription('Song resumed :play_pause:')
    message.say(resumeEmbed);
    message.guild.musicData.pause = false;
    message.guild.musicData.songDispatcher.resume();
    return;
    }

    if (query.length == 0){
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`Usage: ${prefix}play <YouTube URL | Video Name>`)
      return message.say(errvideoEmbed);
    }

    if (
      query.match(
        /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/
        )
    ) {
      const album = await spotify.getData(query)
      if (!album) {
        const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`Album not found`)
      return message.say(errvideoEmbed);
      }
      const tracks = []
      var nameOfalbum = album.name
      for (let i = 0; i < album.tracks.items.length; i++) {
        const updatequery = `${album.tracks.items[i].artists[0].name} - ${album.tracks.items[i].name}`
        const results = await youtube.searchVideos(updatequery, 1).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription('There was a problem searching the video you requested :(')
          await message.say(errvideoEmbed);
          return;
        });
        if (results.length < 1) {
            continue
        }
        tracks.push(results[0])
      }

      for (let i = 0; i < tracks.length; i++) {
        try {
          const video = await tracks[i].fetch();
          // this can be uncommented if you choose to limit the queue
          // if (message.guild.musicData.queue.length < 10) {
          //
          message.guild.musicData.queue.push(
            PlayCommand.constructSongObj(
              video,
              voiceChannel,
              message.member.user
            )
          );
          // } else {
          //   return message.say(
          //     `I can't play the full playlist because there will be more than 10 songs in queue`
          //   );
          // }
        } catch (err) {
          return console.error(err);
        }
      }
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`Playlist - :musical_note:  **${nameOfalbum}** :musical_note: has been added to queue`)
        message.say(addvideoEmbed);
        return;
      }
    }

    if (
      query.match(
        /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/
        )
      ) {
        
    }

    if (
      query.match(
        /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/
      )
    ) {
      var updatedQuery;
      const spotifyData = await spotify.getPreview(query).catch(() => {})
      if (spotifyData) {
        updatedQuery = `${spotifyData.artist} - ${spotifyData.title}`
      }
      const videos = await youtube.searchVideos(updatedQuery, 1).catch(async function() {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription('There was a problem searching the video you requested :(')
        await message.say(errvideoEmbed);
        return;
      });
      if (videos.length < 1 || !videos) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription('I had some trouble finding what you were looking for, please try again or be more specific')
        message.say(errvideoEmbed);
        return;
      }
          youtube
            .getVideoByID(videos[0].id)
            .then(video => {
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
                PlayCommand.constructSongObj(
                  video,
                  voiceChannel,
                  message.member.user
                )
              );
              if (message.guild.musicData.isPlaying == false) {
                message.guild.musicData.isPlaying = true;
                return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
              } else if (message.guild.musicData.isPlaying == true) {
                const addvideoEmbed = new MessageEmbed()
                .setColor(normalcolor)
                .setDescription(`**${video.title}** added to queue`)
                message.say(addvideoEmbed);
                return;
              }
            })
            .catch(function(error) {
              console.error(error);
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription('An error has occured when trying to get the video ID from youtube')
              message.say(errvideoEmbed);
              return;
            });
    }
    
    if (
      // if the user entered a youtube playlist url
      query.match(
        /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.*\?.*\blist=.*$/
      )
    ) {
      const playlist = await youtube.getPlaylist(query).catch(function() {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription('Playlist is either private or it does not exist!')
        return message.say(errvideoEmbed);
      });
      // add 10 as an argument in getVideos() if you choose to limit the queue
      const videosArr = await playlist.getVideos().catch(function() {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription('There was a problem getting one of the videos in the playlist!')
        message.say(errvideoEmbed);
        return;
      });

      // this for loop can be uncommented if you want to shuffle the playlist

      /*for (let i = videosArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [videosArr[i], videosArr[j]] = [videosArr[j], videosArr[i]];
      }
      */

      for (let i = 0; i < videosArr.length; i++) {
        if (videosArr[i].raw.status.privacyStatus == 'private') {
          continue;
        } else {
          try {
            const video = await videosArr[i].fetch();
            // this can be uncommented if you choose to limit the queue
            // if (message.guild.musicData.queue.length < 10) {
            //
            message.guild.musicData.queue.push(
              PlayCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            // } else {
            //   return message.say(
            //     `I can't play the full playlist because there will be more than 10 songs in queue`
            //   );
            // }
          } catch (err) {
            return console.error(err);
          }
        }
      }
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`Playlist - :musical_note:  **${playlist.title}** :musical_note: has been added to queue`)
        message.say(addvideoEmbed);
        return;
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      query = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      const id = query[2].split(/[^0-9a-z_\-]/i)[0];
      const video = await youtube.getVideoByID(id).catch(function() {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription('There was a problem getting the video you provided!')
        message.say(errvideoEmbed);
        return;
      });
      // can be uncommented if you don't want the bot to play live streams
      // if (video.raw.snippet.liveBroadcastContent === 'live') {
      //   return message.say("I don't support live streams!");
      // }
      // // can be uncommented if you don't want the bot to play videos longer than 1 hour
      // if (video.duration.hours !== 0) {
      //   return message.say('I cannot play videos longer than 1 hour');
      // }
      // // can be uncommented if you want to limit the queue
      // if (message.guild.musicData.queue.length > 10) {
      //   return message.say(
      //     'There are too many songs in the queue already, skip or wait a bit'
      //   );
      // }
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj(video, voiceChannel, message.member.user)
      );
      if (
        message.guild.musicData.isPlaying == false ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`**${video.title}** added to queue`)
        message.say(addvideoEmbed);
        return;
      }
    }

    // if user provided a song/video name
    const videos = await youtube.searchVideos(query, 1).catch(async function() {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('There was a problem searching the video you requested :(')
      await message.say(errvideoEmbed);
      return;
    });
    if (videos.length < 1 || !videos) {
      if (query.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)) return;
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('I had some trouble finding what you were looking for, please try again or be more specific')
      message.say(errvideoEmbed);
      return;
    }
        youtube
          .getVideoByID(videos[0].id)
          .then(video => {
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
              PlayCommand.constructSongObj(
                video,
                voiceChannel,
                message.member.user
              )
            );
            if (message.guild.musicData.isPlaying == false) {
              message.guild.musicData.isPlaying = true;
              PlayCommand.playSong(message.guild.musicData.queue, message, 0);
            } else if (message.guild.musicData.isPlaying == true) {
              const addvideoEmbed = new MessageEmbed()
              .setColor(normalcolor)
              .setDescription(`**${video.title}** added to queue`)
              message.say(addvideoEmbed);
              return;
            }
          })
          .catch(function(error) {
            console.error(error);
            const errvideoEmbed = new MessageEmbed()
            .setColor(errorcolor)
            .setDescription('An error has occured when trying to get the video ID from youtube')
            message.say(errvideoEmbed);
            return;
          });
  
  }
  static async playSong(queue, message, seekAmount) {
    if (message.guild.musicData.seek > 0) {
      if (collector && !collector.end) collector.stop();
    }
    /*let mode;
    var query = queue[0].url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?soundcloud\.com\/.+/)){
      mode = 'spty';
    } else if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      mode = 'ytbe';
    }
    let playtype;
    if (mode == 'scdl') {
      playtype = scdl.downloadFormat(song.url, scdl.FORMATS.OPUS, SOUNDCLOUD_CLIENT_ID ? SOUNDCLOUD_CLIENT_ID : undefined);
    } else {
      playtype = ytdl(queue[0].url, { quality: `highestaudio`, filter: () => ['251'], highWaterMark: 1 << 25 })
    }*/
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const vol = message.guild.musicData.volume / 100;
        const dispatcher = connection
          .play(ytdl(queue[0].url, { quality: `highestaudio`, filter: () => ['251'], highWaterMark: 1 << 25 }), { volume: vol, seek: seekAmount })
          dispatcher.on('start', function() {
            message.guild.musicData.songDispatcher = dispatcher;
            message.guild.musicData.nowPlaying = queue[0];
            queue.shift();
            return;
          })  
          dispatcher.on('finish', function() {
            if (collector && !collector.end) collector.stop();
            queue = message.guild.musicData.queue;
            message.guild.musicData.seek = 0;
            if (message.guild.musicData.loop == 'one') {
              for (let i = 0; i < 1; i++) {
                message.guild.musicData.queue.unshift(message.guild.musicData.nowPlaying);
              }
              if (queue.length >= 1) {
                PlayCommand.playSong(queue, message, 0);
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
                PlayCommand.playSong(queue, message, 0);
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
                PlayCommand.playSong(queue, message, 0);
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
            message.say(`Cannot play ${queue[0].title} song`);
            queue.shift();
            console.error(e);
            PlayCommand.playSong(queue, message, 0);
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
    if (message.guild.musicData.seek == 0) {
      var playingMessage = await message.channel.send(videoEmbed);
    
      const filter = (user) => user.id !== message.client.user.id;
      var collector = playingMessage.createReactionCollector(filter, {
        time: queue[0].rawDuration > 0 ? queue[0].rawDuration * 1000 : 600000
      });

      collector.on("end", () => { 
        playingMessage.delete({ timeout: 1000 }).catch(console.error);
      });
    } 
  }

  static constructSongObj(video, voiceChannel, user) {
    const totalDurationObj = video.duration;

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach(function(key) {
      if (key == 'hours') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
      } else if (key == 'minutes') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
      } else if (key == 'seconds') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 1000;
      }
    });

    let duration = this.formatDuration(video.duration);
    if (duration == '00:00') duration = 'Live Stream';
    return {
      url: `https://youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: video.duration,
      srawDuration: totalDurationInMS,
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

};
