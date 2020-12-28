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
          prompt: 'Loop **one** for looped current song, loop **all** for loopied all queue'
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

    if (numOfTimesToLoop == 'one') {
      message.say('Looped **One track**, **loop off** if you want to stop looping')
      message.guild.musicData.loop = numOfTimesToLoop
    } else if (numOfTimesToLoop == 'all') {
      message.say('Looped **All track**, **loop off** if you want to stop looping')
      message.guild.musicData.loop = numOfTimesToLoop
    } else if (numOfTimesToLoop == 'off') {
      message.say('Loop off')
      message.guild.musicData.loop = numOfTimesToLoop
    };
    return;
  }
};
