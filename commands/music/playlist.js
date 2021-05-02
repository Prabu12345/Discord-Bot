const { MessageEmbed } = require('discord.js');
const { playSong } = require('../../resources/music/play')
const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");
const Youtube = require('simple-youtube-api');
const Youtube1 = require('youtube-sr').default;
const Pagination = require('discord-paginationembed');
const { Spotify } = require('spotify-info.js')
const { stripIndents, oneLine } = require('common-tags')
const { youtubeAPI, normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);
const spotify = new Spotify({
  clientID: "540def33c9bb4c94b7d3b5bb51615624",
  clientSecret: "89c15cd0add944c6bef3be863b964d9f",
});

module.exports = class PlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'playlist',
      group: 'music',
      memberName: 'playlist',
      guildOnly: true,
      description: 'Create and save playlist',
      details: 'Type -> create ( create playlist ), add ( add song to playlist ), play ( play saved playlist ), remove ( remove song from playlist ), delete ( delete playlist ), see ( see song in playlist )', 
      examples: ['playlist', 'playlist create music', 'playlist add music https://www.youtube.com/watch?', 'playlist play music', 'playlist remove music 1', 'playlist delete music', 'playlist see music'],
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'type',
          prompt: 'What is the name of the playlist you would like to create?',
          type: 'string',
          default: ''
        },
        {
            key: 'additional',
            prompt: 'What is the name of the playlist you would like to create?',
            type: 'string',
            default: ''
          }
      ]
    });
  }

  async run(message, { type, additional }) {
    if (type.toLowerCase() == 'play') {
        const voiceChannel = message.member.voice.channel;
        if (additional == '') return message.channel.send(`${xmoji} | You must include a name for this playlist.`)
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
        } else if (message.guild.me.voice.channel) {
          if (message.member.voice.channel.id !== message.guild.me.voice.channel.id) {
            const errleaveEmbed = new MessageEmbed()
            .setColor(errorcolor)
            .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
            return message.say(errleaveEmbed);
          }
        }
        const userPlaylists = await db.get(`${message.member.id}.savedPlaylist`);
        const found = userPlaylists.find(element => element.name == additional);
        if (found) {
            const urlsArray = userPlaylists[userPlaylists.indexOf(found)].urls;
            if (!urlsArray.length) {
                message.reply(
                  `\`${additional}\` playlist is empty, add songs to it before attempting to play it`
                );
                return;
            }
            urlsArray.map(element =>
                message.guild.musicData.queue.push(element)
            );
            if (message.guild.musicData.isPlaying) {
                message.reply(`🎵 **${additional}** added ${urlsArray.length} songs to the queue!`);
            } else if (!message.guild.musicData.isPlaying) {
                message.guild.musicData.isPlaying = true;
                message.reply(`🎵 **${additional}** added ${urlsArray.length} songs to the queue!`);
                playSong(message.guild.musicData.queue, message, 0);
            }   
        } else {
            message.reply(`You have no playlist named ${additional}`)
        }
    } else if (type.toLowerCase() == 'add') {
        if (additional == '') return message.channel.send(`${xmoji} | You must include a name and url for this playlist.`)
        let addive = additional.split(' ');
        if (addive[1] == undefined) return message.channel.send(`${xmoji} | You must include a url for this playlist.`)
        const dbUserFetch = await db.get(`${message.member.id}.savedPlaylist`);
        if (!dbUserFetch) {
            message.reply('You have zero saved playlists!');
            return;
        }
        const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
        if (savedPlaylistsClone.length == 0) {
            message.reply('You have zero saved playlists!');
            return;
        }
        message.channel.send(`:mag_right: | **Searching** \`${addive[1]}\``);
        let found = false;
        let location;
        for (let i = 0; i < savedPlaylistsClone.length; i++) {
            if (savedPlaylistsClone[i].name == addive[0]) {
                found = true;
                location = i;
                break;
            }
        }
        if (found) {
            let urlsArrayClone = savedPlaylistsClone[location].urls;
            let items = urlsArrayClone
            if(urlsArrayClone.length > 99){
            message.reply(`There is already reached limit of playlist`);
            return;
        }
        const processedURL = await PlaylistCommand.processURL(addive[1], message);
        if (Array.isArray(processedURL)) {
            if (!processedURL) return;
                if((items.length + processedURL.length) > 99){
                message.reply(`This playlists are more than limit of playlists!`);
                return;
            }
            urlsArrayClone = urlsArrayClone.concat(processedURL);
            savedPlaylistsClone[location].urls = urlsArrayClone;
            message.reply('The playlists was successfully saved!');
        } else {
            if (!processedURL) return;
            urlsArrayClone.push(processedURL);
            savedPlaylistsClone[location].urls = urlsArrayClone;
            message.reply(
                `I added **${
                savedPlaylistsClone[location].urls[
                savedPlaylistsClone[location].urls.length - 1
                ].title
            }** to **${addive[0]}**`
            );
        }
        db.set(message.member.id, { savedPlaylist: savedPlaylistsClone });
        } else {
            message.reply(`You have no playlist named ${addive[0]}`);
            return;
        }
    } else if (type.toLowerCase() == 'remove') {
        if (additional == '') return message.channel.send(`${xmoji} | You must include a name and index for this playlist.`)
        let addimove = additional.split(' ')
        if (addimove[1] == undefined) return message.channel.send(`${xmoji} | You must include a index for this playlist.`)
        const dbUserFetch = await db.get(`${message.member.id}.savedPlaylist`);
        if (!dbUserFetch) {
          message.reply('You have zero saved playlists!');
          return;
        }
        const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
        if (savedPlaylistsClone.length == 0) {
          message.reply('You have zero saved playlists!');
          return;
        }
    
        let found = false;
        let location;
        for (let i = 0; i < savedPlaylistsClone.length; i++) {
          if (savedPlaylistsClone[i].name == addimove[0]) {
            found = true;
            location = i;
            break;
          }
        }
        if (found) {
          const urlsArrayClone = savedPlaylistsClone[location].urls;
          if (urlsArrayClone.length == 0) {
            message.reply(`**${additional}** is empty!`);
            return;
          } else if (addimove[1] > urlsArrayClone.length) {
            message.reply(
              `The index you provided is larger than the playlist's length`
            );
            return;
          }
          const title = urlsArrayClone[addimove[1] - 1].title;
          urlsArrayClone.splice(addimove[1] - 1, 1);
          savedPlaylistsClone[location].urls = urlsArrayClone;
          db.set(message.member.id, { savedPlaylist: savedPlaylistsClone });
          message.reply(
            `I removed **${title}** from **${savedPlaylistsClone[location].name}**`
          );
          return;
        } else {
          message.reply(`You have no playlist named **${additional}**`);
          return;
        }
    } else if (type.toLowerCase() == 'create') {
        if (additional == '') return message.channel.send(`${xmoji} | You must include a name for this playlist.`)
        let new1 = await db.get(message.member.id)
        if (!new1) {
          db.set(message.member.id, {
            savedPlaylist: [{ name: additional, urls: [] }]
          });
          message.reply(`Created a new playlist named **${additional}**`);
          return;
        }
        let new2 = await db.get(`${message.member.id}.savedPlaylist`)
        if(new2.length >= 8){
          message.reply(`There is already reached limit of playlist!`);
          return;
        }
        // make sure the playlist name isn't a duplicate
        for (let i = 0; i < new2.length; i++) {
            if (
                new2[i].name == additional
            ) {
              message.reply(
                `There is already a playlist named **${additional}** in your saved playlists!`
              );
              return;
            }
        }
        // create and save the playlist in the db
        db.push(`${message.member.id}.savedPlaylist`, { name: additional, urls: [] });
        message.reply(`Created a new playlist named **${additional}**`);
    } else if (type.toLowerCase() == 'delete') {
        if (additional == '') return message.channel.send(`${xmoji} | You must include a name for this playlist.`)
        const dbUserFetch = await db.get(message.member.id);
        if (!dbUserFetch) {
          message.reply('You have zero saved playlists!');
          return;
        }
        const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
        if (savedPlaylistsClone.length == 0) {
          message.reply('You have zero saved playlists!');
          return;
        }
    
        let found = false;
        let location;
        for (let i = 0; i < savedPlaylistsClone.length; i++) {
          if (savedPlaylistsClone[i].name == additional) {
            found = true;
            location = i;
            break;
          }
        }
        if (found) {
          savedPlaylistsClone.splice(location, 1);
          db.set(message.member.id, { savedPlaylist: savedPlaylistsClone });
          message.reply(`I removed **${additional}** from your saved playlists!`);
        } else {
          message.reply(`You have no playlist named ${additional}`);
        }
    } else if (type.toLowerCase() == 'see') {
        if (additional == '') return message.channel.send(`${xmoji} | You must include a name for this playlist.`)
        const dbUserFetch = await db.get(`${message.member.id}.savedPlaylist`);
        if (!dbUserFetch) {
            message.reply('You have zero saved playlists!');
            return;
        }
        const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
        if (savedPlaylistsClone.length == 0) {
            message.reply('You have zero saved playlists!');
            return;
        }

        let found = false;
        let location;
        for (let i = 0; i < savedPlaylistsClone.length; i++) {
            if (savedPlaylistsClone[i].name == additional) {
                found = true;
                location = i;
                break;
            }
            }
        if (found) {
        const urlsArrayClone = savedPlaylistsClone[location].urls;
        if (urlsArrayClone.length == 0) {
            message.reply(`**${additional}** is empty!`);
            return;
        }
        const savedSongsEmbed = new Pagination.FieldsEmbed()
        .setArray(urlsArrayClone)
        .setAuthorizedUsers([message.member.id])
        .setChannel(message.channel)
        .setElementsPerPage(8)
        .formatField('# - Title', function(e) {
          return `**${urlsArrayClone.indexOf(e) + 1}**: [${e.title}](${e.url})`;
        });
        savedSongsEmbed.embed.setColor(normalcolor).setTitle(`💾 ${additional} Saved Songs`).setFooter(`${urlsArrayClone.length}/100`);
        savedSongsEmbed.build();
        } else {
            message.reply(`You have no playlist named ${additional}`);
        }
    } else if (type.toLowerCase() == '') {
        const dbUserFetch = await db.get(`${message.member.id}.savedPlaylist`);
        if (!dbUserFetch) {
          message.reply('You have zero saved playlists!');
          return;
        }
        const savedPlaylistsClone = await db.get(`${message.member.id}.savedPlaylist`);
        if (savedPlaylistsClone.length == 0) {
          message.reply('You have zero saved playlists!');
          return;
        }
        const playlistsEmbed = new Pagination.FieldsEmbed()
          .setArray(savedPlaylistsClone)
          .setAuthorizedUsers([message.author.id])
          .setChannel(message.channel)
          .setElementsPerPage(5)
          .formatField('# - Playlist', function(e) {
            return `**${savedPlaylistsClone.indexOf(e) + 1}**: ${e.name}`;
          });
    
        playlistsEmbed.embed.setColor(normalcolor).setTitle('💾 My Saved Playlists').setFooter(`${savedPlaylistsClone.length}/8`);
        playlistsEmbed.build();
    }
  }

  static async processURL(url, message) {
    if (url.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)) {
      var updatedQuery;
      const spotifyData = await spotify.getTrackByURL(url).catch(() => {})
      if (spotifyData) {
        updatedQuery = `${spotifyData.artist} - ${spotifyData.title}`
      }
      const videos = await Youtube1.search(updatedQuery, { type: 'video', limit: 1, safeSearch: true })
      if (videos.length < 1 || !videos) {
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | I had some trouble finding what you were looking for, please try again or be more specific`)
        message.say(errvideoEmbed);
        return;
      }
      return SaveToPlaylistCommand.constructSongObj(video, message.member.user);
    }
    if (url.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/)) {
      const album = await spotify.getPlaylistByURL(url)
      if (!album) {
        const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | playlist not found`)
      return message.say(errvideoEmbed);
      }
      const tracks = []
      for (let i = 0; i < album.tracks.items.length; i++) {
        const updatequery = `${album.tracks.items[i].track.artists[0].name} - ${album.tracks.items[i].track.name}`
        const results = await Youtube1.search(updatequery, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
          await message.say(errvideoEmbed);
          return;
        });
        if (results.length < 1) {
            continue
        }
        tracks.push(results[0])
      }
      let urlsArr = [];
      for (let i = 0; i < tracks.length; i++) {
        try {
          const video = await tracks[i];
          urlsArr.push(
            SaveToPlaylistCommand.constructSongObj1(video, message.member.user)
          );
        } catch (err) {
          return console.error(err);
        }
      }
      return urlsArr;
    }
    if (url.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/)) {
      const album = await spotify.getAlbumByURL(url)
      if (!album) {
        const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | Album not found`)
      return message.say(errvideoEmbed);
      }
      const tracks = []
      for (let i = 0; i < album.tracks.items.length; i++) {
        const updatequery = `${album.tracks.items[i].artists[0].name} - ${album.tracks.items[i].name}`
        const results = await Youtube1.search(updatequery, { type: 'video', limit: 1, safeSearch: true }).catch(async function() {
          const errvideoEmbed = new MessageEmbed()
          .setColor(errorcolor)
          .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
          await message.say(errvideoEmbed);
          return;
        });
        if (results.length < 1) {
            continue
        }
        tracks.push(results[0])
      }
      let urlsArr = [];
      for (let i = 0; i < tracks.length; i++) {
        try {
          urlsArr.push(
            SaveToPlaylistCommand.constructSongObj1(tracks[i], message.member.user)
          );
        } catch (err) {
          return console.error(err);
        }
      }
      return urlsArr;
    }
    if (url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.*\?.*\blist=.*$/)) {
      const playlist = await youtube.getPlaylist(url).catch(function() {
        message.reply(':x: | Playlist is either private or it does not exist!');
        return;
      });
      if (playlist) {
        const videosArr = await playlist.getVideos().catch(function() {
          message.reply(
            ':x: | There was a problem getting one of the videos in the playlist!'
          );
          return;
        });
        let urlsArr = [];
        for (let i = 0; i < videosArr.length; i++) {
          if (videosArr[i].raw.status.privacyStatus == 'private') {
            continue;
          } else {
            try {
              const video = await videosArr[i].fetch();
              urlsArr.push(
                SaveToPlaylistCommand.constructSongObj(video, message.member.user)
              );
            } catch (err) {
              return console.error(err);
            }
          }
        }
        return urlsArr;
      } else {
        return;
      }
    }
    url = url
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    const id = url[2].split(/[^0-9a-z_\-]/i)[0];
    const video = await youtube.getVideoByID(id).catch(function() {
      message.reply(':x: | There was a problem getting the video you provided!');
      return;
    });
    if (video.raw.snippet.liveBroadcastContent === 'live') {
      message.reply(`${xmoji} | I not support live streams!`);
      return false;
    }
    return SaveToPlaylistCommand.constructSongObj(video, message.member.user);
  }
  static constructSongObj(video, user) {
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
  static constructSongObj1(video, user) {
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