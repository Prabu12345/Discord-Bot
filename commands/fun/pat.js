
const Discord = require("discord.js");
const superagent = require("snekfetch");
const utils = require('../../utils');


        module.exports = {
            name: "pat",
            category: "fun",
          description: "Allows you to pat another user",
          usage: "[command | user]",
          run: async (client, message, args) => {
          //command
          const user = message.mentions.users.first();
          if(!user)
              return message.reply('Mention someone to pat!');

          superagent.get('https://nekos.life/api/v2/img/pat')
              .end((err, response) => {
            const lewdembed = new Discord.MessageEmbed()
            .setTitle(user.username + " just got a pat from " + message.author.username)
            .setImage(response.body.url)
            .setColor(`RANDOM`)
            .setDescription((user.toString() + " got a pat from " + message.author.toString()))
            .setFooter(`owo`)
            .setURL(response.body.url);
        message.channel.send(lewdembed);
          })
        

          }
          };