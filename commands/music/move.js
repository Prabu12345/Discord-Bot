const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class MoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'move',
      memberName: 'move',
      aliases: ['m', 'movesong'],
      description: 'Move song to a desired position in queue',
      examples: ['move 9 1', 'move 10 2'],
      group: 'music',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'oldPosition',
          type: 'integer',
          default: '',
          prompt: 'What is the position of the song you want to move?'
        },
        {
          key: 'newPosition',
          type: 'integer',
          default: '',
          prompt: 'What position do you want to move the song to?'
        }
      ]
    });
  }
  async run(message, { oldPosition, newPosition }) {
    var voiceChannel = message.member.voice.channel;
    const errmoveEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (
      oldPosition < 1 ||
      oldPosition > message.guild.musicData.queue.length ||
      newPosition < 1 ||
      newPosition > message.guild.musicData.queue.length ||
      oldPosition == newPosition
    ) {
      errmoveEmbed.setDescription(`${xmoji} | Try again and enter a valid song position number`)
      message.say(errmoveEmbed);
      return;
    } else if (!voiceChannel) {
      errmoveEmbed.setDescription(`${xmoji} | Join a channel and try again`)
      message.say(errmoveEmbed);
      return;
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      return message.reply(`${xmoji} | There is no song playing right now!`);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errmoveEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errmoveEmbed);
      return;
    }

    const songName = message.guild.musicData.queue[oldPosition - 1].title;

    MoveSongCommand.array_move(
      message.guild.musicData.queue,
      oldPosition - 1,
      newPosition - 1
    );
    const moveEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`:white_check_mark: | **${songName}** moved to position ${newPosition}`)
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
