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
    const titleArray = [];
    const video = message.guild.musicData.nowPlaying;
    /* eslint-disable */
    // display only first 10 items in queue
    message.guild.musicData.queue.slice(0, 10).forEach(obj => {
      titleArray.push(obj.title)
    })
    /* eslint-enable */
    var queueEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setTitle(`Music Queue - ${message.guild.musicData.queue.length} items`);
    for (let i = 0; i < titleArray.length; i++) {
      queueEmbed.addField(`${i + 1}:`, `${titleArray[i]}`);
    } 
      queueEmbed.setFooter(`Now Playing : ${video.title}`) 
    var playingMessage = await message.say(queueEmbed);  

    if (message.guild.musicData.queue.length > 10 ) {
      await playingMessage.react("⬅️");
      await playingMessage.react("➡️");
      await playingMessage.react("🗑️");

      let fi = 0;
      let sc = 10;

      const filter = (reaction, user) => user.id !== message.client.user.id;
      var collector = playingMessage.createReactionCollector(filter, {
        time: 120000
      });
  
      collector.on("collect", (reaction, user) => {
        if (!queue) return;
  
        switch (reaction.emoji.name) {
          case "⬅️":
            reaction.users.remove(user).catch(console.error);

            fi -= 10;
            sc -= 10;

            queueEmbed.setTitle(`Music Queue - ${message.guild.musicData.queue.length} items`);
            for (let i = 0; i < message.guild.musicData.queue.slice(fi, sc).forEach(ish => {ish.length}); i++) {
            queueEmbed.addField(`${i + 1}:`, `${message.guild.musicData.queue.slice(fi, sc).forEach(ish => {ish.title})}`);
            } 
            queueEmbed.setFooter(`Now Playing : ${video.title}`) 
            playingMessage.edit(queueEmbed)
            break;

          case "➡️":
            reaction.users.remove(user).catch(console.error);

            fi += 10;
            sc += 10;

            queueEmbed.setTitle(`Music Queue - ${message.guild.musicData.queue.length} items`);
            for (let i = 0; i < message.guild.musicData.queue.slice(fi, sc).forEach(ish => {ish.length}); i++) {
            queueEmbed.addField(`${i + 1}:`, `${message.guild.musicData.queue.slice(fi, sc).forEach(ish => {ish[i].title})}`);
            } 
            queueEmbed.setFooter(`Now Playing : ${video.title}`) 
            playingMessage.edit(queueEmbed)
            break;
  
          case "🗑️":
            reaction.users.remove(user).catch(console.error);
            playingMessage.reactions.removeAll().catch(console.error);
            playingMessage.delete({ timeout: 1000 }).catch(console.error);
            break;
  
          default:
            reaction.users.remove(user).catch(console.error);
            break;
        }
      });
  
      collector.on("end", () => { 
        playingMessage.reactions.removeAll().catch(console.error);
        playingMessage.delete({ timeout: 1000 }).catch(console.error);
      });
    }

  }
};