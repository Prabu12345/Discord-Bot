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
		.setColor(COLOR)
		.setAuthor(`${message.guild.me.displayName}`, message.member.user.avatarURL('webp', false, 16))
		.setDescription(stripIndents`
		**For Help Related To A Particular Command Type** -
	  	\`${message.guild.commandPrefix}help [command name | alias] Or @${this.client.user}help [command name | alias]\`

	  	**Info [2]** - \`help\`, \`whomademe\`
		**Music [22]** - \`clear\`, \`join\`, \`leave\`, \`loop\`, \`lyrics\`, \`move\`, \`musicsettings\`, \`music-trivia\`, \`nowplaying:\`, \`pause\`, \`play\`, \`playlist\`, \`queue\`, \`remove\`, \`resume\`, \`search\`, \`seek\`, \`shuffle\`, \`skip\`, \`skipto\`, \`stop-trivia\`, \`volume\`
	  	**Anime [3]** - \`animegif\`, \`gintama\`, \`jojo\`
	  	**Fun [5]** - \`cat\`, \`chucknorris\`, \`fortune\`, \`insult\`, \`random\`
	  	**Guild [4]** - \`ban\`, \`kick\`, \`prefix\`, \`prune\`
	  	**Other [7]** - \`math\`, \`motivation\`, \`prefix\`, \`reddit\`, \`remind\`, \`reminds\`, \`world-news\`
		`)
		.setFooter(`${message.guild.me.displayName} | Total Commands - ${client.commands.size - 1} Loaded`, client.user.displayAvatarURL())
		embed.setTimestamp()
	  
		message.channel.send(embed)
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
	  
		  message.channel.send(embed)
	  }
        
        if(args.command && !showAll) {
			if(commands.length === 1) {
                let thelp = ``
				let help = new MessageEmbed()
                .setColor(normalcolor)
                .setDescription(`You must be in the same voice channel as the bot's in order to use that!`)
                stripIndents`
					${oneLine`
						__Command **${commands[0].name}**:__ ${commands[0].description}
						${commands[0].guildOnly ? ' (Usable only in servers)' : ''}
						${commands[0].nsfw ? ' (NSFW)' : ''}
					`}
					**Format:** ${msg.anyUsage(`${commands[0].name}${commands[0].format ? ` ${commands[0].format}` : ''}`)}
				`;
				if(commands[0].aliases.length > 0) help += `\n**Aliases:** ${commands[0].aliases.join(', ')}`;
				help += `\n${oneLine`
					**Group:** ${commands[0].group.name}
					(\`${commands[0].groupID}:${commands[0].memberName}\`)
				`}`;
				if(commands[0].details) thelp += `\n**Details:** ${commands[0].details}`;
				if(commands[0].examples) thelp += `\n**Examples:**\n${commands[0].examples.join('\n')}`;

				const messages = [];
				try {
					messages.push(await msg.direct(help));
					if(msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
				} catch(err) {
					messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
				}
				return messages;
			} else if(commands.length > 15) {
				return msg.reply('Multiple commands found. Please be more specific.');
			} else if(commands.length > 1) {
				return msg.reply(disambiguation(commands, 'commands'));
			} else {
				return msg.reply(
					`Unable to identify command. Use ${msg.usage(
						null, msg.channel.type === 'dm' ? null : undefined, msg.channel.type === 'dm' ? null : undefined
					)} to view the list of all commands.`
				);
			}
		} else {
			const messages = [];
			try {
				messages.push(await msg.direct(stripIndents`
					${oneLine`
						To run a command in ${msg.guild ? msg.guild.name : 'any server'},
						use ${Command.usage('command', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
						For example, ${Command.usage('prefix', msg.guild ? msg.guild.commandPrefix : null, this.client.user)}.
					`}
					To run a command in this DM, simply use ${Command.usage('command', null, null)} with no prefix.
					Use ${this.usage('<command>', null, null)} to view detailed information about a specific command.
					Use ${this.usage('all', null, null)} to view a list of *all* commands, not just available ones.
					__**${showAll ? 'All commands' : `Available commands in ${msg.guild || 'this DM'}`}**__
					${groups.filter(grp => grp.commands.some(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg))))
						.map(grp => stripIndents`
							__${grp.name}__
							${grp.commands.filter(cmd => !cmd.hidden && (showAll || cmd.isUsable(msg)))
								.map(cmd => `**${cmd.name}:** ${cmd.description}${cmd.nsfw ? ' (NSFW)' : ''}`).join('\n')
							}
						`).join('\n\n')
					}
				`, { split: true }));
				if(msg.channel.type !== 'dm') messages.push(await msg.reply('Sent you a DM with information.'));
			} catch(err) {
				messages.push(await msg.reply('Unable to send you the help DM. You probably have DMs disabled.'));
			}
			return messages;
		}
  }
};
