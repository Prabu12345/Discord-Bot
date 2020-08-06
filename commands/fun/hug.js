const utils = require('../../utils');

const Discord = require("discord.js");
const superagent = require("snekfetch");
     
        module.exports = {
            name: "hug",
            category: "fun",
          description: "Allows you to hug another user",
          usage: "[command | user]",
          run: async (client, message, args) => {
          //command
          const user = message.mentions.users.first();
          if(!user)
              return message.reply('Mention someone to give a hug to.');

          superagent.get('https://nekos.life/api/v2/img/hug')
              .end((err, response) => {
            const lewdembed = new Discord.MessageEmbed()
            .setTitle(user.username + " Just got a hug from " + message.author.username)
            .setImage(response.body.url)
            .setColor(`RANDOM`)
            .setDescription((user.toString() + " got a hug from " + message.author.toString()))
            .setFooter(`this is so cute`)
            .setURL(response.body.url);
        message.channel.send(lewdembed);
          })
          }
          };