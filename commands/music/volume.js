const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      aliases: ['v'],
      group: 'music',
      memberName: 'volume',
      guildOnly: true,
      description: 'Adjust song volume',
      examples: ['volume 20', 'volume 25'],
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'wantedVolume',
          type: 'integer',
          validate: function(wantedVolume) {
            return wantedVolume >= 1 && wantedVolume <= 200;
          }
        }
      ]
    });
  }

  run(message, { wantedVolume }) {
    const voiceChannel = message.member.voice.channel;
    const errvolumeEmbed = new MessageEmbed()
    .setColor(errorcolor)
    .setDescription('Join a channel and try again')
    if (!voiceChannel) return message.say(errvolumeEmbed);

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      const errvolumeEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('There is no song playing right now!')
      return message.say(errvolumeEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      const errvolumeEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.say(errvolumeEmbed);
      return;
    } else if (wantedVolume > 100) {
      const errvolumeEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription('You cant set the volume above 100%')
      message.say(errvolumeEmbed)
      return;
    }
    if(wantedVolume == ''){
      const volumeEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setDescription(`The Volume is now **${message.guild.musicData.volume}%**`)
    } else {
      const volume = wantedVolume;
      message.guild.musicData.volume = volume;
      message.guild.musicData.songDispatcher.setVolume(volume / 100);
      const volumeEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`I set the volume to **${wantedVolume}%**`)
      message.say(volumeEmbed);
    }
  }
};
