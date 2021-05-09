const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { playSong } = require('../../resources/music/play');
const { clientperm } = require('../../resources/permission');

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'join',
      aliases: ['come'],
      group: 'music',
      memberName: 'join',
      guildOnly: true,
      description: 'Joins Voice Channel',
      throttling: {
        usages: 1,
        duration: 10
      },
    });
  }

  async run(message) {
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(`${xmoji} | Join a channel and try again`);
      return;
    } 
    
    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      if(message.guild.me.voice.channel) {
        return message.channel.send(`${xmoji} | I already in voice channel, ${message.author}`);
      }
    } else if (message.guild.musicData.isPlaying == true) {
      return message.channel.send(`${xmoji} | I already in voice channel, ${message.author}`);
    }

    const acces = await clientperm(message, ['EMBED_LINKS'], ['CONNECT'] )
    if (acces === true) {
    } else {
      return;
    } 
    
    try {
      if (message.guild.musicData.queue.length === 0){
        voiceChannel.join()
      } else {
        message.guild.musicData.isPlaying = true
        playSong(message.guild.musicData.queue, message, 0);
      }
      const errleaveEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setDescription(`${cmoji} | **Joined** \`${message.member.voice.channel.name}\` **and bound to** \`${message.channel.name}\``)
      message.say(errleaveEmbed);
    } catch {
      return message.reply(':x: | Something went wrong when joining channels');
    }
  }
};
