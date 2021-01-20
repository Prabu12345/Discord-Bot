const { Command } = require('discord.js-commando');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'remind',
      aliases: ['rm', 'rdme'],
      group: 'other',
      memberName: 'remind',
	  description: 'To Remind you.',
	  examples: ['1h30m Remindme to working', '1h30m Remindme to working'],
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
		if (whatrd.length == "") {
      	message.channel.send("Please Insert want remind to!");
		} else if (whatrd.search(/[0-9]+(s|m|h|d){1}/) >= 0) {
			var time = whatrd[0]
			var outputMsg = whatrd[1].join("")
			var actualTime = 0;

			if(!outputMsg) return message.channel.send('Lu Harus tulis umtuk apa pengingat ini!')

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

				message.channel.send(`${message.author}, your reminder has been set for ` + msToTime(actualTime));
				var d = new Date();
				var reminder = {author: message.author, remindermsg: outputMsg, starttime: d.getTime(), timetowait: actualTime};
				
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