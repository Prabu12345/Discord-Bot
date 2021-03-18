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
		let gr = groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(message))
		.map(cmd => `\`${cmd.name}\``).join(', ')))

		const embed = new MessageEmbed()
		.setColor(COLOR)
		.setAuthor(`${message.guild.me.displayName}`, message.member.user.avatarURL('webp', false, 16))
		.setDescription(stripIndents`
		For Help Related To A Particular Command Type -
	  	\`${prefix}help [command name] Or ${prefix}help [alias]**\`
	  	Info [1] - ${gr}
	  	Anime [7] - 
	  	Fun [13] - 
	  	Image [10] - 
	  	Music [13] - 
	  	Other [6] - 
		`)
		.setFooter(`${message.guild.me.displayName} | Total Commands - ${client.commands.size - 1} Loaded`, client.user.displayAvatarURL())
		embed.setTimestamp()
	  
		return message.channel.send(embed)
	  } else {
		const embed = new MessageEmbed()
		.setColor(COLOR)
		.setAuthor(oneLine`
		**Group:** ${commands[0].group.name}
		(\`${commands[0].groupID}:${commands[0].memberName}\`)
		`, message.member.user.avatarURL('webp', false, 16))
		.setTitle(`Command - ${commands[0].name}`)
		  if (!commands) return message.channel.send(embed.setTitle("**Invalid Command!**").setDescription(`**Do \`${prefix}help\` For the List Of the Commands!**`))
		  embed.setDescription(stripIndents`
		  ** Description -** ${commands[0].description || "No Description provided."}
		  ** Usage -** ${message.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : 'No Usage'}`)}
		  ** Needed Permissions -** ${commands[0].guildOnly ? ' Usable only in servers' : ''}
		  ** Aliases -** ${commands[0].aliases ? command.aliases.join(", ") : "None."}
		  `)
		  embed.setFooter(message.guild.name, message.guild.iconURL())
		  embed.setTimestamp()
	  
		  return message.channel.send(embed)
	  }
  }
};
