const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const nekos = require('nekos.life');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'neko',
      aliases: ['neko-pic'],
      group: 'other',
      memberName: 'neko',
      description: 'Showing a Neko picture, if you want a lewd turn on nsfw',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    const neko = new nekos();
    let neks = await neko.sfw.neko();
    let nekh = await neko.nsfw.neko();
    if (!message.channel.nsfw) {
    let embed = new MessageEmbed()
    .setTitle('Neko')
    .setImage(neks.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    } else {
    let embed = new MessageEmbed()
    .setTitle('Lewd Neko')
    .setImage(nekh.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    }
  } catch (err) {
    message.channel.send('There was an error!\n' + err).catch();
  }
};
