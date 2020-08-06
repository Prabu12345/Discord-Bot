const utils = require('../../utils');

const Discord = require("discord.js");
const superagent = require("snekfetch");

        module.exports = {
            name: "kiss",
            category: "fun",
          description: "Allows you to kiss another user",
          usage: "[command | user]",
          run: async (client, message, args) => {
          //command
          const user = message.mentions.users.first();
          if(!user)
              return message.reply('Mention someone to kiss');

          superagent.get('https://nekos.life/api/v2/img/kiss')
              .end((err, response) => {
            const lewdembed = new Discord.MessageEmbed()
            .setTitle(user.username + " Just got a kiss from " + message.author.username)
            .setImage(response.body.url)
            .setColor(`RANDOM`)
            .setDescription((user.toString() + " got a kiss from " + message.author.toString()))
            .setFooter(`this is so cute`)
            .setURL(response.body.url);
        message.channel.send(lewdembed);
          })
          }
          };