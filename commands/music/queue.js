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
      description: 'Display the song queue'
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
          errqueueembed.setFooter(`Now Playing : ${video.title}`)
        } else {
          errqueueembed.setColor(errorcolor)
        };
      return message.say(errqueueembed);
    }

    let currentPage = 0;
    const embeds = generateQueueEmbed(message, queue.songs);

    const queueEmbed = await message.channel.send(
      `**\`${currentPage + 1}\`**/**${embeds.length}**`,
      embeds[currentPage]
    );

    try {
      await queueEmbed.react("⬅️");
      await queueEmbed.react("🛑");
      await queueEmbed.react("➡️");
    } catch (error) {
      console.error(error);
      message.channel.send(error.message).catch(console.error);
    }

    const filter = (reaction, user) =>
      ["⬅️", "🛑", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
    const collector = queueEmbed.createReactionCollector(filter, { time: 60000 });

    collector.on("collect", async (reaction, user) => {
      try {
        if (reaction.emoji.name === "➡️") {
          if (currentPage < embeds.length - 1) {
            currentPage++;
            queueEmbed.edit(`**\`${currentPage + 1}\`**/**${embeds.length}**`, embeds[currentPage]);
          }
        } else if (reaction.emoji.name === "⬅️") {
          if (currentPage !== 0) {
            --currentPage;
            queueEmbed.edit(`**\`${currentPage + 1}\`**/**${embeds.length}**`, embeds[currentPage]);
          }
        } else {
          collector.stop();
          reaction.message.reactions.removeAll();
        }
        await reaction.users.remove(message.author.id);
      } catch (error) {
        console.error(error);
        return message.channel.send(error.message).catch(console.error);
      }
    });
  }
};

function generateQueueEmbed(message) {
  let embeds = [];
  let k = 10;

  for (let i = 0; i < message.guild.musicData.queue.length; i += 10) {
    const current = message.guild.musicData.queue.slice(i, k);
    let j = i;
    k += 10;

    const info = current.map((track) => `**\`${++j}\`** | [\`${track.title}\`](${track.url})`).join("\n");
  
    const embed = new MessageEmbed()
    .setTitle(`Music Queue - ${message.guild.musicData.queue.length} items`)
    .setColor(normalcolor)
    .setDescription(`${info}`)
    .setFooter(`Now Playing : ${video.title}`)

    embeds.push(embed);
  }
};