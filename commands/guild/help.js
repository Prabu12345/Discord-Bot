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
		.setAuthor(`${message.guild.me.displayName}`, message.member.user.avatarURL('webp', false, 16))
		.setDescription(stripIndents`
		**For Help Related To A Particular Command Type** -
	  	\`${message.guild.commandPrefix}help [command name | alias] Or @${this.client.user}help [command name | alias]\`

	  	**Info [2]** - \`help\`, \`whomademe\`
		**Music [22]** - \`clear\`, \`join\`, \`leave\`, \`loop\`, \`lyrics\`, \`move\`, \`musicsettings\`, \`music-trivia\`, \`nowplaying:\`, \`pause\`, \`play\`, \`playlist\`, \`queue\`, \`remove\`, \`resume\`, \`search\`, \`seek\`, \`shuffle\`, \`skip\`, \`skipto\`, \`stop-trivia\`, \`volume\`
	  	**Anime [3]** - \`animegif\`, \`gintama\`, \`jojo\`
	  	**Fun [5]** - \`cat\`, \`chucknorris\`, \`fortune\`, \`insult\`, \`random\`
	  	**Guild [4]** - \`ban\`, \`kick\`, \`prefix\`, \`prune\`
	  	**Other [7]** - \`math\`, \`motivation\`, \`ping\`, \`reddit\`, \`remind\`, \`reminds\`, \`world-news\`
		`)
		.setFooter(`${message.guild.me.displayName}`, client.user.displayAvatarURL())
		embed.setTimestamp()
	  
		message.channel.send(embed)
	  } else {
		const embed = new MessageEmbed()
		.setColor(normalcolor)
		.setAuthor(oneLine`
		**Group:** ${commands[0].group.name}
		(\`${commands[0].groupID}:${commands[0].memberName}\`)
		`, message.member.user.avatarURL('webp', false, 16))
		.setTitle(`Command - ${commands[0].name}`)
		  if (!commands) return message.channel.send(embed.setTitle("**Invalid Command!**").setDescription(`**Do \`${message.guild.commandPrefix}help\` For the List Of the Commands!**`))
		  embed.setDescription(stripIndents`
		  ** Description -** ${commands[0].description || "No Description provided."}
		  ** Usage -** ${message.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : 'No Usage'}`)}
		  ** Needed Permissions -** ${commands[0].guildOnly ? ' Usable only in servers' : ''}
		  ** Aliases -** ${commands[0].aliases ? command.aliases.join(", ") : "None."}
		  `)
		  embed.setFooter(message.guild.name, message.guild.iconURL())
		  embed.setTimestamp()
	  
		  message.channel.send(embed)
	  }
  }
};
