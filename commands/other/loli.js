const { Command } = require('discord.js-commando');
const loli = require('lolis.life')
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loli',
      aliases: ['loli-pic', 'lolisafe'],
      group: 'other',
      memberName: 'loli',
      description: 'Replies with a cute cat picture',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  run(message) {
    let lol = await loli.getSFWLoli();

    let embed = new MessageEmbed()
    .setTitle('Loli')
    .setImage(lol.url)
    .setColor(normalcolor);

    message.channel.send(embed);
  } catch (err) {
    message.channel.send('There was an error!\n' + err).catch();
  }
};
