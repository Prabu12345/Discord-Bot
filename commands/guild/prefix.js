const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const Guild = require('../../resources/Guild');
const { prefix } = require('../../config.json');

module.exports = class BanCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'prefixtest',
      aliases: ['pft'],
      memberName: 'prefixtest',
      group: 'guild',
      description: 'Untuk Menganti prefix di server mu',
      example: ['prefix <prefix yang di inginkan>'],
      guildOnly: true,
      userPermissions: ['MANAGE_GUILD'],
      args: [
        {
          key: 'changeprefix',
          default: '',
          type: 'string'
        }
      ]
    });
  }

  async run(message, { changeprefix }) {
    if (changeprefix.length < 3){
        return message.channel.send('Ga bisa lebih dr 3 bro!');
    }

    const settings = await Guild.findOne({
        guildID: message.group.id
    }, (err, guild) => {
        if(err) console.error(err)
        if(!guild) {
            const newGuild = new Guild({
                _id: monggoose.Types.Objectid(),
                guildID: message.guild.id,
                guildName: message.guild.name,
                prefix: prefix
            })

            newGuild.save()
            .then(result => console.log(result))
            .catch(err => console.error(err))

            return message.channel.send('ga ad di database atau databasenya lg ga bisa di aksees sory!');
        }
    });

        
    if (changeprefix.length < 1) {
        return message.channel.send(`Saat ini prefixnya ialah \`${settings.prefix}\``)
    }

    await settings.updateOne({
        prefix: changeprefix
    });

    return message.channel.send(`prefix di server ini udh di ganti ke \`${changeprefix}\``)
  }
};
