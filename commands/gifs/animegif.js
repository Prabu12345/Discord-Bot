const fetch = require('node-fetch');
const { tenorAPI } = require('../../config.json');
const { Command } = require('discord.js-commando');
const nekos = require('nekos.life');

module.exports = class AnimegifCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'animegif',
      group: 'anime',
      aliases: ['anime-gif', 'anime-gifs'],
      memberName: 'animegif',
      description:
        'Provide a name of an anime show or character and I will return a gif!',
      throttling: {
        usages: 1,
        duration: 4
      }
    });
  }

  async run(message) {
    const neko = new nekos();
    let randomHentaiGif = await neko.nsfw.randomHentaiGif();
    if (!message.channel.nsfw) { 
      fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=1`)
      .then(res => res.json())
      .then(json => message.say(json.results[0].url))
      .catch(e => {
        message.say('Failed to find a gif :slight_frown:');
        // console.error(e);
        return;
      });
    } else {
      let total = Math.floor(Math.random() * (150 - 1 + 1)) + 1
      if (total > 15) {
        fetch(`https://api.tenor.com/v1/random?key=${tenorAPI}&q=anime&limit=1`)
        .then(res => res.json())
        .then(json => message.say(json.results[0].url))
        .catch(e => {
          message.say('Failed to find a gif :slight_frown:');
          // console.error(e);
          return;
        });
      } else {
        let embed = new MessageEmbed()
        .setTitle('Animegif')
        .setImage(randomHentaiGif.url)
        .setColor(normalcolor);
        message.channel.send(embed);
      }
    }
  }
};
