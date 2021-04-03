const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const youtube = require('youtube-sr').default;
const syoutube = require('simple-youtube-api');
const ytdl = require('ytdl-core');
const spotify = require('spotify-url-info')
const { youtubeAPI } = require('../../config.json');
const gch = new syoutube(youtubeAPI);
const { Spotify } = require('spotify-info.js');
const spt = new Spotify({
  clientID: "540def33c9bb4c94b7d3b5bb51615624",
  clientSecret: "89c15cd0add944c6bef3be863b964d9f",
  });
const { normalcolor, errorcolor, prefix, cmoji, xmoji } = require('../../config.json');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'add'],
      memberName: 'play',
      group: 'music',
      description: 'Play any song or playlist from youtube and spotify',
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
      .setDescription(`${xmoji} | Join a channel and try again`)
      message.say(errvideoEmbed);
      return;
    } else if (message.guild.triviaData.isTriviaRunning == true) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | Please try after the trivia has ended`)
      message.say(errvideoEmbed);
      return;
    } else if (!message.guild.me.voice.channel) {
      return message.reply(`${xmoji} | **I am not connected to a voice channel.** Type ${Command.usage('join', message.guild ? message.guild.commandPrefix : null, this.client.user)} to get me in one`)
    } else if (message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      return message.say(errleaveEmbed);
    } else if (message.guild.musicData.pause == true && query.length == 0) {
    const resumeEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`${cmoji} | Song resumed :play_pause:`)
    message.say(resumeEmbed);
    message.guild.musicData.pause = false;
    message.guild.musicData.songDispatcher.resume();
    return;
    } else if (query.length == 0){
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`**Usage:** ${prefix}play <YouTube or Spotify URL | Video Name>`)
      return message.say(errvideoEmbed);
    }

    const srch = await message.channel.send(`:mag_right: | **Searching** \`${query}\``);

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
      const videos = await youtube.search(updatedQuery, { type: 'video', limit: 1 })
      if (videos.length < 1 || !videos) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | I had some trouble finding what you were looking for, please try again or be more specific`)
        srch.edit('', errvideoEmbed);
        return;
      }
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj(
          videos[0],
          message.member.user
        )
      );
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        srch.delete();
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        let url = `https://youtube.com/watch?v=${videos.id}`;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
        .setTitle(`${videos.title}`)
        .addField(`Potition`,`#${message.guild.musicData.queue.length} in queue`)
        .setThumbnail(videos.thumbnail.url)
        .setURL(url)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    if (
      query.match(
        /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/
        )
    ) {
      const playlist = await spt.getPlaylistByURL(query)
      if (!playlist) {
        const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`playlist not found`)
      srch.edit('', errvideoEmbed);
      return;
      }
      const tracks = []
      for (let i = 0; i < playlist.tracks.items.length; i++) {
        const updatequery = `${playlist.tracks.items[i].track.artists[0].name} - ${playlist.tracks.items[i].track.name}`
        const results = await youtube.search(updatequery, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
          srch.edit('', errvideoEmbed);
          return;
        });
        if (results.length < 1) {
          continue
        }
        tracks.push(
          PlayCommand.constructSongObj(
            results[0],
            message.member.user
          )
        )
      }
      tracks.map(element => 
        message.guild.musicData.queue.push(element)  
      );
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.name}** added ${tracks.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.name}** added ${tracks.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return;
      }
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
      srch.edit('', errvideoEmbed);
      return;
      }
      const tracks = []
      for (let i = 0; i < album.tracks.items.length; i++) {
        const updatequery = `${album.tracks.items[i].artists[0].name} - ${album.tracks.items[i].name}`
        const results = await youtube.search(updatequery, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
          srch.edit('', errvideoEmbed);
          return;
        });
        if (results.length < 1) {
            continue
        }
        tracks.push(
          PlayCommand.constructSongObj(
            results[0],
            message.member.user
          )
        )
      }
      tracks.map(element => 
        message.guild.musicData.queue.push(element)  
      );
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${album.name}** added ${tracks.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${album.name}** added ${tracks.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    if (
      // if the user entered a youtube playlist url
      query.match(
        /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.*\?.*\blist=.*$/
      )
    ) {
      let failedToGetVideo = false;
      const playlist = await gch.getPlaylist(query).catch(function() {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | Playlist is either private or it does not exist!`)
        srch.edit('', errvideoEmbed);
        failedToGetVideo = true;
        return;
      });
      if (failedToGetVideo) return;
      // add 10 as an argument in getVideos() if you choose to limit the queue
      const videosArr = await playlist.getVideos().catch(function() {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | There was a problem getting one of the videos in the playlist!`)
        srch.edit('', errvideoEmbed);
        failedToGetVideo = true;
        return;
      });
      if (failedToGetVideo) return;

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
              PlayCommand.constructSongObj1(
                video,
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
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.title}** added ${videosArr.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.title}** added ${videosArr.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      try {
        query = query
        .replace(/(>|<)/gi, '')
        .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
      } catch {
        srch.edit('', ':x: | There was a problem getting the video you provided!');
      }
      const id = query[2].split(/[^0-9a-z_\-]/i)[0];
      let failedToGetVideo = false;
      const video = await gch.getVideoByID(id).catch(function() {
        srch.edit('', ':x: | There was a problem getting the video you provided!');
        failedToGetVideo = true;
      });
      if (failedToGetVideo) return;
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
        PlayCommand.constructSongObj1(video, message.member.user)
      );
      if (
        message.guild.musicData.isPlaying == false ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        srch.delete();
        return PlayCommand.playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
        .setTitle(`${video.title}`)
        .addField(`Potition `,`#${message.guild.musicData.queue.length} in queue`)
        .setThumbnail(video.thumbnails.high.url)
        .setURL(video.url)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    // if user provided a song/video name
    const videos = await youtube.search(query, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
      await srch.edit('', errvideoEmbed);
      return;
    });
    if (videos.length < 1 || !videos) {
      if (query.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)) return;
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | I had some trouble finding what you were looking for, please try again or be more specific`)
      srch.edit('', errvideoEmbed);
      return;
    }
    message.guild.musicData.queue.push(
      PlayCommand.constructSongObj(
        videos[0],
        message.member.user
      )
    );
    if (message.guild.musicData.isPlaying == false) {
      message.guild.musicData.isPlaying = true;
      srch.delete();
      PlayCommand.playSong(message.guild.musicData.queue, message, 0);
    } else if (message.guild.musicData.isPlaying == true) {
      let url = `https://youtube.com/watch?v=${videos[0].id}`;
      const addvideoEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
      .setTitle(`${videos[0].title}`)
      .addField(`Potition`,`#${message.guild.musicData.queue.length} in queue`)
      .setThumbnail(videos[0].thumbnail.url)
      .setURL(url)
      srch.edit('', addvideoEmbed);
      return;
    }
  }
  static async playSong(queue, message, seekAmount) {
    if (queue[0].voiceChannel == undefined) {
      // happens when loading a saved playlist
      queue[0].voiceChannel = message.member.voice.channel;
    }
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
    let vol = await db.get(`${message.guild.id}.settings`)
    queue[0].voiceChannel
      .join()
      .then(function(connection) {
        const vol1 = vol.volume / 100;
        const dispatcher = connection
          .play(ytdl(queue[0].url, { quality: `highestaudio`, filter: () => ['251'], highWaterMark: 1 << 25 }), { volume: vol1, seek: seekAmount })
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
            message.guild.musicData.svote = [];
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
            if (message.guild.musicData.errorP < 3) {
              message.say(`Cannot play ${queue[0].title} song`);
              queue.shift();
              console.error(e);
              message.guild.musicData.errorP + 1
              if (queue) PlayCommand.playSong(queue, message, 0);
            } else {
              message.say(`Error playing music, please tell to owner`);
            }
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
      .setTitle(`🎵 Now Playing`)
      .setColor(normalcolor)
      .setDescription(`[${queue[0].title}](${queue[0].url})\n${queue[0].duration}`)
      .setFooter(
        `Requested by ${queue[0].memberDisplayName}`,
        queue[0].memberAvatar
      );
    if (message.guild.musicData.seek == 0) {
      if (vol.nowplaying == true) {
        var playingMessage = await message.channel.send(videoEmbed);
      } else {
        return;
      }
    
      const filter = (user) => user.id !== message.client.user.id;
      var collector = playingMessage.createReactionCollector(filter, {
        time: queue[0].rawDuration > 0 ? queue[0].rawDuration : 600000
      });

      collector.on("end", () => { 
        playingMessage.delete({ timeout: 1000 }).catch(console.error);
      });
    } 
  }

  static constructSongObj(video, user) { 
    let duration = this.formatDuration(video.durationFormatted);
    if (duration == '0:00') duration = 'Live Stream';
    return {
      url: `https://youtube.com/watch?v=${video.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration: video.durationFormatted,
      thumbnail: video.thumbnail.url,
      memberDisplayName: user.username,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }

  static constructSongObj1(video, user) {
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
      rawDuration: totalDurationInMS,
      duration,
      thumbnail: video.thumbnails.high.url,
      memberDisplayName: user.username,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }

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
