const { MessageEmbed } = require('discord.js');
const ytdl = require('discord-ytdl-core');
const ytdl1 = require('ytdl-core');
const spdl = require('spdl-core').default;
const { normalcolor, errorcolor, prefix, cmoji, xmoji } = require('../../config.json');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = {
  async playSong(queue, message, seekAmount) {
    if (queue[0].voiceChannel == undefined) {
      // happens when loading a saved playlist
      queue[0].voiceChannel = message.member.voice.channel;
    }
    if (message.guild.musicData.seek > 0) {
      if (collector && !collector.end) collector.stop();
    }
    let vol = await db.get(`${message.guild.id}.settings`)
    let fil = await db.get(`${message.guild.id}.settings.filters`)
    if (!fil) {
      db.set(`${message.guild.id}.settings`, { volume: vol.volume, maxvolume: vol.maxvolume, nowplaying: vol.nowplaying, timeout: vol.timeout, filters: { bassboost: false, nightcore: false, karaoke: false} })
    }
    const vol1 = vol.volume / 100;
    let bbzero = null;
    let bbzero1 = null;
    const filterss = {
      bassboost: 'bass=g=15,dynaudnorm=f=200',
      nightcore: 'aresample=48000,asetrate=48000*1.25',
      karaoke: 'stereotools=mlev=0.015625'
    }
    const encoderArgsFilters = []
    Object.keys(fil).forEach((filterName) => {
      if (fil[filterName] === true) {
        encoderArgsFilters.push(filterss[filterName])
      }
    })
    let encoderArgs
    if (encoderArgsFilters.length < 1) {
      encoderArgs = []
    } else {
      encoderArgs = ['-af', encoderArgsFilters.join(',')]
    }
    if (queue[0].duration === 'Live Stream') {
      bbzero = await ytdl1(queue[0].url, { 
        quality: `highestaudio`, 
        filter: () => ['251'], 
        highWaterMark: 1 << 25 
      });
      bbzero1 = {
        volume: vol1,
        seek: seekAmount
      };
    } else {
      bbzero = await ytdl(queue[0].url, {
        quality: `highestaudio`, 
        filter: 'audioonly',
        opusEncoded: true,
        encoderArgs,
        seek: seekAmount,
        highWaterMark: 1 << 25 
      });
      bbzero1 = {
        type: 'opus',
        bitrate: 360,
        volume: vol1
      };
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
        const dispatcher = connection
          .play(bbzero, bbzero1)
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
            if (message.guild.musicData.loop == 'track') {
              for (let i = 0; i < 1; i++) {
                message.guild.musicData.queue.unshift(message.guild.musicData.nowPlaying);
              }
              if (queue.length >= 1) {
                module.exports.playSong(queue, message, 0);
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
                  }, 300000);
                }
              }
            } else if (message.guild.musicData.loop == 'queue') {
              message.guild.musicData.queue.push(message.guild.musicData.nowPlaying);
              if (queue.length >= 1) {
                module.exports.playSong(queue, message, 0);
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
                  }, 300000);
                }
              }
            } else if (message.guild.musicData.loop == 'off') {
              if (queue.length >= 1) {
                module.exports.playSong(queue, message, 0);
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
                  }, 300000);
                }
              }
            };  
          })
          .on('error', function(e) {
            if (message.guild.musicData.errorP < 3) {
              message.say(`Cannot play ${queue[0].title} song`);
              db.set(`${message.guild.id}.errorLogs`, `${e}`)
              message.guild.musicData.errorP = message.guild.musicData.errorP + 1
              if (queue) module.exports.playSong(queue, message, 0);
            } else {
              message.say(`Error playing music, resetting...`);
              message.guild.musicData.errorP = 0;
              message.guild.resetMusicDataOnError();
              if (message.guild.me.voice.channel) {
                message.guild.me.voice.channel.leave();
              }
            }
            return;
          });
      })
      .catch(function() {
        message.say('I have no permission to join your channel!');
        message.guild.resetMusicDataOnError();
        if (message.guild.me.voice.channel) {
          message.guild.me.voice.channel.leave();
        }
        return;
      }); 

      const videoEmbed = new MessageEmbed()
      .setThumbnail(queue[0].thumbnail)
      .setAuthor(`Now Playing`, message.member.user.avatarURL('webp', false, 16))
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
 },

 async spPlaySong(queue, message) {
  if (queue[0].voiceChannel == undefined) {
    // happens when loading a saved playlist
    queue[0].voiceChannel = message.member.voice.channel;
  }
  if (message.guild.musicData.seek > 0) {
    if (collector && !collector.end) collector.stop();
  }
  let vol = await db.get(`${message.guild.id}.settings`)
  let fil = await db.get(`${message.guild.id}.settings.filters`)
  if (!fil) {
    db.set(`${message.guild.id}.settings`, { volume: vol.volume, maxvolume: vol.maxvolume, nowplaying: vol.nowplaying, timeout: vol.timeout, filters: { bassboost: false, nightcore: false, karaoke: false} })
  }
  const vol1 = vol.volume / 100;
  let bbzero1 = null;
    bbzero1 = {
      type: 'opus',
      bitrate: 360,
      volume: vol1
    };
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
      const dispatcher = connection
        .play(await spdl(queue[0].url), bbzero1)
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
          if (message.guild.musicData.loop == 'track') {
            for (let i = 0; i < 1; i++) {
              message.guild.musicData.queue.unshift(message.guild.musicData.nowPlaying);
            }
            if (queue.length >= 1) {
              module.exports.playSong(queue, message, 0);
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
                }, 300000);
              }
            }
          } else if (message.guild.musicData.loop == 'queue') {
            message.guild.musicData.queue.push(message.guild.musicData.nowPlaying);
            if (queue.length >= 1) {
              module.exports.playSong(queue, message, 0);
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
                }, 300000);
              }
            }
          } else if (message.guild.musicData.loop == 'off') {
            if (queue.length >= 1) {
              module.exports.playSong(queue, message, 0);
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
                }, 300000);
              }
            }
          };  
        })
        .on('error', function(e) {
          if (message.guild.musicData.errorP < 3) {
            message.say(`Cannot play ${queue[0].title} song`);
            db.set(`${message.guild.id}.errorLogs`, `${e}`)
            message.guild.musicData.errorP = message.guild.musicData.errorP + 1
            if (queue) module.exports.playSong(queue, message, 0);
          } else {
            message.say(`Error playing music, resetting...`);
            message.guild.musicData.errorP = 0;
            message.guild.resetMusicDataOnError();
            if (message.guild.me.voice.channel) {
              message.guild.me.voice.channel.leave();
            }
          }
          return;
        });
    })
    .catch(function() {
      message.say('I have no permission to join your channel!');
      message.guild.resetMusicDataOnError();
      if (message.guild.me.voice.channel) {
        message.guild.me.voice.channel.leave();
      }
      return;
    }); 

    const videoEmbed = new MessageEmbed()
    .setThumbnail(queue[0].thumbnail)
    .setAuthor(`Now Playing`, message.member.user.avatarURL('webp', false, 16))
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
}