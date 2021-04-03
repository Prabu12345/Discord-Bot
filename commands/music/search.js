const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const youtube = require('youtube-sr').default;
const { youtubeAPI, normalcolor, errorcolor, xmoji, cmoji } = require('../../config.json');
const { playSong } = require('../music/play')

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
          default: '',
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
    } else if (message.member.voice.channel.id !== message.guild.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errleaveEmbed);
    } else if (query.length == 0){
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`**Usage:** -search <Video Name>`)
      return message.say(errvideoEmbed);
    }

    const srch = await message.channel.send(`:mag_right: | **Searching** \`${query}\``);
    const videos = await youtube.search(query, { type: 'video', limit: 5, safeSearch: true }).catch(async function() {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | There was a problem searching the video you requested :(`)
      await srch.edit('', errvideoEmbed);
      return;
    });
    if (videos.length < 5 || !videos) {
      if (query.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)) return;
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | I had some trouble finding what you were looking for, please try again or be more specific`)
      srch.edit('', errvideoEmbed);
      return;
    }

    const vidNameArr = [];
    for (let i = 0; i < videos.length; i++) {
      vidNameArr.push(`${i + 1}| ${videos[i].title}`);
    }
    vidNameArr.push('exit');
    const embed = new MessageEmbed()
      .setColor(normalcolor)
      .setTitle('Choose a song by commenting a number between 1 and 5')
      .setDescription(`${vidNameArr[0]}\n${vidNameArr[1]}\n${vidNameArr[2]}\n${vidNameArr[3]}\n${vidNameArr[4]}`)
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
              videos[videoIndex - 1],
              message.member.user
            )
          );
          let sum = 0, i;
          let dur = ''
          for (i = 0; i < message.guild.musicData.queue.length; i +=1 ) {
            sum += (+message.guild.musicData.queue[i].rawDuration);
          }
          if (message.guild.musicData.queue[message.guild.musicData.queue.length].duration = 'Live Stream') {
            dur = message.guild.musicData.queue[message.guild.musicData.queue.length].duration
          } else {
            dur = 'Live Stream'
          }
          if (message.guild.musicData.isPlaying == false) {
            message.guild.musicData.isPlaying = true;
            if (songEmbed) {
              songEmbed.delete();
            }
            srch.delete();
            playSong(message.guild.musicData.queue, message, 0);
          } else if (message.guild.musicData.isPlaying == true) {
            if (songEmbed) {
              songEmbed.delete();
            }
            let url = `https://youtube.com/watch?v=${videos.id}`;
            const addvideoEmbed = new MessageEmbed()
            .setColor(normalcolor)
            .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
            .setDescription(`${[videos[0].title](url)}`)
            .addField(`Song Duration`,`${dur}`, true)
            .addField(`Estimated time until playing`,`${searchCommand.msToTime(message.guild.musicData.songDispatcher.streamTime + message.guild.musicData.seek + sum)}`, true)
            .addField(`Potition in queue`,`**#**${message.guild.musicData.queue.length}`, true)
            .setThumbnail(videos[0].thumbnail.url)
            srch.edit('', addvideoEmbed);
            return;
          }
      })
      .catch(function(e) {
        if (songEmbed) {
          songEmbed.delete();
        }
        console.error(e)
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | Please try again and enter a number between 1 and 5 or exit`)
        srch.edit('', errvideoEmbed);
        return;
      });  
  
  }
  static constructSongObj(video, user) {
    let duration = video.durationFormatted;
    if (duration == '0:00') duration = 'Live Stream';
    return {
      url: `https://youtube.com/watch?v=${video.id}`,
      title: video.title,
      rawDuration: video.duration,
      duration,
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

  static msToTime(duration) {
    var seconds = parseInt((duration / 1000) % 60),
        minutes = parseInt((duration / (1000 * 60)) % 60),
        hours = parseInt((duration / (1000 * 60 * 60)) % 24);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    if (hours !== "00")
      return hours + ":" + minutes + ":" + seconds;
    else
      return minutes + ":" + seconds;
  }
}
