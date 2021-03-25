const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class SkipAllCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'clear',
      aliases: ['clearall'],
      memberName: 'clear',
      group: 'music',
      description: 'Remove all songs in queue',
      guildOnly: true
    });
  }

  async run(message) {
    let role = await message.guild.roles.cache.find(role => role.name === 'DJ');
    const errskipallEmbed = new MessageEmbed()
    .setColor(errorcolor)
    var voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      errskipallEmbed.setDescription('Join a channel and try again')
      return message.say(errskipallEmbed)
    };

    if (
      typeof message.guild.musicData.songDispatcher == 'undefined' ||
      message.guild.musicData.songDispatcher == null
    ) {
      errskipallEmbed.setDescription('There is no song playing right now!')
      return message.say(errskipallEmbed)
    } else if (voiceChannel.id !== message.guild.me.voice.channel.id) {
      errskipallEmbed.setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
      return message.say(errskipallEmbed)
    }
    if (!message.guild.musicData.queue) {
      errskipallEmbed.setDescription('There are no songs in queue')
      return message.say(errskipallEmbed)
    };

    if (message.member.roles.cache.get(role.id)) {
      message.guild.musicData.queue.length = 0; // clear queue
      const errleaveEmbed = new MessageEmbed()
        .setColor(normalcolor)
        .setDescription('The queue has cleared!')
      message.say(errleaveEmbed);
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
          .setDescription('The queue has cleared!')
        message.say(errleaveEmbed);
        return;
      }
      message.channel.send(`:white_check_mark: | You voted to clear the queue \`${message.guild.musicData.cvote.length}\`/\`${required}\` votes`)
    }
  }
};
