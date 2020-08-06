const superagent = require("snekfetch");
const Discord = require('discord.js')

exports.run = async (client, message, args, level) => {
      superagent.get('https://thiscatdoesnotexist.com/')
        .end((err, response) => {
      const lewdembed = new Discord.RichEmbed()
      .setTitle("Random ai cat")
      .setColor(`#000000`)
      .setFooter(`uwu`)
      .attachFile({attachment: "http://thiscatdoesnotexist.com/", name: "image.jpeg"})
      .setImage("attachment://image.jpeg")

      message.channel.send(lewdembed);
    })
}
