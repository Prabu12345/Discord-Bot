const { Command } = require('discord.js-commando');
const { normalcolor, errorcolor } = require('../../config.json')
const { MessageEmbed } = require('discord.js');

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
    const embed = new MessageEmbed()
      .setColor(normalcolor)
      .setTitle('Choose a music settings by commenting a number between 1 and 2')
      .setDescription(`1. Update max volume - **${message.guild.musicData.volume}% (1 - 100)**\n
      2. Automatically leave the channel if empty - **${message.guild.musicData.timeout / 60000} minutes (0 - 50)**`
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
          var vm = await message.channel.send('What do you want to set the volume to?');
          message.channel
            .awaitMessages(
              async function(msg) {
                return (msg.content > 0 && msg.content < 101) || msg.content === 'exit';
              },
              {
                max: 1,
                time: 25000,
                errors: ['time']
              }
            )
            .then(async function(response) {
              const vIndex = parseInt(response.first().content);
              if (vIndex > 0 && vIndex < 101) {
                if (vm) {
                  vm.delete();
                }
                message.guild.musicData.volume = vIndex
                const volumeEmbed = new MessageEmbed()
                  .setColor(normalcolor)
                  .setDescription(`The volume set to **${vIndex}%**, ${message.author}`)
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
                return (msg.content > 0 && msg.content < 101) || msg.content === 0;
              },
              {
                max: 1,
                time: 25000,
                errors: ['time']
              }
            )
            .then(async function(response) {
              const tIndex = parseInt(response.first().content);
              if (tIndex > 0 && tIndex < 51 || response.first().content === 0) {
                if (tm) {
                  tm.delete();
                }
                message.guild.musicData.timeout = (tIndex * 60000);
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
