const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')

module.exports = class ShuffleQueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      memberName: 'shuffle',
      group: 'music',
      description: 'Shuffle the song queue',
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      }
    });
  }
  run(message) {
    if (!message.guild.me.hasPermission("EMBED_LINKS")) {
      return message.channel.send(`I don't have permission to send embed`);
    }
    const errshuffleEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errshuffleEmbed.setDescription(`${xmoji} | Join a channel and try again`)
      return message.say(errshuffleEmbed)
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errshuffleEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errshuffleEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errshuffleEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errshuffleEmbed);
      return;
    } else if (message.guild.musicData.queue.length < 1) {
      errshuffleEmbed.setDescription(`${xmoji} | There are no songs in queue`)
      return message.say(errshuffleEmbed);
    }
    shuffleQueue(message.guild.musicData.queue);
    message.react('🔀');
    return;
  }
};

function shuffleQueue(queue) {
  for (let i = queue.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue[i], queue[j]] = [queue[j], queue[i]];
  }
}
