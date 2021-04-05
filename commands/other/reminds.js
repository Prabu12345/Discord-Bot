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
      guildOnly: true,
      description: 'See the remind list!',
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
		      key: 'rdremove',
		      default: '',
          prompt: 'mau liat punya siapa?',
          type: 'string'
        },
        {
		      key: 'nurdremove',
		      default: '',
          prompt: 'nomor brp yang mau di apus?',
          type: 'integer'
        }
      ]
    });
  }

  async run(message, {rdremove}, {nurdremove}) {
    let a = [];
    let found = false;
    for (let i = 0; i < message.guild.musicData.remind.length; i++) {
      if (message.guild.musicData.remind[i].author == message.author) {
          found = true;
          a.push(i)
      }
    }
    let embed = new MessageEmbed()
    if (rdremove == '') {
      if (found == true) {
        var txt = "";
        var newremind = [];
        for (let i = 0; i < a.length; i++) {
          newremind.push(message.guild.musicData.remind[a[i]]);
        }
        newremind.forEach(function(value, index, array){
            var d = new Date();
            txt = txt + (index + 1) + ". " + value.remindermsg + " (reminding in " + msToTime(value.starttime+value.timetowait - d.getTime()) + " - " + value.author + ")\n"; 
        });   
        embed.setColor(normalcolor)
        embed.setDescription("**Reminder list:** \n" + txt)
        message.channel.send(embed);
      } else {
        message.channel.send("There are no reminders right now!");
      }
    } else if (rdremove == 'remove' || rdremove == 'r') {
      const errremoveEmbed = new MessageEmbed()
      .setColor(errorcolor)
      if (nurdremove < 1 || nurdremove > message.guild.musicData.remind.length) {
        errremoveEmbed.setDescription('Please enter a valid reminds number')
        return message.say(errremoveEmbed);
      }

      const removeEmbed = new MessageEmbed()
      .setColor(normalcolor)
      .setDescription(`Lg ga bisa jangan di coba!`)
      message.say(removeEmbed);
    }
  }
};

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
      seconds = parseInt((duration / 1000) % 60),
      minutes = parseInt((duration / (1000 * 60)) % 60),
      hours = parseInt((duration / (1000 * 60 * 60)) % 24);
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
