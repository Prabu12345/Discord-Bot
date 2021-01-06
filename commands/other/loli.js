const { Command } = require('discord.js-commando');
const Loli = require('lolis.life')
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loli',
      aliases: ['loli-pic', 'lolisafe'],
      group: 'other',
      memberName: 'loli',
      description: 'Showing a Lollies picture, if you want NSFW lolies just turn on you NSFW Channel',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    const lol1 = new Loli();
    let lols = await lol1.getSFWLoli();
    let lolns = await lol1.getNSFWLoli();
    if (!message.channel.nsfw) {
    let embed = new MessageEmbed()
    .setTitle('Loli')
    .setImage(lols.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    } else {
    let embed = new MessageEmbed()
    .setTitle('Lewd Loli')
    .setImage(lolns.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    }
  } catch (err) {
    message.channel.send('There was an error!\n' + err).catch();
  }
};
