const { CommandoClient } = require('discord.js-commando');
const { Structures, VoiceChannel } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');
const mongoose = require('mongoose');
const Guild = require('./resources/Guild')

Structures.extend('Guild', function(Guild) {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        loop: 'off',
        sloop: 'null',
        nowPlaying: null,
        songDispatcher: null,
        volume: 50
      };
      this.triviaData = {
        isTriviaRunning: false,
        wasTriviaEndCalled: false,
        triviaQueue: [],
        triviaScore: new Map()
      };
    }
  }
  return MusicGuild;
});

const settings = await Guild.findOne({
  guildID: message.group.id
}, (err, guild) => {
  if(err) console.error(err)
  if(!guild) {
      const newGuild = new Guild({
          _id: mongoose.Types.Objectid(),
          guildID: message.guild.id,
          guildName: message.guild.name,
          prefix: prefix
      })

      newGuild.save()
      .then(result => console.log(result))
      .catch(err => console.error(err))

      return message.channel.send('ga ad di database atau databasenya lg ga bisa di aksees sory!');
  }
});

const client = new CommandoClient({
  commandPrefix: settings.prefix,
  owner: discord_owner_id // value comes from config.json
});

client.mongoose = require('./resources/mongoose');

client.registry
  .registerDefaultTypes()
  .registerGroups([ 
    ['guild', 'guild related commands'],
    ['music', 'Music Command Group'],
    ['gifs', 'Gif Command Group'],
    ['anime', 'Anime Command Group'],   
    ['other', 'random types of commands group']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    unknownCommand: false,
    eval: false,
    prefix: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity(`Temp** | ${prefix}help`, {
    type: 'LISTENING',
    url: 'https://discord.gg/n5yFCYSkQn'
  });
});

client.on('voiceStateUpdate', async (___, newState) => {
  if (
    newState.member.user.bot &&
    !newState.channelID &&
    newState.guild.musicData.songDispatcher &&
    newState.member.user.id == client.user.id
  ) {
    newState.guild.musicData.loop = 'off';
    newState.guild.musicData.queue.length = 0;
    newState.guild.musicData.songDispatcher.end();
    return;
  }
  if (
    newState.member.user.bot &&
    newState.channelID &&
    newState.member.user.id == client.user.id &&
    !newState.selfDeaf
  ) {
    newState.setSelfDeaf(true);
  }
  //if (
    //!VoiceChannel.members
  //) {
    //newState.guild.musicData.loop = 'off';
    //if (typeof newState.guild.musicData.songDispatcher == 'undefined' ||
    //newState.guild.musicData.songDispatcher == null) {
      //return;
    //}
    //newState.guild.musicData.queue.length = 0;
    //newState.guild.musicData.songDispatcher.end();
    //setTimeout(function onTimeOut() { 
      //newState.guild.me.voice.channel.leave(); 
    //}, 500);
  //}
});

client.mongoose.init();
client.login(process.env.token);