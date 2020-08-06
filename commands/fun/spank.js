
const Discord = require("discord.js");
const superagent = require("snekfetch");
const utils = require('../../utils');

        module.exports = {
            name: "spank",
            category: "fun",
          description: "hehe allows u to spank a user",
          usage: "[command | user]",
          run: async (client, message, args) => {
          //command
          const user = message.mentions.users.first();
          if(!user)
              return message.reply('Mention someone to spank! ._.');

          superagent.get('https://nekos.life/api/v2/img/spank')
              .end((err, response) => {
            const lewdembed = new Discord.MessageEmbed()
            .setTitle(user.username + " just got spanked by " + message.author.username)
            .setImage(response.body.url)
            .setColor(`RANDOM`)
            .setDescription((user.toString() + " got SPANKED! by " + message.author.toString()))
            .setFooter(`That must hurt ._.`)
            .setURL(response.body.url);
        message.channel.send(lewdembed);
          })
          }
          };