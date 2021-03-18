const { Command } = require('discord.js-commando');

module.exports = class WhoMadeMeCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'whomademe',
      aliases: ['bot-maker', 'bot-creator'],
      memberName: 'whomademe',
      group: 'info',
      description: "Replies with the bot creator's name"
    });
  }

  run(message) {
    message.say(
      'The Handsome people : Lorddoo#5171'
    );
  }
};
