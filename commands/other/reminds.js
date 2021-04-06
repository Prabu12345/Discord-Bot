const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const Pagination = require('discord-paginationembed');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'reminds',
      aliases: ['rm-list', 'rms'],
      group: 'other',
      memberName: 'reminds',
      guildOnly: true,
      description: 'See the remind list!',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    var newremind = [];
    let found = false;
    for (let i = 0; i < message.guild.musicData.remind.length; i++) {
      if (message.guild.musicData.remind[i].author == message.author) {
          found = true;
          newremind.push(message.guild.musicData.remind[i]);
      }
    }
    if (found == true) {
      var d = new Date();
      const savedSongsEmbed = new Pagination.FieldsEmbed()
      .setArray(newremind)
      .setAuthorizedUsers([message.member.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField('# - remind msg - Estimate time', function(e) {
        return `**${newremind.indexOf(e) + 1}**| ${e.remindermsg} - ${msToTime(e.starttime+e.timetowait - d.getTime())}`;
      });
      savedSongsEmbed.embed.setColor(normalcolor).setTitle(`📣 ${message.member.user.username} Reminder`).setFooter(`${newremind.length}/∞`);
      savedSongsEmbed.build();
    } else {
      message.channel.send("There are no reminders right now!");
    }
  }
};

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24),
      days = parseInt((duration / (1000 * 60 * 60 * 24)) % 365);
  
    hours = (hours < 10) ? hours : hours;
    minutes = (minutes < 10) ? minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
  
    if (days !== 0) {
      return days + " days " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    } else if (hours !== 0) {
      return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    } else {
      return minutes + ":" + seconds + "." + milliseconds;
    }   
  }
