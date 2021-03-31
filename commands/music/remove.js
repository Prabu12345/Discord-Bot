const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
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
    if (!role) { 
    message.channel.send('I Added DJ role because i NEED it')
    return message.guild.roles.create({
      data: {
        name: 'DJ',
      },
      reason: 'we needed a role for DJ',
    })
    .then()
    .catch();
    }
    const errremoveEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (songNumber < 1 || songNumber > message.guild.musicData.queue.length) {
      errremoveEmbed.setDescription('Please enter a valid song number')
      return message.say(errremoveEmbed);
    }
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errremoveEmbed.setDescription('Join a channel and try again')
      message.say(errremoveEmbed);
      return;
    }
    if (message.guild.musicData.queue[songNumber - 1].memberDisplayName !== message.member.user.username) {
      if (message.member.roles.cache.get(role.id)) {

      } else {
        return message.reply('You cannot remove music request other people');
      }
    }
    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errremoveEmbed.setDescription('There is no song playing right now!')
      message.say(errremoveEmbed);
      return;
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errremoveEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      message.reply(errremoveEmbed);
      return;
    }
    const removeEmbed = new MessageEmbed()
    .setColor(normalcolor)
    .setDescription(`Removed song number ${songNumber} from queue`)
    message.guild.musicData.queue.splice(songNumber - 1, 1);
    message.say(removeEmbed);
  }
};
