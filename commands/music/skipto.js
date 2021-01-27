const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class SkipToCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'skipto',
      memberName: 'skipto',
      group: 'music',
      description:
        'Skip to a specific song in the queue, provide the song number as an argument',
      examples: ['skipto 9', 'skipto 18'],
      guildOnly: true,
      args: [
        {
          key: 'songNumber',
          default: '',
          prompt:
            'What is the number in queue of the song you want to skip to?, it needs to be greater than 1',
          type: 'integer'
        }
      ]
    });
  }

  run(message, { songNumber }) {
    const errskiptoEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (songNumber < 1 && songNumber > message.guild.musicData.queue.length) {
      errskiptoEmbed.setDescription('Please enter a valid song number')
      return message.say(errskiptoEmbed);
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errskiptoEmbed.setDescription('Join a channel and try again')
      return message.say(errskiptoEmbed)
    };

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskiptoEmbed.setDescription('There is no song playing right now!')
      return message.say(errskiptoEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskiptoEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errskiptoEmbed);
      return;
    }
    if (message.guild.musicData.queue < 1){
      errskiptoEmbed.setDescription('There are no songs in queue')
      return message.say(errskiptoEmbed)
    };

    var newsongNumber = songNumber - 1;

    message.guild.musicData.sloop = message.guild.musicData.loop;
    message.guild.musicData.loop = 'off';
    message.guild.musicData.queue.splice(0, newsongNumber);
    message.guild.musicData.songDispatcher.end();
    setTimeout(function onTimeOut() { message.guild.musicData.loop = message.guild.musicData.sloop }, 500);
    return;
  }
};
