const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: ['song-list', 'q'],
      group: 'music',
      memberName: 'queue',
      guildOnly: true,
      description: 'Display the song queue',
      clientPermissions: ['ADD_REACTIONS'],
      throttling: {
        usages: 1,
        duration: 10
      }
    });
  }

  async run(message) {
    if (message.guild.triviaData.isTriviaRunning)
      return message.say(`${xmoji} | Try again after the trivia has ended`);

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      const errloopEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errloopEmbed);
    }
    
    if (message.guild.musicData.queue.length == 0) {
      const video = message.guild.musicData.nowPlaying;
      var errqueueembed = new MessageEmbed()
        .setTitle(`🎶 Queue for ${message.guild.name} (${message.guild.musicData.queue.length})`)
        .setDescription(`There are no songs in queue!`)
        if (video) {
          errqueueembed.setColor(normalcolor)
          if (message.guild.musicData.loop == 'off') {
			errqueueembed.setFooter(`Now Playing : ${video.title} | Loop : ${message.guild.musicData.loop}`)
		} else if (message.guild.musicData.loop == 'one' || message.guild.musicData.loop == 'queue') {
			errqueueembed.setFooter(`Now Playing : ${video.title} | Loop : ${message.guild.musicData.loop} Track`)
			}		
        } else {
          errqueueembed.setColor(errorcolor)
        };
      return message.say(errqueueembed);
    }

    let currentPage = 0;
    const embeds = generateQueueEmbed(message, message.guild.musicData.queue);

    const queueEmbed = await message.channel.send(
      embeds[currentPage]
    );

    try {
      await queueEmbed.react("⬅️");
      await queueEmbed.react("🗑️");
      await queueEmbed.react("➡️");
    } catch (error) {
      console.error(error);
      message.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["⬅️", "🗑️", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(embeds[currentPage]);
          }
        } else if (reaction.emoji.name === "⬅️") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(embeds[currentPage]);
          }
        } else {
          reaction.message.reactions.removeAll();
          reaction.message.delete({ timeout: 1000 }).catch(console.error);
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message + ', Please give me permission to **MANAGE_MESSAGES** to delete a reaction').catch(console.error);
      }
    });

    collector.on("end", (reaction, user) => { 
      queueEmbed.reactions.removeAll();
    });
  }
};


function textlimit(text) {
  if (text.length > 30) {
    text = text.slice(0, 30)
    return text + '...'
  } else {  
    return text
  }
}

function generateQueueEmbed(message, queue) {
  let embeds = [];
  let k = 10;
  let sum = 0, i;
  for (i = 0; i < queue.length; i +=1 ) {
    sum += (+queue[i].rawDuration);
  }
  const allduration = sum

  for (let i = 0; i < queue.length; i += 10) {
    const current = queue.slice(i, k);
    let j = i;
    k += 10;

    const info = current.map((track) => `**${++j}** | [${track.title}](${track.url}) (${msToTime(track.rawDuration)}) - **${track.memberDisplayName}**`).join("\n");
    const video = message.guild.musicData.nowPlaying;
    const embed = new MessageEmbed()
    .setTitle(`🎶 Queue for ${message.guild.name} (${queue.length})`)
    .setColor(normalcolor)
    .setDescription(`${info}`)
    .setFooter(`Now Playing: ${textlimit(video.title)} | Loop: ${message.guild.musicData.loop} | Total Queue Time: ${msToTime(allduration)}`)
    embeds.push(embed);
  }
  return embeds;
};

function msToTime(duration) {
  if (duration === 0) return 'Live Stream'
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