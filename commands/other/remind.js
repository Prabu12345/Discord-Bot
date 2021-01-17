const { Command } = require('discord.js-commando');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remind',
      aliases: ['rdme', 'remindme'],
      group: 'other',
      memberName: 'remind',
      description: 'To Remind you.',
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'whatrd',
          prompt: 'mau gw ingetin apa?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { whatrd }) {
    let splitMessage = whatrd.split(' ');
    var filteredMessage = whatrd.replace(splitMessage[0], '');
    function reminder() {
      message.reply("\n**REMINDER:**\n" + filteredMessage);
    }
    switch(splitMessage[0].slice(-1)) {
      case 's': {
        var msDelay = splitMessage[0].slice(0, -1) * 1000;
        message.reply("Your reminder has been set. I will remind you in " + splitMessage[0].slice(0, -1) + "seconds.");
        setTimeout(reminder, msDelay);
        break;
      }
      case 'm': {
        var msDelay = splitMessage[0].slice(0, -1) * 60000;
        message.reply("Your reminder has been set. I will remind you in " + splitMessage[0].slice(0, -1) + "minutes.");
        setTimeout(reminder, msDelay);
        break;
      }
      case 'h': {
        var msDelay = splitMessage[0].slice(0, -1) * 3600000;
        message.reply("Your reminder has been set. I will remind you in " + splitMessage[0].slice(0, -1) + "hours.");
        setTimeout(reminder, msDelay);
        break;
      }
      case 'd': {
        var msDelay = splitMessage[0].slice(0, -1) * 86400000;
        message.reply("Your reminder has been set. I will remind you in " + splitMessage[0].slice(0, -1) + "days.");
        setTimeout(reminder, msDelay);
        break;
      }
    }
  };
}