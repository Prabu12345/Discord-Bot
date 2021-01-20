const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reminds',
      aliases: ['rm-list', 'rms'],
      group: 'other',
      memberName: 'reminds',
      description: 'See the remind list!',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    if (message.guild.musicData.remind.length === 0) {
        message.channel.send("There are no reminders right now!");
    } else {
        var txt = "";
        message.guild.musicData.remind.forEach(function(value, index, array){
            var d = new Date();
            txt = txt + (index + 1) + ". " + value.remindermsg + " (reminding in " + msToTime(value.starttime+value.timetowait - d.getTime()) + ")\n";
        });
        message.channel.send("Here are your reminders: \n" + txt);
    }
  }
};
