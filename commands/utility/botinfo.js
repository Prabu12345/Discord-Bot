const Discord = require("discord.js")
const utils = require('../../utils');

const { version } = require("discord.js");
const moment = require("moment");
const m = require("moment-duration-format");
let os = require('os')
let cpuStat = require("cpu-stat")
const ms = require("ms")




module.exports = {
    name: "botinfo",
    category: "utility",
  description: "Sends detailed info about the client",
  usage: "[command]",
  run: async (client, message, args) => {
  //command
  let cpuLol;
  cpuStat.usagePercent(function(err, percent, seconds) {
      if (err) {
          return console.log(err);
      }
      const duration = moment.duration(client.uptime).format(" D [days], H [hrs], m [mins], s [secs]");
      const embedStats = new Discord.MessageEmbed()
          .setAuthor(client.user.username)
          .setTitle("__**Stats:**__")
          .setColor("RANDOM")
          .addField("� Mem Usage", `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} / ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`, true)
          .addField("� Uptime ", `${client.uptime} ms`, true)
          .addField("� Users", `${client.users.cache.size}`, true)
          .addField("� Servers", `${client.guilds.cache.size}`, true)
          .addField("� Channels ", `${client.channels.cache.size}`, true)
          .addField("� Discord.js", `v${version}`, true)
          .addField("� Node", `${process.version}`, true)
          .addField("� CPU", `\`\`\`md\n${os.cpus().map(i => `${i.model}`)[0]}\`\`\``)
          .addField("� CPU usage", `\`${percent.toFixed(2)}%\``, true)
          .addField("� Arch", `\`${os.arch()}\``, true)
          .addField("� Platform", `\`\`${os.platform()}\`\``, true)
          .addField("API Latency", `${(client.ws.ping)}ms`)  
      message.channel.send(embedStats)
  });
  }
  };