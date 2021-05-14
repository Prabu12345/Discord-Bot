const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { clientperm } = require('../../resources/permission');

module.exports = class SkipAllCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      aliases: ['clearall', 'clearqueue'],
      memberName: 'clear',
      group: 'music',
      description: 'Remove all songs in queue',
      guildOnly: true
    });
  }

  async run(message) {
    let role = await message.guild.roles.cache.find(role => role.name === 'DJ' || role.name === 'dj' || role.name === 'Dj');
    const errskipallEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      message.reply(`${xmoji} | Join a channel and try again`)
      return;
    };

    if(msg.channel.type !== 'dm') {
    const acces = await clientperm(message, ['EMBED_LINKS'], [] )
    if (acces === true) {
    } else {
      return;
    } 
  }

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskipallEmbed.setDescription(`${xmoji} | There is no song playing right now!`)
      return message.say(errskipallEmbed)
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskipallEmbed.setDescription(`${xmoji} | You must be in the same voice channel as the bot's in order to use that!`)
      return message.say(errskipallEmbed)
    }
    if (!message.guild.musicData.queue) {
      errskipallEmbed.setDescription(`${xmoji} | There are no songs in queue`)
      return message.say(errskipallEmbed)
    };

    if (!message.member.hasPermission("ADMINISTRATOR") || !message.member.hasPermission("MANAGE_GUILD") || !message.member.roles.cache.get(role.id)) {
      message.guild.musicData.queue.length = 0; // clear queue
      const errleaveEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription(`${cmoji} | The queue has cleared!`)
      message.say(errleaveEmbed);
      message.guild.musicData.cvote = []
      return;
    } else {
      let usersC = message.member.voice.channel.members.size;
      let required = Math.ceil(usersC/2);
  
      if(message.guild.musicData.cvote.includes(message.member.id))
          return message.channel.send(":x: | You already voted to clear!")
  
      message.guild.musicData.cvote.push(message.member.id)

	    if(message.guild.musicData.cvote.length >= required){
        message.guild.musicData.queue.length = 0; // clear queue
        const errleaveEmbed = new MessageEmbed()
          .setColor(normalcolor)
          .setDescription(`${cmoji} | The queue has cleared!`)
        message.say(errleaveEmbed);
        message.guild.musicData.cvote = []
        return;
      }
      message.channel.send(`:white_check_mark: | You voted to clear the queue \`${message.guild.musicData.cvote.length}\`/\`${required}\` votes`)
    }
  }
};
