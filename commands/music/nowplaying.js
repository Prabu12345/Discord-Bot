const { MessageEmbed } = require('discord.js');
const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class NowPlayingCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nowplaying',
      group: 'music',
      memberName: 'nowplaying',
      aliases: ['np', 'currently-playing', 'now-playing'],
      guildOnly: true,
      description: 'Display the currently playing song'
    });
  }

  run(message) {
    const video = message.guild.musicData.nowPlaying;
    const errnpEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (
      (!message.guild.musicData.isPlaying &&
        !message.guild.musicData.nowPlaying) ||
      message.guild.triviaData.isTriviaRunning
    ) {
      errnpEmbed.setDescription('There is no song playing right now!')
      return message.say(errnpEmbed);
    }

    let description;
    if (video.live == true) {
      description = 'Live Stream';
    } else {
      description = NowPlayingCommand.playbackBar(message, video);
    }

    const videoEmbed = new MessageEmbed()
      .setThumbnail(video.thumbnail)
      .setColor(normalcolor)
      .setTitle(`Now Playing`, message.member.user.avatarURL('webp', false, 16))
      .setDescription(`[${video.title}](${video.url})`)
      .addField('Music Settings' ,`Volume ${message.guild.musicData.volume}% | Loop ${message.guild.musicData.loop}`)
      .addField('Duration', description)
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

    const totalDurationObj = video.rawDuration;
    const totalDurationFormatted = totalDurationObj

    let totalDurationInMS = 0;
    Object.keys(totalDurationObj).forEach(function(key) {
      if (key == 'hours') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 3600000;
      } else if (key == 'minutes') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 60000;
      } else if (key == 'seconds') {
        totalDurationInMS = totalDurationInMS + totalDurationObj[key] * 100;
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
