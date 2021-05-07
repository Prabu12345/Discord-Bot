const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, xmoji, cmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class RemoveSongCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remove',
      memberName: 'remove',
      group: 'music',
      description: 'Remove a specific song from queue',
      examples: ['remove \`5\`', 'remove \`1\`'],
      guildOnly: true,
      throttling: {
        usages: 1,
        duration: 5
      },
      args: [
        {
          key: 'songNumber',
          default: '',
          prompt: 'What song number do you want to remove from queue?',
          type: 'integer'
        }
      ]
    });
  }
  async run(message, { songNumber }) {
    let role = await message.guild.roles.cache.find(role => role.name === 'DJ' || role.name === 'dj' || role.name === 'Dj');
    const errremoveEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (songNumber < 1 || songNumber > message.guild.musicData.queue.length) {
      message.reply(`${xmoji} | Please enter a valid song number`);
      return;
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(`${xmoji} | Join a channel and try again`);
      return;
    } 
    
    const { clientperm } = require('../../resources/permission');
    const acces = await clientperm(message, ['EMBED_LINKS'], [] );
    if (acces === true) {
    } else {
      return;
    } 
    
    if (message.guild.musicData.queue[songNumber - 1].memberDisplayName !== message.member.user.username) {
      if (!message.member.hasPermission("ADMINISTRATOR") || !message.member.hasPermission("MANAGE_GUILD") || !message.member.roles.cache.get(role.id)) {
        return message.reply(`${xmoji} | You cannot remove music request other people`);
      }
    } else if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errremoveEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      message.say(errremoveEmbed);
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errremoveEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errremoveEmbed);
      return;
    }
    const removeEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`${cmoji} | Removed song number **${songNumber}** from queue`)
    message.guild.musicData.queue.splice(songNumber - 1, 1);
    message.say(removeEmbed);
  }
};
