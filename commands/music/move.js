const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class MoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      memberName: 'move',
      aliases: ['m', 'movesong'],
      description: 'Move song to a desired position in queue',
      group: 'music',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'oldPosition',
          type: 'integer',
          prompt: 'What is the position of the song you want to move?'
        },
        {
          key: 'newPosition',
          type: 'integer',
          prompt: 'What position do you want to move the song to?'
        }
      ]
    });
  }
  async run(message, { oldPosition, newPosition }) {
    const errmoveEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (
      oldPosition < 1 ||
      oldPosition > message.guild.musicData.queue.length ||
      newPosition < 1 ||
      newPosition > message.guild.musicData.queue.length ||
      oldPosition == newPosition
    ) {
      errmoveEmbed.setDescription('Try again and enter a valid song position number')
      message.reply(errmoveEmbed);
      return;
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errmoveEmbed.setDescription('Join a channel and try again')
      message.reply(errmoveEmbed);
      return;
    }
    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply('There is no song playing right now!');
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errmoveEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errmoveEmbed);
      return;
    }

    const songName = message.guild.musicData.queue[oldPosition - 1].title;

    MoveSongCommand.array_move(
      message.guild.musicData.queue,
      oldPosition - 1,
      newPosition - 1
    );
    const moveEmbed = new MessageEmbed()
    .setColor(errorcolor)
    .setDescription(`**${songName}** moved to position ${newPosition}`)
    message.channel.send(moveEmbed);
  }
  // https://stackoverflow.com/a/5306832/9421002
  static array_move(arr, old_index, new_index) {
    while (old_index < 0) {
      old_index += arr.length;
    }
    while (new_index < 0) {
      new_index += arr.length;
    }
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr;
  }
};
