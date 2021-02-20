const { CommandoClient } = require('discord.js-commando');
const { Structures, VoiceChannel } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');
const MongoClient = require('mongodb').MongoClient;
const MongoDBProvider = require('commando-provider-mongo').MongoDBProvider;
const mongoose = require('mongoose');
const Guild = require('./resources/Guild')
const fs = require('fs')

Structures.extend('Guild', function(Guild) {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        pause: false,
        timeout: 10000,
        loop: 'off',
        sloop: 'null',
        remind: [],
        seek: 0,
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

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: discord_owner_id // value comes from config.json
});

fs.readdir('./resources/event/', (err, files) => {
  if (err) return console.error;
  files.forEach(file => {
      if (!file.endsWith('.js')) return;
      const evt = require(`./resources/event/${file}`);
      let evtName = file.split('.')[0];
      console.log(`Loaded event '${evtName}'`);
      client.on(evtName, evt.bind(null, client));
  });
});

client.setProvider(
  MongoClient.connect('mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority')
  .then(client => new MongoDBProvider(client, 'guaa'))
).catch(console.error);

client.mongoose = require('./resources/mongoose');
client.mongoose.init();

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
    prefix: true,
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
  /*if (
    newState.guild.me.voice.channel && 
    newState.guild.musicData.songDispatcher
  ) {
    if (newState.guild.me.voice.channel.members.array().length < 2) {
      var timeout = setTimeout(function onTimeOut() {
        newState.guild.musicData.loop = 'off';
        newState.guild.musicData.queue.length = 0;
        newState.guild.musicData.songDispatcher.end();
        setTimeout(function onTimeOut() {
          newState.guild.me.voice.channel.leave();
        }, 500);
      }, newState.guild.musicData.timeout)
    }
  } 
  if ( 
    timeout && newState.guild.me.voice.channel.members.array().length > 1
  ) { 
    clearTimeout(timeout) 
    console.log('Ayam Goyeng')
  }*/
});

client.login(process.env.token);