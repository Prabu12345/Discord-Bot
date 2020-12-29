const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class ShuffleQueueCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shuffle',
      memberName: 'shuffle',
      group: 'music',
      description: 'Shuffle the song queue',
      guildOnly: true
    });
  }
  run(message) {
    const errshuffleEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errshuffleEmbed.setDescription('Join a channel and try again')
      return message.say(errshuffleEmbed)
    };

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errshuffleEmbed.setDescription('There is no song playing right now!')
      return message.say(errshuffleEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errshuffleEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errshuffleEmbed);
      return;
    }

    if (message.guild.musicData.queue.length < 1) {
      errshuffleEmbed.setDescription('There are no songs in queue')
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
