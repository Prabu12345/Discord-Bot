const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const youtube = require('youtube-sr').default;
const { cmoji, xmoji, normalcolor, errorcolor } = require('../../config.json');
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
    }

    if (message.guild.triviaData.isTriviaRunning == true) {
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | Please try after the trivia has ended`)
      message.say(errvideoEmbed);
      return;
    }

    if (message.member.voice.channel.id !== message.guild.voice.channel.id) {
      const errleaveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errleaveEmbed);
    }

    if (query.length == 0){
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
      await message.say(errvideoEmbed);
      return;
    });
    if (videos.length < 5 || !videos) {
      if (query.match(/^https?:\/\/(?:embed\.|open\.)(?:spotify\.com\/)(?:track\/|\?uri=spotify:track:)((\w|-){22})/)) return;
      const errvideoEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | I had some trouble finding what you were looking for, please try again or be more specific`)
      message.say(errvideoEmbed);
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
    try {
      await songEmbed.react("1️⃣");
      await songEmbed.react("2️⃣");
      await songEmbed.react("3️⃣");
      await songEmbed.react("4️⃣");
      await songEmbed.react("5️⃣");
      await songEmbed.react("❌");
    } catch (error) {
      console.error(error);
      message.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "❌"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    const videoIndex

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡1️⃣") {
          videoIndex = 1
          songEmbed.reactions.removeAll();
          songEmbed.delete({timeout:1000});
        } else if (reaction.emoji.name === "⬅2️⃣") {
          videoIndex = 2
          songEmbed.reactions.removeAll();
          songEmbed.delete({timeout:1000});
        } else if (reaction.emoji.name === "⬅3️⃣") {
          videoIndex = 3
          songEmbed.reactions.removeAll();
          songEmbed.delete({timeout:1000});
        } else if (reaction.emoji.name === "⬅4️⃣") {
          videoIndex = 4
          songEmbed.reactions.removeAll();
          songEmbed.delete({timeout:1000});
        } else if (reaction.emoji.name === "5️⃣") {
          videoIndex = 5
          songEmbed.reactions.removeAll();
          songEmbed.delete({timeout:1000});
        } else {
          songEmbed.reactions.removeAll();
          songEmbed.delete({timeout:1000});
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message + ', Please give me permission to **MANAGE_MESSAGES** to delete a reaction').catch(console.error);
      }
    });

    collector.on("end", (reaction, user) => { 
      songEmbed.reactions.removeAll();
      songEmbed.delete({timeout:1000});
    });

    message.guild.musicData.queue.push(
      searchCommand.constructSongObj(
        videos[videoIndex - 1],
        message.member.user
      )
    );
    if (message.guild.musicData.isPlaying == false) {
      message.guild.musicData.isPlaying = true;
      if (songEmbed) {
        songEmbed.delete();
      }
      playSong(message.guild.musicData.queue, message, 0);
    } else if (message.guild.musicData.isPlaying == true) {
      if (songEmbed) {
        songEmbed.delete();
      }
      let url = `https://youtube.com/watch?v=${videos[videoIndex - 1].id}`;
      const addvideoEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setAuthor(`added to queue`, message.member.user.avatarURL('webp', false, 16))
      .setTitle(`${videos[videoIndex - 1].title}`)
      .addField(`Potition`,`#${message.guild.musicData.queue.length} in queue`)
      .setThumbnail(videos[videoIndex - 1].thumbnail.url)
      .setURL(url)
      srch.edit('', addvideoEmbed);
      return;
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

}
