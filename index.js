const { CommandoClient } = require('discord.js-commando');
const { Structures, Collection } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');
const MongoClient = require('mongodb').MongoClient;
const MongoDBProvider = require('commando-provider-mongo').MongoDBProvider;
const fs = require('fs')
const Topgg = require('@top-gg/sdk')
const api = new Topgg.Api('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjcyODQwOTk5NzQzNTk5NDE0MiIsImJvdCI6dHJ1ZSwiaWF0IjoxNjE1MzMyMzA0fQ.Hcuy0VxREh38DaaGuuBeXa5PuCOCvupkFHRkX6fWX3Q')
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "musicsettings");

Structures.extend('Guild', function(Guild) {
  class MusicGuild extends Guild {
    constructor(client, data) {
      super(client, data);
      this.musicData = {
        queue: [],
        isPlaying: false,
        pause: false,
        loop: 'off',
        svote: [],
        cvote: [],
        sloop: 'null',
        remind: [],
        seek: 0,
        nowPlaying: null,
        songDispatcher: null,
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

/*setInterval(() => {
  api.postStats({
    serverCount: client.guilds.cache.size,
    /*shardId: client.shard.ids[0], // if you're sharding
    shardCount: client.options.shardCount
  })
}, 1800000) // post every 30 minutes*/

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

client.cachedMessageReactions = new Map();

client.registry
  .registerDefaultTypes()
  .registerGroups([ 
    ['guild', 'Guild related commands'],
    ['music', 'Music Command Group'],
    ['info', 'info Command Group'],
    ['fun', 'Fun Command Group'],
    ['anime', 'Anime Command Group'],   
    ['other', 'Other commands group']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    help: false,
    unknownCommand: false,
    eval: false,
    prefix: true,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity(`Just Smile | ${prefix}help`, {
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
    newState.guild.musicData.seek = 0;
    newState.guild.musicData.queue.length = 0;
    message.guild.musicData.pause = false
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
    return;
  }
  if (
    newState.guild.me.voice.channel && 
    newState.guild.musicData.songDispatcher
  ) {
    if (newState.guild.me.voice.channel.members.array().length == 1) {
      rrun(newState)
    }
    if ( 
      newState.guild.me.voice.channel.members.array().length > 1
    ) { 
      stop()
    }
  } 
})

client.login(process.env.token);

var t;
async function rrun(newState) { 
  let timeout = await db.get(`${newState.guild.id}.settings`)
  t = setTimeout(() => {
    newState.guild.musicData.loop = 'off';
    newState.guild.musicData.seek = 0;
    newState.guild.musicData.queue.length = 0;
    newState.guild.musicData.pause = false
    newState.guild.musicData.songDispatcher.end();
    setTimeout(function onTimeOut() {
      newState.guild.me.voice.channel.leave();
    }, 500);
  }, timeout.timeout); 
} 

function stop() { 
  if (t) clearTimeout(t); 
} 