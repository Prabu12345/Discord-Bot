const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const youtube = require('youtube-sr').default;
const { youtubeAPI, normalcolor, errorcolor, xmoji, cmoji } = require('../../config.json');
const { playSong } = require('../../resources/music/play')

module.exports = class searchCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'search',
      aliases: ['src'],
      memberName: 'search',
      group: 'music',
      description: 'search any song from youtube',
      guildOnly: true,
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
      message.reply(`${xmoji} | Join a channel and try again`)
      return;
    } 
    
    const { clientperm } = require('../../resources/permission')
    const acces = await clientperm(message, ['EMBED_LINKS', 'MANAGE_MESSAGES'], ['SPEAK', 'CONNECT'] )
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
      message.say(errvideoEmbed);
      return;
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
      vidNameArr.push(`**${i + 1} |** ${videos[i].title}`);
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
          return (msg.content > 0 && msg.content < 6 && msg.author.id === message.author.id) || msg.content === 'exit' && msg.author.id === message.author.id;
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
          message.channel.bulkDelete(1)
          songEmbed.delete();
          return;
        }
          message.channel.bulkDelete(1)
          let endur = (videos[videoIndex -1 ].duration / (1000 * 60 * 60)) % 24
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
          message.guild.musicData.queue.push(
            searchCommand.constructSongObj(
              videos[videoIndex - 1],
              message.member.user
            )
          );
          let sum = 0, i;
          let dur = ''
          for (i = 0; i < message.guild.musicData.queue.length - 1; i +=1 ) {
            sum += (+message.guild.musicData.queue[i].rawDuration);
          }
          if (videos[videoIndex - 1].duration > 0) {
            dur = videos[videoIndex - 1].durationFormatted
          } else {
            dur = 'Live Stream'
          }
          if (message.guild.musicData.isPlaying == false) {
            message.guild.musicData.isPlaying = true;
            playSong(message.guild.musicData.queue, message, 0);
            srch.delete();
            if (songEmbed) {
              songEmbed.delete();
            }
          } else if (message.guild.musicData.isPlaying == true) {
            if (songEmbed) {
              songEmbed.delete();
            }
            let url = `https://youtube.com/watch?v=${videos.id}`;
            const addvideoEmbed = new MessageEmbed()
            .setColor(normalcolor)
            .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
            .setDescription(`**[${videos[videoIndex - 1].title}](${url})**`)
            .addField(`Song Duration`,`${dur}`, true)
            .addField(`Estimated time`,`${searchCommand.msToTime((message.guild.musicData.nowPlaying.rawDuration - (message.guild.musicData.songDispatcher.streamTime + message.guild.musicData.seek)) + sum)}`, true)
            .addField(`Potition`,`**#**${message.guild.musicData.queue.length} in queue`, true)
            .setThumbnail(videos[videoIndex - 1].thumbnail.url)
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
      memberDisplayName: user.tag,
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
}
