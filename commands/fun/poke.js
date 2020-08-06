
const Discord = require("discord.js");
const superagent = require("snekfetch");
const utils = require('../../utils');


        module.exports = {
            name: "poke",
            category: "fun",
          description: "Allows you to poke a user",
          usage: "[command | user]",
          run: async (client, message, args) => {
          //command
          const user = message.mentions.users.first();
          if(!user)
              return message.reply('Mention someone to poke!');

          superagent.get('https://nekos.life/api/v2/img/poke')
              .end((err, response) => {
            const lewdembed = new Discord.MessageEmbed()
            .setTitle(user.username + " just got poked by " + message.author.username)
            .setImage(response.body.url)
            .setColor(`RANDOM`)
            .setDescription((user.toString() + " got poked by " + message.author.toString()))
            .setFooter(`rip`)
            .setURL(response.body.url);
        message.channel.send(lewdembed);
          })
          }
          };