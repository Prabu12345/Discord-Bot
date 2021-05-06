const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const nekos = require('nekos.life');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'nekogif',
      aliases: ['neko-gif'],
      group: 'anime',
      memberName: 'nekogif',
      description: 'a Neko gif',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    if (!message.guild.me.hasPermission("EMBED_LINKS")) {
      return message.channel.send(`I don't have permission to send embed`);
    }
    const neko = new nekos();
    let neks = await neko.sfw.nekoGif();
    let nekh = await neko.nsfw.nekoGif();
    if (!message.channel.nsfw) {
    let embed = new MessageEmbed()
    .setTitle('Neko Gif')
    .setImage(neks.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    } else {
    let embed = new MessageEmbed()
    .setTitle('Lewd Neko Gif')
    .setImage(nekh.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    }
  } catch (err) {
    message.channel.send('There was an error!\n' + err).catch();
  }
};
