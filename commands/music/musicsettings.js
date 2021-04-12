const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor, cmoji, xmoji } = require('../../config.json')
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
      throttling: {
        usages: 1,
        duration: 30
      }
    });
  }

  async run(message) {
    let role = await message.guild.roles.cache.find(role => role.name === 'DJ' || role.name === 'dj' || role.name === 'Dj');
    if (!role) { 
    let a = await message.channel.send('Adding DJ role, because i need it')
    return message.guild.roles.create({
      data: {
        name: 'DJ',
      },
      reason: 'we needed a role for DJ',
    })
    .then()
    .catch(a.edit('', 'Failed to create role because i don\'t have permission'));
    }
    if(!message.member.roles.cache.get(role.id)) return message.channel.send("You don't have role named *DJ*");
    let all = await db.get(`${message.guild.id}.settings`)
    let np
    if (all.nowplaying == false) {
      np = 'disable'
    } else {
      np = 'enable'
    }
    const embed = new MessageEmbed()
      .setColor(normalcolor)
      .setAuthor('')
      .setTitle('Choose a music settings by commenting a number between 1 and 4')
      .setDescription(`1. Update max volume - **${all.maxvolume}% (100 - 200)**\n
      2. Automatically leave the channel if empty - **${all.timeout / 60000} minutes (0 - 50)**\n
      3. Automatically show now playing - **${np}**\n
      4. Music Filter`
      )
      .setFooter('Write "exit" to cancel or will cancel automaticly in 1 minute');
    var songEmbed = await message.channel.send({ embed });
    message.channel
      .awaitMessages(
        function(msg) {
          return (msg.content > 0 && msg.content < 5) || msg.content === 'exit';
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
          message.channel.bulkDelete(1)
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
                message.channel.bulkDelete(1)
                let vol = await db.get(`${message.guild.id}.settings`)
                db.set(`${message.guild.id}.settings`, {volume: vol.volume, maxvolume: vIndex, nowplaying: vol.nowplaying, timeout: vol.timeout})
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
              .setDescription(`${xmoji} | Please try again and enter a number between 1 and 100`)
              message.say(errvideoEmbed);
              return;
            });
        } else if (mIndex == 2) {
          if (songEmbed) {
            songEmbed.delete();
          }
          message.channel.bulkDelete(1)
          var tm = await message.channel.send('What do you want to set the timeout to?');
          message.channel
            .awaitMessages(
              async function(msg) {
                return (msg.content < 51) || msg.content === 'cancel';
              },
              {
                max: 1,
                time: 25000,
                errors: ['time']
              }
            )
            .then(async function(response) {
              const tIndex = parseInt(response.first().content);
              if (tIndex < 51) {
                if (tm) {
                  tm.delete();
                }
                message.channel.bulkDelete(1)
                let tim = await db.get(`${message.guild.id}.settings`)
                let volume = tim.volume
                let maxvolume = tim.maxvolume
                let np = tim.nowplaying
                let timeout = (tIndex * 60000);
                db.set(`${message.guild.id}.settings`, {volume: volume, maxvolume: maxvolume, nowplaying: np, timeout: timeout})
                const timeoutEmbed = new MessageEmbed()
                  .setColor(normalcolor)
                  .setDescription(`The timeout set to **${tIndex} Minutes**, ${message.author}`)
                message.say(timeoutEmbed);
              }
            })
            .catch(async function() {
              if (tm) {
                tm.delete();
              }
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription(`${xmoji} | Please try again and enter a number between 0 and 50`)
              message.say(errvideoEmbed);
              return;
            });
        } else if (mIndex == 4) {
          if (songEmbed) {
            songEmbed.delete();
          }
          message.channel.bulkDelete(1)
          if (!all.filters) {
              db.set(`${message.guild.id}.settings`, { volume: 50, maxvolume: 100, nowplaying: true, timeout: 60000, filters: { bassboost: false, nightcore: false, karaoke: false} })
          }
          let infoFilter = db.get(`${message.guild.id}.settings`)
          const embed = new MessageEmbed()
          .setColor(normalcolor)
          .setAuthor('')
          .setTitle('Choose a music settings by commenting a number between 1 and 3')
          .setDescription(`1. Bassboost - **${infoFilter.filters.bassboost? `enable`:`disable`}**\n
          2. Nightcore - **${infoFilter.filters.nightcore? `enable`:`disable`}**\n
          3. Karaoke - **${infoFilter.filters.karaoke? `enable`:`disable`}**\n`
          )
          .setFooter('Write "cancel" to cancel or will cancel automaticly in 1 minute');
          var tm = await message.channel.send({ embed });
          message.channel
            .awaitMessages(
              async function(msg) {
                return (msg.content > 0 && msg.content < 4) || msg.content === 'cancel';
              },
              {
                max: 1,
                time: 25000,
                errors: ['time']
              }
            )
            .then(async function(response) {
              const tIndex = parseInt(response.first().content);
              if (tIndex === 1){
                if (tm) {
                  tm.delete();
                }
                message.channel.bulkDelete(1)
                if (infoFilter.filters.bassboost == false) {
                  db.set(`${message.guild.id}.settings.filters`, { bassboost: true, nightcore: infoFilter.nightcore, karaoke: infoFilter.karaoke })
                  message.say(`karaoke filter **enable**`)
                } else {
                  db.set(`${message.guild.id}.settings.filters`, { bassboost: false, nightcore: infoFilter.nightcore, karaoke: infoFilter.karaoke })
                  message.say(`karaoke filter **disable**`)
                }
              }
              if (tIndex === 2){
                if (tm) {
                  tm.delete();
                }
                message.channel.bulkDelete(1)
                if (infoFilter.filters.nightcore == false) {
                  db.set(`${message.guild.id}.settings.filters`, { bassboost: infoFilter.bassboost, nightcore: true, karaoke: infoFilter.karaoke })
                  message.say(`karaoke filter **enable**`)
                } else {
                  db.set(`${message.guild.id}.settings.filters`, { bassboost: infoFilter.bassboost, nightcore: false, karaoke: infoFilter.karaoke })
                  message.say(`karaoke filter **disable**`)
                }
              }
              if (tIndex === 3){
                if (tm) {
                  tm.delete();
                }
                message.channel.bulkDelete(1)
                if (infoFilter.filters.karaoke == false) {
                  db.set(`${message.guild.id}.settings.filters`, { bassboost: infoFilter.bassboost, nightcore: infoFilter.nightcore, karaoke: true })
                  message.say(`karaoke filter **enable**`)
                } else {
                  db.set(`${message.guild.id}.settings.filters`, { bassboost: infoFilter.bassboost, nightcore: infoFilter.nightcore, karaoke: false })
                  message.say(`karaoke filter **disable**`)
                }
              }
            })
            .catch(async function() {
              if (tm) {
                tm.delete();
              }
              const errvideoEmbed = new MessageEmbed()
              .setColor(errorcolor)
              .setDescription(`${xmoji} | Please try again and enter a number between 0 and 100`)
              message.say(errvideoEmbed);
              return;
            });
        } else if (mIndex == 3) {
          if (songEmbed) {
            songEmbed.delete();
          }
          message.channel.bulkDelete(1)
          if (all.nowplaying == false) {
            db.set(`${message.guild.id}.settings`, {volume: all.volume, maxvolume: all.maxvolume, nowplaying: true, timeout: all.timeout})
            message.say(`Automatically show now play **enable**`)
          } else {
            db.set(`${message.guild.id}.settings`, {volume: all.volume, maxvolume: all.maxvolume, nowplaying: false, timeout: all.timeout})
            message.say(`Automatically show now play **disable**`)
          }
        }
      })
      .catch(async function() {
        if (songEmbed) {
          songEmbed.delete();
        }
        const errvideoEmbed = new MessageEmbed()
        .setColor(errorcolor)
        .setDescription(`${xmoji} | Please try again and enter a number between 1 and 4 or exit`)
        message.say(errvideoEmbed);
        return;
      });  
  }
};
