const { Command } = require('discord.js-commando');
const loli = require('lolis.life')
const { normalcolor, errorcolor } = require('../../config.json')

module.exports = class CatCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'loli',
      aliases: ['loli-pic', 'lolisafe'],
      group: 'other',
      memberName: 'cat',
      description: 'Replies with a cute cat picture',
      throttling: {
        usages: 2,
        duration: 10
      }
    });
  }

  run(message) {
    let embed = new Discord.RichEmbed()
    .setTitle('Loli')
    .setImage(loli.url)
    .setColor(normalcolor);

    message.channel.send(embed);
  } catch (err) {
    message.channel.send('There was an error!\n' + err).catch();
  }
};
