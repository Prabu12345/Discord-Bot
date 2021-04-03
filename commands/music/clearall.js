const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

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
    if (!role) { 
    let a = await message.channel.send('Adding DJ role, because i need it')
    return message.guild.roles.create({
      data: {
        name: 'DJ',
      },
      reason: 'we needed a role for DJ',
    })
    .then()
    .catch(a.edit('', 'Failed to create role because i don\'t have permission'));
    }
    const errskipallEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errskipallEmbed.setDescription(`${xmoji} | Join a channel and try again`)
      return message.say(errskipallEmbed)
    };

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

    if (message.member.roles.cache.get(role.id)) {
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
