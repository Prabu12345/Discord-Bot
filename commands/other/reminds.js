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
    let embed = new MessageEmbed()
    if (message.guild.musicData.remind.length === 0) {
        message.channel.send("There are no reminders right now!");
    } else {
        var txt = "";
        message.guild.musicData.remind.forEach(function(value, index, array){
            var d = new Date();
            txt = txt + (index + 1) + ". " + value.remindermsg + " (reminding in " + msToTime(value.starttime+value.timetowait - d.getTime()) + " - " + value.author + ")\n";
        });
        embed.setColor(normalcolor)
				embed.setDescription("**Reminder list:** \n" + txt)
        message.channel.send(embed);
    }
  }
};

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);
      days = parseInt((duration / (1000 * 60 * 60 * 24)) % 365);
  
    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    if (days !== 0)
        return days + " days " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    else
        return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }
