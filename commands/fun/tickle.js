
const Discord = require("discord.js");
const superagent = require("snekfetch");
const utils = require('../../utils');

            module.exports = {
                name: "tickle",
                category: "fun",
              description: "Allows you to tickle a user",
              usage: "[command | user]",
              run: async (client, message, args) => {
              //command
              const user = message.mentions.users.first();
              if(!user)
                  return message.reply('Mention someone to tickle!');
  
              superagent.get('https://nekos.life/api/v2/img/tickle')
                  .end((err, response) => {
                const lewdembed = new Discord.MessageEmbed()
                .setTitle(user.username + " just got tickled by " + message.author.username)
                .setImage(response.body.url)
                .setColor(`RANDOM`)
                .setDescription((user.toString() + " got tickled by " + message.author.toString()))
                .setFooter(`._.`)
                .setURL(response.body.url);
            message.channel.send(lewdembed);
              })
              }
              };