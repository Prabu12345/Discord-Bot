const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')

module.exports = class StopMusicTriviaCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'stop-trivia',
      aliases: [
        'stop-music-trivia',
        'skip-trivia',
        'end-trivia',
        'stop-trivia'
      ],
      memberName: 'stop-trivia',
      group: 'music',
      description: 'End the music trivia',
      guildOnly: true,
      clientPermissions: ['SPEAK', 'CONNECT']
    });
  }
  run(message) {
    const errsmtrivaEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (!message.guild.triviaData.isTriviaRunning){
      errsmtrivaEmbed.setDescription(`${xmoji} | No trivia is currently running`)
      return message.say(errsmtrivaEmbed);
    } else if (message.guild.me.voice.channel !== message.member.voice.channel) {
      errsmtrivaEmbed.setDescription(`${xmoji} | Join the trivia's channel and try again`)
      return message.say(errsmtrivaEmbed);
    } else if (!message.guild.triviaData.triviaScore.has(message.author.username)) {
      errsmtrivaEmbed.setDescription(`${xmoji} | You need to participate in the trivia in order to end it`)
      return message.say(errsmtrivaEmbed);
    }
    message.guild.triviaData.triviaQueue.length = 0;
    message.guild.triviaData.wasTriviaEndCalled = true;
    message.guild.triviaData.triviaScore.clear();
    message.guild.musicData.songDispatcher.end();
    return;
  }
};
