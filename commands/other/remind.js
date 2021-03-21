const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remind',
      aliases: ['rm', 'rdme'],
      group: 'other',
      memberName: 'remind',
	  description: 'To Remind you.',
	  guildOnly: true,
	  examples: ['remind 1h30m Remindme to working', 'remind 1h30m Remindme to working'],
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
		  key: 'whatrd',
		  default: '',
          prompt: 'mau gw ingetin apa?',
          type: 'string'
        }
      ]
    });
  }

  run(message, { whatrd }) {
	let embed = new MessageEmbed()
	var reminderMsg = whatrd
		if (reminderMsg == "") {
      	message.channel.send("Please Insert want remind to!");
		} else if (reminderMsg.search(/[0-9]+(s|m|h|d){1}/) >= 0) {
			var time = reminderMsg.substring(0,reminderMsg.search(" ")).toLowerCase();
			var outputMsg = reminderMsg.substring(reminderMsg.search(" ") + 1, reminderMsg.end);
			var actualTime = 0;
			if (!time) {
				embed.setColor(errorcolor)
				embed.setDescription('Please input why to want remind you')
				return message.channel.send(embed)
			}

			var magnitudes = time.split(/s|d|m|h/).filter(word => word != "");
			var typesOfTime = time.split(/[0-9]+/).filter(word => word != "");

			if ((magnitudes.length == typesOfTime.length) && (-1 == time.search(/a|b|c|e|f|g|i|j|k|l|n|o|p|q|r|t|u|v|w|x|y|z/))) {
				for (let i = 0; i < magnitudes.length; i++) {
					switch (typesOfTime[i]) {
						case 's':
							actualTime += magnitudes[i]*1000;
							break;
						case 'm':
							actualTime += magnitudes[i]*60000;
							break;
						case 'h':
							actualTime += magnitudes[i]*3600000;
							break;
						case 'd':
							actualTime += magnitudes[i]*86400000;
							break;
						default:
						// nothing
					}
				}

				embed.setColor(normalcolor)
				embed.setDescription(`${message.author}, your reminder has been set for ` + msToTime(actualTime))
				message.channel.send(embed);
				var d = new Date();
				var reminder = {author: message.member.user.username, remindermsg: outputMsg, starttime: d.getTime(), timetowait: actualTime};
				
				message.guild.musicData.remind.push(reminder);
				message.guild.musicData.remind.sort(function(a, b){return (a.starttime+a.timetowait) - (b.starttime+b.timetowait)});

				setTimeout(function() 
					{
						message.guild.musicData.remind.shift();
					  	message.channel.send(`Hey ${message.author}, **Reminder:** ` + outputMsg, {
						tts: true
					  });
					}, actualTime);
			} else {
				message.reply('You formatted the time incorrectly it should only have numbers and the letters s, m, h and d and it should look like: \'4d20h30s\' or \'2h30m\' ');
			}
		} else {
			message.reply('You probably formatted your reminder wrong, type !help to learn how to make reminders!')
		}
  };
}

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
// from https://stackoverflow.com/questions/19700283/how-to-convert-time-milliseconds-to-hours-min-sec-format-in-javascript