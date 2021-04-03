const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const { normalcolor, errorcolor } = require('../../config.json')
const { stripIndents, oneLine } = require('common-tags')

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      aliases: ['commands', 'cmd-list'],
      memberName: 'help',
      group: 'info',
      description: 'Give all information',
      args: [
        {
            key: 'command',
            prompt: 'Which command would you like to view the help for?',
            type: 'string',
            default: ''
        }
      ]
    });
  }

  async run(message, { command }) {
    const groups = this.client.registry.groups;
	const commands = this.client.registry.findCommands(command, false, message);
	const showAll = command && command.toLowerCase() === 'all';

	if (!command) {
		const embed = new MessageEmbed()
		.setColor(normalcolor)
		if (message.channel.type !== 'dm') {
			embed.setAuthor(`${message.member.user.username}`, message.member.user.avatarURL('webp', false, 16))
			embed.setDescription(stripIndents`
		**For Help Related To A Particular Command Type -**
	  	\`${message.guild.commandPrefix}help [command name | alias] Or @TaserM#3997 help [command name | alias]\`

	  	**| Info [2] |** 
		  \`help\`, \`whomademe\`.

		**| Music [22] |** 
		\`clear\`, \`fskip\`, \`join\`, \`leave\`, \`loop\`, \`lyrics\`, \`move\`, \`musicsettings\`, \`music-trivia\`, \`nowplaying:\`, \`pause\`, \`play\`, \`playlist\`, \`queue\`, \`remove\`, \`resume\`, \`search\`, \`seek\`, \`shuffle\`, \`skip\`, \`skipto\`, \`stop-trivia\`, \`volume\`.

	  	**| Anime [3] |** 
		  \`animegif\`, \`gintama\`, \`jojo\`, \`neko\`, \`nekogif\`.

	  	**| Fun [5] |** 
		  \`cat\`, \`chucknorris\`, \`fortune\`, \`insult\`, \`random\`.

	  	**| Guild [4] |** 
		  \`ban\`, \`kick\`, \`prefix\`, \`prune\`.

	  	**| Other [7] |** 
		  \`math\`, \`motivation\`, \`ping\`, \`remind\`, \`reminds\`.
		`)
		embed.setFooter(`${message.guild.me.displayName}`, this.client.user.displayAvatarURL())
		} else {
			embed.setDescription(stripIndents`
		**For Help Related To A Particular Command Type -**
	  	\`-help [command name | alias] Or @TaserM#3997 help [command name | alias]\`

	  	**| Info [2] |** 
		  \`help\`, \`whomademe\`.

		**| Music [22] |** 
		\`clear\`, \`fskip\`, \`join\`, \`leave\`, \`loop\`, \`lyrics\`, \`move\`, \`musicsettings\`, \`music-trivia\`, \`nowplaying:\`, \`pause\`, \`play\`, \`playlist\`, \`queue\`, \`remove\`, \`resume\`, \`search\`, \`seek\`, \`shuffle\`, \`skip\`, \`skipto\`, \`stop-trivia\`, \`volume\`.

	  	**| Anime [3] |** 
		  \`animegif\`, \`gintama\`, \`jojo\`.

	  	**| Fun [5] |** 
		  \`cat\`, \`chucknorris\`, \`fortune\`, \`insult\`, \`random\`.

	  	**| Guild [4] |** 
		  \`ban\`, \`kick\`, \`prefix\`, \`prune\`.

	  	**| Other [7] |** 
		  \`math\`, \`motivation\`, \`ping\`, \`remind\`, \`reminds\`.
		`)
		embed.setFooter(`${this.client.user.username}`, this.client.user.displayAvatarURL())
		}
		embed.setTimestamp()
	  
		return message.channel.send(embed)
	  } else {
		const embed = new MessageEmbed()
		.setColor(normalcolor)
		if (commands.length === 0) return message.channel.send(embed.setTitle("**Invalid Command!**").setDescription(`**Do ${Command.usage('help', message.guild ? message.guild.commandPrefix : null, this.client.user)} For the List Of the Commands!**`))
		embed.setTitle(`${commands[0].name.toUpperCase()} - ${commands[0].group.name}${commands[0].guildOnly ? ' (Usable only in servers)' : ''}`);
		if (message.channel.type !== 'dm') {
			embed.setDescription(stripIndents`
			\`${commands[0].description || "No Description provided."}\``)
			embed.addField(`| Detail |`, `\`${commands[0].details || `No Detail provided`}\``)
			embed.addField(`| Usage |`, message.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`))
			if (commands[0].examples) {
				embed.addField(`| Examples |`, `\`${commands[0].examples.join(`\n`)}\``)
			} else {
				embed.addField(`| Examples |`, `\`No Examples provided\``)
			}
			embed.addField(`| Aliases |`, `\`${commands[0].aliases.join(', ') || `No Aliases provided`}\``)
			embed.setFooter(message.guild.name, message.guild.iconURL())
		  } else {
			embed.setDescription(stripIndents`
			\`${commands[0].description || "No Description provided."}\``)
			embed.addField(`| Detail |`, `\`${commands[0].details || `No Detail provided`}\``)
			embed.addField(`| Usage |`, message.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`))
			if (commands[0].examples) {
				embed.addField(`| Examples |`, `\`${commands[0].examples.join(`\n`)}\``)
			} else {
				embed.addField(`| Examples |`, `\`No Examples provided\``)
			}
			embed.addField(`| Aliases |`, `\`${commands[0].aliases.join(', ') || `No Aliases provided`}\``)
		}	  
		embed.setTimestamp()
		return message.channel.send(embed)	
	  }
  }
};
