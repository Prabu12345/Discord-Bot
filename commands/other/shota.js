const { Command } = require('discord.js-commando');
//const Loli = require('lolis.life')
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'shota',
      aliases: ['shota-pic'],
      group: 'anime',
      memberName: 'shota',
      description: 'Showing a Shota picture',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  async run(message) {
    //const lol1 = new Loli();
    //let lols = await lol1.getSFWShota();
    if (!message.channel.nsfw) {
      message.channel.send('API Nya Rusak GBLK SBR, Yang buat apinya gblk')
      return;
    let embed = new MessageEmbed()
    .setTitle('Shota')
    .setImage(lols.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    } else {
      message.channel.send('API Nya Rusak GBLK SBR, Yang buat apinya gblk')
      return;
    let embed = new MessageEmbed()
    .setTitle('Shota')
    .setImage(lols.url)
    .setColor(normalcolor);
    message.channel.send(embed);
    }
  } catch (err) {
    message.channel.send('There was an error!\n' + err).catch();
  }
};
