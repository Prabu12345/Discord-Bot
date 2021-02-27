const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");
const Youtube = require('simple-youtube-api');
const { youtubeAPI } = require('../../config.json');
const youtube = new Youtube(youtubeAPI);

module.exports = class SaveToPlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'save-to-playlist',
      aliases: ['stp', 'save-song', 'add-to-playlist', 'add-song'],
      group: 'music',
      memberName: 'save-to-playlist',
      guildOnly: true,
      description: 'Save a song or a playlist to a saved playlist',
      args: [
        {
          key: 'playlist',
          prompt: 'What is the playlist you would like to save to?',
          type: 'string'
        },
        {
          key: 'url',
          prompt:
            'What url would you like to save to playlist? It can also be a playlist url',
          type: 'string',
          validate: function validateURL(url) {
            return (
              url.match(
                /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.*\?.*\blist=.*$/
              ) ||
              url.match(
                /^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/
              ) ||
              url.match(
                /^(?!.*\?.*\bv=)https:\/\/www\.youtube\.com\/.*\?.*\blist=.*$/ 
              ) ||
              url.match(
                /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/
              ) ||
              url.match(
                /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:playlist\/|\?uri=spotify:playlist:)((\w|-){22})/
              ) ||
              url.match(
                /^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:album\/|\?uri=spotify:album:)((\w|-){22})/
              )
            );
          }
          // default: '' // @TODO support saving currently playing song
        }
      ]
    });
  }

  async run(message, { playlist, url }) {
    // check if user has playlists or user is in the db
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
      if (savedPlaylistsClone[i].name == playlist) {
        found = true;
        location = i;
        break;
      }
    }
    if (found) {
      let urlsArrayClone = savedPlaylistsClone[location].urls;
      const processedURL = await SaveToPlaylistCommand.processURL(url, message);
      if (Array.isArray(processedURL)) {
        urlsArrayClone = urlsArrayClone.concat(processedURL);
        savedPlaylistsClone[location].urls = urlsArrayClone;
        message.reply('The playlist you provided was successfully saved!');
      } else {
        urlsArrayClone.push(processedURL);
        savedPlaylistsClone[location].urls = urlsArrayClone;
        message.reply(
          `I added **${
            savedPlaylistsClone[location].urls[
              savedPlaylistsClone[location].urls.length - 1
            ].title
          }** to **${playlist}**`
        );
      }
      db.set(message.member.id, { savedPlaylist: savedPlaylistsClone });
    } else {
      message.reply(`You have no playlist named ${playlist}`);
      return;
    }
  }

  static async processURL(url, message) {
    if (url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.*\?.*\blist=.*$/)) {
      const playlist = await youtube.getPlaylist(url).catch(function() {
        message.reply(':x: Playlist is either private or it does not exist!');
        return;
      });
      const videosArr = await playlist.getVideos().catch(function() {
        message.reply(
          ':x: There was a problem getting one of the videos in the playlist!'
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
    }
    url = url
      .replace(/(>|<)/gi, '')
      .split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    const id = url[2].split(/[^0-9a-z_\-]/i)[0];
    const video = await youtube.getVideoByID(id).catch(function() {
      message.reply(':x: There was a problem getting the video you provided!');
      return;
    });
    if (video.raw.snippet.liveBroadcastContent === 'live') {
      message.reply("I don't support live streams!");
      return false;
    }
    return SaveToPlaylistCommand.constructSongObj(video, message.member.user);
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