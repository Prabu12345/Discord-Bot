const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {

    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
        .setThumbnail(bicon)
        .setTitle("https://glitch.com/edit/#!/commands-cosmic?path=commands:1:0")
        .setURL("https://glitch.com/edit/#!/commands-cosmic?path=commands:1:0")
        .addField("Click the link to see the bots commands", "Prefix: -")


    message.channel.send(botembed);
}

module.exports.help = {
    name: "help"
}
