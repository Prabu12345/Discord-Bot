const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const youtube = require('youtube-sr').default;
const syoutube = require('simple-youtube-api');
const spotify = require('spotify-url-info')
const { youtubeAPI } = require('../../config.json');
const gch = new syoutube(youtubeAPI);
const { Spotify } = require('spotify-info.js');
const spt = new Spotify({
  clientID: "540def33c9bb4c94b7d3b5bb51615624",
  clientSecret: "89c15cd0add944c6bef3be863b964d9f",
  });
const { normalcolor, errorcolor, prefix, cmoji, xmoji } = require('../../config.json');
const { playSong } = require('../../resources/music/play')
const { clientperm } = require('../../resources/permission')

module.exports = class PlayCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'play',
      aliases: ['p', 'add'],
      memberName: 'play',
      group: 'music',
      description: 'Play any song or playlist from youtube and spotify',
      guildOnly: true,
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
    const acces = await clientperm(message, ['EMBED_LINKS'], ['SPEAK', 'CONNECT'] )
    if (acces === true) {
    } else {
      return;
    } 
    if (message.guild.triviaData.isTriviaRunning == true) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | Please try after the trivia has ended`)
      message.say(errvideoEmbed);
      return;
    } 
    if (!message.guild.me.voice.channel) {
      return message.reply(`${xmoji} | **I am not connected to a voice channel.** Type ${Command.usage('join', message.guild ? message.guild.commandPrefix : null, this.client.user)} to get me in one`)
    }
    if (!voiceChannel) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | Join a channel and try again`)
      message.say(errvideoEmbed);
      return;
    }  
    if (message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      return message.say(errleaveEmbed);
    }
    if (message.guild.musicData.songDispatcher) {
      if (message.guild.musicData.songDispatcher.paused) {
        message.guild.musicData.songDispatcher.resume();
        const resumeEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`${cmoji} | Song resumed :play_pause:`)
        message.say(resumeEmbed);
        return;
      } else {
      }
    }

    // Usage
    if (query.length == 0){
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`**Usage:** ${prefix}play <YouTube or Spotify URL | Video Name>`)
      return message.say(errvideoEmbed);
    }

    const srch = await message.channel.send(`:mag_right: | **Searching** \`${query}\``);

    // spotify track
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

      // Searching song from youtube
      const videos = await youtube.search(updatedQuery, { type: 'video', limit: 1 })
      if (videos.length < 1 || !videos) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | I had some trouble finding what you were looking for, please try again or be more specific`)
        srch.edit('', errvideoEmbed);
        return;
      }

      // limit play hour
      let endur = (videos[0].duration / (1000 * 60 * 60)) % 24
      if ( endur > 5) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji}  | I cannot play videos longer than 5 hour`)
        srch.edit('', errvideoEmbed);
        return;
      }

      // Limit the queue
      if (message.guild.musicData.queue.length >= 1000) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | There are too many songs in the queue already, skip or wait a bit`)
        srch.edit('', errvideoEmbed);
        return;
      }

      // Pushing a soong to queue
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj(
          videos[0],
          message.member.user
        )
      );

      // Getting Video Duration
      let sum = 0, l;
      let dur = ''
      for (l = 0; l < message.guild.musicData.queue.length - 1; l +=1 ) {
        sum += (+message.guild.musicData.queue[i].rawDuration);
      }
      if (videos[0].duration > 0) {
        dur = videos[0].durationFormatted
      } else {
        dur = 'Live Stream'
      }

      // Info and run
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true; 
        srch.delete();
        return playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        let url = `https://youtube.com/watch?v=${videos.id}`;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
        .setDescription(`**[${videos[0].title}](${url})**`)
        .addField(`Song Duration`,`${dur}`, true)
        .addField(`Estimated time`,`${PlayCommand.msToTime((message.guild.musicData.nowPlaying.rawDuration - (message.guild.musicData.songDispatcher.streamTime + (message.guild.musicData.seek * 1000))) + sum)}`, true)
        .addField(`Potition`,`**#**${message.guild.musicData.queue.length} in queue`, true)
        .setThumbnail(videos[0].thumbnail.url)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    // Spotify Playlist
    if (
      query.match(
        /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/
        )
    ) {
      // Getting playlist by url
      const playlist = await spt.getPlaylistByURL(query)
      if (!playlist) {
        const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`playlist not found`)
      srch.edit('', errvideoEmbed);
      return;
      }

      // Getting playlist song 1 by 1 ( need to repair to long sarching )
      var skipcount = 0;
      var i = 0, len = playlist.tracks.items.length;
      while (i < len) {
        const updatequery = `${playlist.tracks.items[i].track.artists[0].name} - ${playlist.tracks.items[i].track.name}`
        const results = await youtube.search(updatequery, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
          srch.edit('', errvideoEmbed);
          return;
        });
        if (results.length < 1) {
          skipcount++;
          continue;
        } else if (results[0].duration < 1) {
          skipcount++;
          continue;
        } else {
          try {
            // limiting the queue
            if (message.guild.musicData.queue.length < 1000) {
              // Push the song to queue
              message.guild.musicData.queue.push(
                PlayCommand.constructSongObj(
                  results[0],
                  message.member.user
                )
              )
            } else {
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription(`${xmoji} | I can\'t play the full playlist because there will be more than 1000 songs in queue`)
              srch.edit('', errvideoEmbed);
              return;
            }
          } catch (err) {
            return console.error(err);
          }
        }
        i++
      }

      // Info and run
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.name}** added ${playlist.tracks.items.length - skipcount} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.name}** added ${playlist.tracks.items.length - skipcount} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    if (
      query.match(
        /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/
        )
    ) {
      // getting album by url
      const album = await spotify.getData(query)
      if (!album) {
        const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`Album not found`)
      srch.edit('', errvideoEmbed);
      return;
      }

      // Getting album song 1 by 1 ( need to repair to long sarching )
      var skipcount = 0;
      var i = 0, len = album.tracks.items.length;
      while (i < len) {
        const updatequery = `${album.tracks.items[i].artists[0].name} - ${album.tracks.items[i].name}`
        const results = await youtube.search(updatequery, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
          srch.edit('', errvideoEmbed);
          return;
        });
        if (results.length < 1) {
          skipcount++;
          continue;
        } else if (results[0].duration < 1) {
          skipcount++;
          continue;
        } else {
          try {
            // limiting the queue
            if (message.guild.musicData.queue.length < 1000) {
              // Push the song to queue
              message.guild.musicData.queue.push(
                PlayCommand.constructSongObj(
                  results[0],
                  message.member.user
                )
              )
            } else { 
              // can be uncommented if you want to limit the queue
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription(`${xmoji} | I can\'t play the full playlist because there will be more than 1000 songs in queue`)
              srch.edit('', errvideoEmbed);
              return;
            }
          } catch (err) {
            return console.error(err);
          }
        }
        i++
      }

      // info and run
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${album.name}** added ${album.tracks.items.length - skipcount} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${album.name}** added ${album.tracks.items.length - skipcount} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    if (
      query.match(
        /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.*\?.*\blist=.*$/
      )
    ) {
      let failedToGetVideo = false;
      // getting playlist
      const playlist = await gch.getPlaylist(query);
      if (!playlist) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | Playlist is either private or it does not exist!`)
        srch.edit('', errvideoEmbed);
        failedToGetVideo = true;
        return;
      }
      if (failedToGetVideo) return;

      // add 10 as an argument in getVideos() if you choose to limit the queue
      const videosArr = await playlist.getVideos();
      if (!videosArr) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | There was a problem getting one of the videos in the playlist!`)
        srch.edit('', errvideoEmbed);
        failedToGetVideo = true;
        return;
      }
      if (failedToGetVideo) return;

      // old checking and pushing song to queue
      /*var skipcount = 0;
      for(var i = 0, len = videosArr.length; i < len; i++) 
      {
        if (videosArr[i].raw.status.privacyStatus == 'private') {
          skipcount++
          continue;
        } 
        const video = await videosArr[i].fetch();
        let endur = parseInt(PlayCommand.durationrawed(video.duration))
        endur = (endur / (1000 * 60 * 60)) % 24
        if (endur > 5) {
          skipcount++
          continue;
        } if (video.raw.snippet.liveBroadcastContent === 'live') {
          // Unsopported live song\
          skipcount++
          continue;
        } else {
          // limiting queue
          try {
            if (message.guild.musicData.queue.length < 1000) {
              // Push the song to queue
              message.guild.musicData.queue.push(
                PlayCommand.constructSongObj1(
                  video,
                  message.member.user
                )
              );
              } else {
                const errvideoEmbed = new MessageEmbed()
                .setColor(errorcolor)
                .setDescription(`${xmoji} | I can\'t play the full playlist because there will be more than 1000 songs in queue`)
                srch.edit('', errvideoEmbed);
                return; 
              }
          } catch (err) {
            return console.error(err);
          }
        }
      }*/

      // Master-bot playlist graber
      /*var skipAmount = 0;
      await videosArr.reduce(async (memo, video, key) => {
        await memo;
        // don't process private videos
        if (
          video.raw.status.privacyStatus == 'private' ||
          video.raw.status.privacyStatus == 'privacyStatusUnspecified'
        ) {
          skipAmount++;
          return;
        }

        try {
          const fetchedVideo = await video.fetch();
          message.guild.musicData.queue.push(
            PlayCommand.constructSongObj1(
              fetchedVideo,
              message.member.user
            )
          );
        } catch (err) {
          return console.error(err);
        }
      }, undefined);*/

      // new checking and pushing song to queue
      const newSongs = videosArr
      .filter((video) => video.title != "Private video" && video.title != "Deleted video")
      .map((video) => {
        const ger = [];
        gch.getVideoByID(video.id).then((videoes) => { ger.push(videoes.duration) }).catch(console.error);
        console.log(ger[0])
        let duration = PlayCommand.formatDuration(ger[0]);
        if (duration == '0:00') duration = 'Live Stream';
        return {
          url: `https://youtube.com/watch?v=${video.id}`,
          title: video.title,
          rawDuration: PlayCommand.durationrawed(ger[0]),
          duration,
          thumbnail: video.thumbnails.high.url,
          memberDisplayName: message.member.user.tag,
          memberAvatar: message.member.user.avatarURL('webp', false, 16)
        }
      });
      console.log(newSongs[5]);
      message.guild.musicData.queue.push(...newSongs);
      
      // info and run
      if (message.guild.musicData.isPlaying == false) {
        message.guild.musicData.isPlaying = true;
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.title}** added ${newSongs.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`🎵 | **${playlist.title}** added ${newSongs.length} songs to the queue!`)
        srch.edit('', addvideoEmbed);
        return;
      }
    }

    // This if statement checks if the user entered a youtube url, it can be any kind of youtube url
    if (query.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
      query = query.split('\n')
      query = query[0].replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/)
      const id = query[2].split(/[^0-9a-z_\-]/i)[0];
      let failedToGetVideo = false;
      const video = await gch.getVideoByID(id).catch(function() {
        srch.edit('', ':x: | There was a problem getting the video you provided!');
        failedToGetVideo = true;
      });
      if (failedToGetVideo) return;

      // can be uncommented if you don't want the bot to play videos longer than 1 hour
      let endur = parseInt(PlayCommand.durationrawed(video.duration))
      endur = (endur / (1000 * 60 * 60)) % 24
      if ( endur > 5) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | I cannot play videos longer than 5 hour!`)
        srch.edit('', errvideoEmbed);
        return;
      }

      // can be uncommented if you want to limit the queue
      if (message.guild.musicData.queue.length >= 1000) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | There are too many songs in the queue already, skip or wait a bit!`)
        srch.edit('', errvideoEmbed);
        return;
      }

      // push song to queue
      message.guild.musicData.queue.push(
        PlayCommand.constructSongObj1(video, message.member.user)
      );

      // generating duration
      let sum = 0, u;
      let dur = ''
      for (u = 0; u < message.guild.musicData.queue.length - 1; u +=1 ) {
        sum += (+message.guild.musicData.queue[i].rawDuration);
      }

      // checking livestream or not 
      if (PlayCommand.durationrawed(video.duration) > 0) {
        dur = PlayCommand.msToTime(PlayCommand.durationrawed(video.duration))
      } else {
        dur = 'Live Stream'
      }

      // info and run
      if (
        message.guild.musicData.isPlaying == false ||
        typeof message.guild.musicData.isPlaying == 'undefined'
      ) {
        message.guild.musicData.isPlaying = true;
        srch.delete();
        return playSong(message.guild.musicData.queue, message, 0);
      } else if (message.guild.musicData.isPlaying == true) {
        const addvideoEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
        .setDescription(`**[${video.title}](${video.url})**`)
        .addField(`Song Duration`,`${dur}`, true)
        .addField(`Estimated time`,`${PlayCommand.msToTime((message.guild.musicData.nowPlaying.rawDuration - (message.guild.musicData.songDispatcher.streamTime + (message.guild.musicData.seek * 1000))) + sum)}`, true)
        .addField(`Potition `,`#${message.guild.musicData.queue.length} in queue`, true)
        .setThumbnail(video.thumbnails.high.url)
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

    // can be uncommented if you don't want the bot to play videos longer than 1 hour
    let endur = (videos[0].duration / (1000 * 60 * 60)) % 24
    if ( endur > 5) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | I cannot play videos longer than 5 hour`)
      srch.edit('', errvideoEmbed);
      return;
    }

    // can be uncommented if you want to limit the queue
    if (message.guild.musicData.queue.length >= 1000) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | There are too many songs in the queue already, skip or wait a bit`)
      srch.edit('', errvideoEmbed);
      return;
    }

    // push song to queue
    message.guild.musicData.queue.push(
      PlayCommand.constructSongObj(
        videos[0],
        message.member.user
      )
    );

    // generating duration
    let sum = 0, p;
    let dur = ''
    for (p = 0; p < message.guild.musicData.queue.length - 1; p +=1 ) {
      sum += (+message.guild.musicData.queue[i].rawDuration);
    }

    // checking livestream or not
    if (videos[0].duration > 0) {
      dur = videos[0].durationFormatted
    } else {
      dur = 'Live Stream'
    }

    // info and run
    if (message.guild.musicData.isPlaying == false) {
      message.guild.musicData.isPlaying = true;
      srch.delete();
      playSong(message.guild.musicData.queue, message, 0);
    } else if (message.guild.musicData.isPlaying == true) {
      let url = `https://youtube.com/watch?v=${videos[0].id}`;
      const addvideoEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
      .setDescription(`**[${videos[0].title}](${url})**`)
      .addField(`Song Duration`,`${dur}`, true)
      .addField(`Estimated time`,`${PlayCommand.msToTime((message.guild.musicData.nowPlaying.rawDuration - (message.guild.musicData.songDispatcher.streamTime + (message.guild.musicData.seek * 1000))) + sum)}`, true)
      .addField(`Potition`,`**#**${message.guild.musicData.queue.length} in queue`, true)
      .setThumbnail(videos[0].thumbnail.url)
      srch.edit('', addvideoEmbed);
      return;
    }
  }

  // simple youtube api
  static constructSongObj(video, user) { 
    let duration = video.durationFormatted;
    if (duration == '0:00') duration = 'Live Stream';
    return {
      url: `https://youtube.com/watch?v=${video.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
      thumbnail: video.thumbnail.high.url,
      memberDisplayName: user.tag,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }

  // ytsr
  static constructSongObj1(video, user) {
    let duration = this.formatDuration(video.duration);
    if (duration == '0:00') duration = 'Live Stream';
    return {
      url: `https://youtube.com/watch?v=${video.raw.id}`,
      title: video.title,
      rawDuration: this.durationrawed(video.duration),
      duration,
      thumbnail: video.thumbnails.high.url,
      memberDisplayName: user.tag,
      memberAvatar: user.avatarURL('webp', false, 16)
    };
  }

  // formating duration
  static formatDuration(durationObj) {
    const duration = `${durationObj.hours ? (durationObj.hours + ':') : ''}${
      durationObj.minutes ? durationObj.minutes : '0'
    }:${
      (durationObj.seconds < 10)
        ? ('0' + durationObj.seconds)
        : (durationObj.seconds
        ? durationObj.seconds
        : '00')
    }`;
    return duration;
  }

  // rawing duration
  static durationrawed(duration){
    const totalDurationObj = duration;
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
    return totalDurationInMS
  }

  // formating milliseacon to formated time
  static msToTime(duration) {
    var seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24),
      days = parseInt((duration / (1000 * 60 * 60 * 24)) % 365);
  
    hours = (hours < 10) ? hours : hours;
    minutes = (minutes < 10) ? minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    if (days !== 0) {
      return days + ":" + hours + ":" + minutes + ":" + seconds;
    } else if (hours !== 0) {
      return hours + ":" + minutes + ":" + seconds;
    } else {
      return minutes + ":" + seconds;
    }   
  }
};
