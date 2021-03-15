const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

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
          default: '',
          prompt: 'What volume would you like to set? from 1 to 100',
          type: 'integer',
          validate: function(wantedVolume) {
            return wantedVolume >= 1 && wantedVolume <= 200;
          }
        }
      ]
    });
  }

  async run(message, { wantedVolume }) {
    let vol = await db.get(`${message.guild.id}.settings`)
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
    } else if (wantedVolume > vol.maxvolume) {
      const errvolumeEmbed = new MessageEmbed()
      .setColor(errorcolor)
      .setDescription(`You cant set the volume above ${vol.maxvolume}%`)
      message.say(errvolumeEmbed)
      return;
    }
    if(wantedVolume == ''){
      const volumeEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setDescription(`The Volume now is **${vol.volume}%**, ${message.author}`)
      return message.say(volumeEmbed);
    } else {
      const volume = wantedVolume;
      db.set(`${message.guild.id}.settings`, {volume: volume, maxvolume: vol.maxvolume, nowplaying: vol.nowplaying, timeout: vol.timeout})
      message.guild.musicData.songDispatcher.setVolume(volume / 100);
      const volumeEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`The volume set to **${wantedVolume}%**, ${message.author}`)
      message.say(volumeEmbed);
    }
  }
};
