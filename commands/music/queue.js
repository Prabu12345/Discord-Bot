const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class QueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'queue',
      aliases: ['song-list', 'q'],
      group: 'music',
      memberName: 'queue',
      guildOnly: true,
      description: 'Display the song queue',
      clientPermissions: ['ADD_REACTIONS']
    });
  }

  async run(message) {
    if (message.guild.triviaData.isTriviaRunning)
      return message.say('Try again after the trivia has ended');
    if (message.guild.musicData.queue.length == 0) {
      const video = message.guild.musicData.nowPlaying;
      var errqueueembed = new MessageEmbed()
        .setTitle(`Music Queue - ${message.guild.musicData.queue.length} items`)
        .setDescription('There are no songs in queue!')
        if (video) {
          errqueueembed.setColor(normalcolor)
          if (message.guild.musicData.loop == 'off') {
			errqueueembed.setFooter(`Now Playing : ${video.title} | Loop : ${message.guild.musicData.loop} | Volume : ${message.guild.musicData.volume}%`)
		} else if (message.guild.musicData.loop == 'one' || message.guild.musicData.loop == 'queue') {
			errqueueembed.setFooter(`Now Playing : ${video.title} | Loop : ${message.guild.musicData.loop} Track | Volume : ${message.guild.musicData.volume}%`)
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
          collector.stop();
          reaction.message.reactions.removeAll();
          reaction.message.delete({ timeout: 1000 }).catch(console.error);
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message + ', Please give me Permission to access **ADD_REACTIONS**').catch(console.error);
      }
    });
  }
};

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

    const info = current.map((track) => `**${++j}** | [${track.title}](${track.url}) - **${track.memberDisplayName}**`).join("\n");
    const video = message.guild.musicData.nowPlaying;
    const embed = new MessageEmbed()
    .setTitle(`Music Queue - ${queue.length} items (${msToTime(allduration)})`)
    .setColor(normalcolor)
    .setDescription(`${info}`)
    if (message.guild.musicData.loop == 'off') {
      embed.setFooter(`Now Playing : ${video.title} | Loop : ${message.guild.musicData.loop} | Volume : ${message.guild.musicData.volume}%`)
    embeds.push(embed);
  } else if (message.guild.musicData.loop == 'one' || message.guild.musicData.loop == 'queue') {
      embed.setFooter(`Now Playing : ${video.title} | Loop : ${message.guild.musicData.loop} Track | Volume : ${message.guild.musicData.volume}%`)
    embeds.push(embed);
    }
  }

  return embeds;
};

function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = parseInt((duration / 1000) % 60),
    minutes = parseInt((duration / (1000 * 60)) % 60),
    hours = parseInt((duration / (1000 * 60 * 60)) % 24);
    days = parseInt((duration / (1000 * 60 * 60 * 24)) % 365);

  hours = (hours < 10) ? "0" + hours : hours;
  minutes = (minutes < 10) ? "0" + minutes : minutes;
  seconds = (seconds < 10) ? "0" + seconds : seconds;

  if (days !== 0)
      return days + " days " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  else
      return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
}