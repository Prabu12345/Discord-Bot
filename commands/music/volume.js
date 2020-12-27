const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');

module.exports = class VolumeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'volume',
      aliases: ['v'],
      group: 'music',
      memberName: 'volume',
      guildOnly: true,
      description: 'Adjust song volume',
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'wantedVolume',
          prompt: 'What volume would you like to set? from 1 to 100',
          type: 'integer',
          validate: function(wantedVolume) {
            return wantedVolume >= 1 && wantedVolume <= 100;
          }
        }
      ]
    });
  }

  run(message, { wantedVolume }) {
    const voiceChannel = message.member.voice.channel;
    const errvolumeEmbed = new MessageEmbed()
    .setColor('#e9f931')
    .setDescription('Join a channel and try again')
    if (!voiceChannel) return message.reply(errvolumeEmbed);

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      const errvolumeEmbed = new MessageEmbed()
      .setColor('#e9f931')
      .setDescription('There is no song playing right now!')
      return message.reply(errvolumeEmbed);
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      const errvolumeEmbed = new MessageEmbed()
      .setColor('#e9f931')
      .setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errvolumeEmbed);
      return;
    }
    const volume = wantedVolume / 100;
    message.guild.musicData.volume = volume;
    message.guild.musicData.songDispatcher.setVolume(volume);
    const volumeEmbed = new MessageEmbed()
      .setColor('#e9f931')
      .setDescription(`I set the volume to: **${wantedVolume}%**`)
    message.say(volumeEmbed);
  }
};
