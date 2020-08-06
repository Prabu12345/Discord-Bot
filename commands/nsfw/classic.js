const superagent = require("snekfetch");
const Discord = require('discord.js')
const clientt = require('nekos.life');
const neko = new clientt();

module.exports = {
  name: "classic",
  category: "nsfw",
description: "",
run: async (client, message, args, level) => {
//command
if (!message.channel.nsfw) return message.channel.send('You can use this command in an NSFW Channel!')
const { body: { url } } = await superagent.get('https://nekos.life/api/v2/img/classic')
  const lewdembed = new Discord.MessageEmbed()
  .setTitle("Classic")
  .setImage(url)
  .setColor(`#000000`)
  .setFooter(`Tags: Classic`)
message.channel.send(lewdembed);

}
};