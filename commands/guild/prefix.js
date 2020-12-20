const db = require("quick.db")
const { prefix } = require("../../config.json")

module.exports = class PrefixCommand extends Command {
  constructor(client) {
    super(client, {
      name: "prefix",
      memberName: 'prefix',
      group: 'guild',
      description: 'Change the guild prefix',
      guildOnly: true,
      userPermissions: ['MANAGE_MESSAGES'],
      clientPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          key: 'prefixkey',
          prompt: 'What prefix do you want to change to?',
          type: 'string'
        }
      ]
    });
  }

  async run(client, message, args, { prefixkey }) {
    //PERMISSION
    if(prefixkey[1]) {
      return message.channel.send("You can not set prefix a double argument")
    }
    
    if(prefix[0].length > 3) {
      return message.channel.send("You can not send prefix more than 3 characters")
    }
    
    if(prefixkey.join("") === prefix) {
      db.delete(`prefix_${message.guild.id}`)
     return await message.channel.send("Reseted Prefix ✅")
    }
    
    db.set(`prefix_${message.guild.id}`, prefixkey[0])
    await message.channel.send(`Seted Bot Prefix to ${prefixkey[0]}`)
    
  }
}