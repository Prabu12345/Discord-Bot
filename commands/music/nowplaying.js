const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      guildOnly: true,
      description: 'Display the currently playing song',
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }

  async run(message) {
    const video = message.guild.musicData.nowPlaying;
    const errnpEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (
      (!message.guild.musicData.isPlaying &&
        !message.guild.musicData.nowPlaying) ||
      message.guild.triviaData.isTriviaRunning
    ) {
      errnpEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errnpEmbed);
    }

    let description;
    if (video.live == true || video.duration == 'Live Stream') {
      description = 'Live Stream';
    } else {
      description = NowPlayingCommand.playbackBar(message, video);
    }
    let vol = await db.get(`${message.guild.id}.settings`);
    const videoEmbed = new MessageEmbed()
      .setThumbnail(video.thumbnail)
      .setColor(normalcolor)
      .setAuthor(`Now Playing`, message.member.user.avatarURL('webp', false, 16))
      .setTitle(`${video.title}`)
      .setDescription(`${description}\n**Volume** ${vol.volume}% | **Loop** ${message.guild.musicData.loop}`)
      .setURL(video.url)
      .setFooter(
        `Requested by ${video.memberDisplayName}`
      );
    message.channel.send(videoEmbed);
    return;
  }
  static playbackBar(message, video) {
    const passedTimeInMS = (message.guild.musicData.songDispatcher.streamTime + (message.guild.musicData.seek * 1000)).toFixed(0);
    const passedTimeInMSObj = {
      seconds: Math.floor((passedTimeInMS / 1000) % 60),
      minutes: Math.floor((passedTimeInMS / (1000 * 60)) % 60),
      hours: Math.floor((passedTimeInMS / (1000 * 60 * 60)) % 24)
    };
    const passedTimeFormatted = NowPlayingCommand.formatDuration(
      passedTimeInMSObj
    );

    const totalDurationObj = {
      seconds: Math.floor((video.rawDuration / 1000) % 60),
      minutes: Math.floor((video.rawDuration / (1000 * 60)) % 60),
      hours: Math.floor((video.rawDuration / (1000 * 60 * 60)) % 24)
    };
    const totalDurationFormatted = NowPlayingCommand.formatDuration(
      totalDurationObj
    );

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
    const playBackBarLocation = Math.round(
      (passedTimeInMS / totalDurationInMS) * 10
    );
    let playBack = '';
    for (let i = 1; i < 21; i++) {
      if (playBackBarLocation == 0) {
        playBack = '🔘▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬';
        break;
      } else if (playBackBarLocation == 10) {
        playBack = '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬🔘';
        break;
      } else if (i == playBackBarLocation * 2) {
        playBack = playBack + '🔘';
      } else {
        playBack = playBack + '▬';
      }
    }
    playBack = `${passedTimeFormatted}  ${playBack}  ${totalDurationFormatted}`;
    return playBack;
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
