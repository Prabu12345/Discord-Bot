const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const Pagination = require('discord-paginationembed');
const remindSchema = require('../../resources/guild')

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
    const { clientperm } = require('../../resources/permission')
    const acces = await clientperm(message, ['EMBED_LINKS', 'MANAGE_MESSAGES'], [] )
    if (acces === true) {
    } else {
      return;
    } 
    const query = {
      clientid: message.author.id 
    }
    const res = await remindSchema.find(query)
    const reminds = []
    for (const check of res) {
      const { date, content } = check
      const newdate = new Date(date);
      const d = new Date();
      reminds.push({
        date: (newdate.getTime() - d.getTime()),
        content: content
      })
    }

    if (reminds.length < 1) {
      return message.channel.send("There are no reminders right now!");
    }

    try {
      var d = new Date();
      const savedSongsEmbed = new Pagination.FieldsEmbed()
      .setArray(reminds)
      .setAuthorizedUsers([message.member.id])
      .setChannel(message.channel)
      .setElementsPerPage(10)
      .formatField('# - remind msg - Estimate time', function(e) {
        return `**${reminds.indexOf(e) + 1} |** ${e.content} - ${msToTime(e.date)}`;
      });
      savedSongsEmbed.embed.setColor(normalcolor).setTitle(`📣 ${message.member.user.username} Reminder`).setFooter(`${reminds.length}/∞`);
      savedSongsEmbed.build();
    } catch {
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
