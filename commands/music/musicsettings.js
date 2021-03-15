const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

module.exports = class LeaveCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'musicsettings',
      aliases: ['ms'],
      group: 'music',
      memberName: 'musicsettings',
      guildOnly: true,
      description: 'To settings music',
      userPermissions: ['MANAGE_CHANNELS'],
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async run(message) {
    let role = await message.guild.roles.cache.find(role => role.name.toLowerCase() === 'DJ');
    let all = await db.get(`${message.guild.id}.settings`)
    let np
    if (all.maxvolume == false) {
      np = 'disable'
    } else {
      np = 'enable'
    }
    const embed = new MessageEmbed()
      .setColor(normalcolor)
      .setAuthor('')
      .setTitle('Choose a music settings by commenting a number between 1 and 2')
      .setDescription(`1. Update max volume - **${all.volume}% (100 - 200)**\n
      2. Automatically leave the channel if empty - **${all.timeout / 60000} minutes (0 - 50)**\n
      3. Automatically show now playing - **${np}**`
      )
      .setFooter('Write "exit" to cancel or will cancel automaticly in 1 minute');
    var songEmbed = await message.channel.send({ embed });
    message.channel
      .awaitMessages(
        function(msg) {
          return (msg.content > 0 && msg.content < 3) || msg.content === 'exit';
        },
        {
          max: 1,
          time: 60000,
          errors: ['time']
        }
      )
      .then(async function(response) {
        const mIndex = parseInt(response.first().content);
        if (response.first().content === 'exit') {
          songEmbed.delete();
          return;
        }
        if (mIndex == 1) {
          if (songEmbed) {
            songEmbed.delete();
          }
          var vm = await message.channel.send('What do you want to set max volume to?');
          message.channel
            .awaitMessages(
              async function(msg) {
                return (msg.content > 99 && msg.content < 201) || msg.content === 'cancel';
              },
              {
                max: 1,
                time: 25000,
                errors: ['time']
              }
            )
            .then(async function(response) {
              const vIndex = parseInt(response.first().content);
              if (vIndex > 99 && vIndex < 201) {
                if (vm) {
                  vm.delete();
                }
                let vol = await db.get(`${message.guild.id}.settings`)
                db.set(`${message.guild.id}.settings`, {volume: vIndex, maxvolume: vol.maxvolume, nowplaying: vol.nowplaying, timeout: vol.timeout})
                const volumeEmbed = new MessageEmbed()
                  .setColor(normalcolor)
                  .setDescription(`Max volume set to **${vIndex}%**, ${message.author}`)
                message.say(volumeEmbed);
              }
            })
            .catch(async function() {
              if (vm) {
                vm.delete();
              }
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription('Please try again and enter a number between 1 and 100')
              message.say(errvideoEmbed);
              return;
            });
        } else if (mIndex == 2) {
          if (songEmbed) {
            songEmbed.delete();
          }
          var tm = await message.channel.send('What do you want to set the timeout to?');
          message.channel
            .awaitMessages(
              async function(msg) {
                return (msg.content < 50) || msg.content === 'cancel';
              },
              {
                max: 1,
                time: 25000,
                errors: ['time']
              }
            )
            .then(async function(response) {
              const tIndex = parseInt(response.first().content);
              if (tIndex < 50) {
                if (tm) {
                  tm.delete();
                }
                let tim = await db.get(`${message.guild.id}.settings`)
                let volume = tim.volume
                let maxvolume = tim.maxvolume
                let np = tim.nowplaying
                let timeout = (tIndex * 60000);
                db.set(`${message.guild.id}.settings`, {volume: volume, maxvolume: maxvolume, nowplaying: np, timeout: timeout})
                const timeoutEmbed = new MessageEmbed()
                  .setColor(normalcolor)
                  .setDescription(`The timeout set to **${tIndex} Minutes**, ${message.author}`)
                if (response.first().content === 0) {
                  message.guild.musicData.timeout = 0;
                  timeoutEmbed.setDescription(`The timeout set to **${response.first().content} Minutes**, ${message.author}`)
                }
                message.say(timeoutEmbed);
              }
            })
            .catch(async function() {
              if (tm) {
                tm.delete();
              }
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription('Please try again and enter a number between 0 and 50')
              message.say(errvideoEmbed);
              return;
            });
        } else if (mIndex = 3) {
          if (songEmbed) {
            songEmbed.delete();
          }
          if (all.nowplaying == false) {
            db.set(`${message.guild.id}.settings`, {volume: all.volume, maxvolume: all.maxvolume, nowplaying: true, timeout: all.timeout})
            message.say(`Automatically show now play ${all.nowplaying}`)
          } else {
            db.set(`${message.guild.id}.settings`, {volume: all.volume, maxvolume: all.maxvolume, nowplaying: false, timeout: all.timeout})
            message.say(`Automatically show now play ${all.nowplaying}`)
          }
        }
      })
      .catch(async function() {
        if (songEmbed) {
          songEmbed.delete();
        }
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription('Please try again and enter a number between 1 and 3 or exit')
        message.say(errvideoEmbed);
        return;
      });  
  }
};
