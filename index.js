const { CommandoClient } = require('discord.js-commando');
const { Structures, VoiceChannel } = require('discord.js');
const path = require('path');
const { prefix, token, discord_owner_id } = require('./config.json');

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

const client = new CommandoClient({
  commandPrefix: prefix,
  owner: discord_owner_id // value comes from config.json
});

client.registry
  .registerDefaultTypes({
    unknownCommand: false,
  })
  .registerGroups([
    ['music', 'Music Command Group'],
    ['gifs', 'Gif Command Group'],
    ['other', 'random types of commands group'],
    ['guild', 'guild related commands']
  ])
  .registerDefaultGroups()
  .registerDefaultCommands({
    eval: false,
    prefix: false,
    commandState: false
  })
  .registerCommandsIn(path.join(__dirname, 'commands'));

client.once('ready', () => {
  console.log('Ready!');
  client.user.setActivity(`Hehee | ${prefix}help`, {
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
    if (newState.guild.musicData.queue > 0 && !newState.guild.musicData.nowPlaying) {
      newState.guild.musicData.queue.length = 0;
      newState.guild.musicData.songDispatcher.end();
    }
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
  if (
    !VoiceChannel.members < 1
  ) {
    newState.guild.musicData.loop = 'off';
    if (newState.guild.musicData.queue > 0 && !newState.guild.musicData.nowPlaying) {
      newState.guild.musicData.queue.length = 0;
      newState.guild.musicData.songDispatcher.end();
    }
    setTimeout(function onTimeOut() { 
      newState.guild.me.voice.channel.leave(); 
    }, 500);
  }
});

client.login(process.env.token);