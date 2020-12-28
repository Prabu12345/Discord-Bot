const { Command } = require('discord.js-commando');

module.exports = class LoopCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loop',
      group: 'music',
      memberName: 'loop',
      guildOnly: true,
      description: 'Loop the current playing song',
      args: [
        {
          key: 'numOfTimesToLoop',
          type: 'string',
          prompt: 'How many times do you want to loop the song?'
        }
      ]
    });
  }

  run(message, { numOfTimesToLoop }) {
    if (!message.guild.musicData.isPlaying) {
      return message.say('There is no song playing right now!');
    } else if (
      message.guild.musicData.isPlaying &&
      message.guild.triviaData.isTriviaRunning
    ) {
      return message.say('You cannot loop over a trivia!');
    } else if (
      message.member.voice.channel.id !== message.guild.me.voice.channel.id
    ) {
      message.reply(
        `You must be in the same voice channel as the bot's in order to use that!`
      );
      return;
    }
    message.guild.musicData.loop = numOfTimesToLoop

    if (message.guild.musicData.loop == 'one') {
      message.say('Looped One track')
    } else if (message.guild.musicData.loop == 'all') {
      message.say('Looped All Track')
    } else if (message.guild.musicData.loop == 'off') {
      message.say('Loop off')
    };
    return;
  }
};
