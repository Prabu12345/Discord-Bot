const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const Pagination = require('discord-paginationembed');
const cheerio = require('cheerio');
const { clientperm } = require('../../resources/permission')
const { geniusLyricsAPI, normalcolor, errorcolor, xmoji, cmoji } = require('../../config.json');
const { MessageButton } = require("discord-buttons")

module.exports = class LyricsCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'lyrics',
      memberName: 'lyrics',
      aliases: ['lr'],
      description:
        'Get lyrics of any song or the lyrics of the currently playing song',
      group: 'music',
      examples: ['lyrics my hero'],
      throttling: {
        usages: 2,
        duration: 10
      },
      args: [
        {
          key: 'songName',
          default: '',
          type: 'string',
          prompt: 'What song lyrics would you like to get?'
        }
      ]
    });
  }

  async run(message, { songName }) {
    const acces = await clientperm(message, ['EMBED_LINKS', 'MANAGE_MESSAGES'], [] )
    if (acces === true) {
    } else {
      return;
    }

    const errlyricsEmbed = new MessageEmbed()
    .setColor(errorcolor)
    if (
      songName == '' &&
      message.guild.musicData.isPlaying &&
      !message.guild.triviaData.isTriviaRunning
    ) {
      songName = message.guild.musicData.nowPlaying.title;
    } else if (songName == '' && message.guild.triviaData.isTriviaRunning) {
      errlyricsEmbed.setDescription(`${xmoji} | Please try again after the trivia has ended`)
      return message.say(errlyricsEmbed);
    } else if (songName == '' && !message.guild.musicData.isPlaying) {
      errlyricsEmbed.setDescription(`${xmoji} | There is no song playing right now, please try again with a song name or play a song first`)
      return message.say(errlyricsEmbed);
    } else if (!songName == '') {
      songName = songName
    }

    const sentMessage = await message.channel.send(
      '👀 Searching for lyrics 👀'
    );

    try {
      const url = await searchSong(cleanSongName(songName));
      const songPageURL = await getSongPageURL(url);
      const lyrics = await getLyrics(songPageURL);

      const lyricsIndex = Math.round(lyrics.length / 4096) + 1;
      const lyricsArray = [];

      for (let i = 1; i <= lyricsIndex; ++i) {
        let b = i - 1;
        if (lyrics.trim().slice(b * 4096, i * 4096).length !== 0) {
          lyricsArray.push(lyrics.slice(b * 4096, i * 4096));
        }
      }

      /*let currentPage = 0;
      const embeds = generateQueueEmbed(generateLyricsEmbed);

      const queueEmbed = await message.channel.send(
        embeds[currentPage]
      );

      try {
        await queueEmbed.react("⬅️");
        await queueEmbed.react("🗑️");
        await queueEmbed.react("➡️");
      } catch (error) {
        console.error(error);
        message.channel.send(error.message).catch(console.error);
      }

      const filter = (reaction, user) =>
        ["⬅️", "🗑️", "➡️"].includes(reaction.emoji.name) && message.author.id === user.id;
      const collector = queueEmbed.createReactionCollector(filter, { time: 300000 });

      collector.on("collect", async (reaction, user) => {
        try {
          if (reaction.emoji.name === "➡️") {
            if (currentPage < embeds.length - 1) {
              currentPage++;
              queueEmbed.edit(embeds[currentPage]);
            }
          } else if (reaction.emoji.name === "⬅️") {
            if (currentPage !== 0) {
              --currentPage;
              queueEmbed.edit(embeds[currentPage]);
            }
          } else {
            reaction.message.reactions.removeAll();
            reaction.message.delete({ timeout: 1000 }).catch(console.error);
          }
          await reaction.users.remove(message.author.id);
        } catch (error) {
          console.error(error);
          return message.channel.send(error.message + ', Please give me permission to **MANAGE_MESSAGES** to delete a reaction').catch(console.error);
        }
      });

      collector.on("end", (reaction, user) => { 
        queueEmbed.reactions.removeAll();
      });
      return;*/

      let firstbutton = new MessageButton().setStyle("green").setID("1").setLabel("<")
      let secondbutton = new MessageButton().setStyle("green").setID("2").setLabel(">")
      let linkingbutton = new MessageButton().setStyle("url").setLabel("View On Website").setURL()
        
      var buttonarray = [firstbutton, secondbutton, linkingbutton]
      const embeds = generateLyricsEmbed(lyricsArray)

      var currentPage = 0;
      sentMessage.delete();
      let mybuttonsmsg = await message.channel.send(``, { embed: embeds[currentPage], buttons: buttonarray })
      var embedsarray = embeds

      const collector = mybuttonsmsg.createButtonCollector((button)=> button.clicker.user.id === message.author.id, {time: 60e3});
        
      collector.on("collect", async b => {
        b.reply.defer()
        if (b.id == "1"){
          if(currentPage !== 0){
            --currentPage;
            mybuttonsmsg.edit(``, { embed: embedsarray[currentPage], buttons: buttonarray })
          }else {
            currentPage = embedsarray.length - 1;
            mybuttonsmsg.edit(``, { embed: embedsarray[currentPage], buttons: buttonarray })
          }
        }
        else if (b.id == "2"){
          if(currentPage < embedsarray.length - 1){
            currentPage++;
            mybuttonsmsg.edit(``, { embed: embedsarray[currentPage], buttons: buttonarray })
          }else {
            currentPage = 0;
            mybuttonsmsg.edit(``, { embed: embedsarray[currentPage], buttons: buttonarray })
          }
        }
      })

      collector.on("end", async b  => { 
        mybuttonsmsg.edit(``, { embed: embedsarray[currentPage], buttons: null })
      });
    } catch (error) {
      console.error(error);
      return message.channel.send(
        ':x: Something went wrong! Please try again later'
      );
    }
  };
}

function generateLyricsEmbed(lyrics) {
  let embeds = [];
  let k = 1;

  for (let i = 0; i < lyrics.length; i += 1) {
    const current = lyrics.slice(i, k);
    let j = i;
    k += 1;

    const info = current.map((e) => `${e}`);
    const embed = new MessageEmbed()
    .setTitle(`🎶 Lyrics for ${songName} ${++j/lyrics.length}`)
    .setColor(normalcolor)
    .setDescription(`${info}`)
    .setFooter(`Provided by genius.com`)
    embeds.push(embed);
  }
  return embeds;
};

function cleanSongName(songName) {
  return songName
    .replace(/ *\([^)]*\) */g, '')
    .replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    );
}

function searchSong(query) {
  return new Promise(async function(resolve, reject) {
    const searchURL = `https://api.genius.com/search?q=${encodeURI(query)}`;
    const headers = {
      Authorization: `Bearer ${geniusLyricsAPI}`
    };
    try {
      const body = await fetch(searchURL, { headers });
      const result = await body.json();
      const songPath = result.response.hits[0].result.api_path;
      resolve(`https://api.genius.com${songPath}`);
    } catch (e) {
      reject(':x: No song has been found for this query');
    }
  });
}

function getSongPageURL(url) {
  return new Promise(async function(resolve, reject) {
    const headers = {
      Authorization: `Bearer ${geniusLyricsAPI}`
    };
    try {
      const body = await fetch(url, { headers });
      const result = await body.json();
      if (!result.response.song.url) {
        reject(':x: There was a problem finding a URL for this song');
      } else {
        resolve(result.response.song.url);
      }
    } catch (e) {
      console.log(e);
      reject('There was a problem finding a URL for this song');
    }
  });
}

function getLyrics(url) {
  return new Promise(async function(resolve, reject) {
    try {
      const response = await fetch(url);
      const text = await response.text();
      const $ = cheerio.load(text);
      let lyrics = $('.lyrics')
        .text()
        .trim();
      if (!lyrics) {
        $('.Lyrics__Container-sc-1ynbvzw-8')
          .find('br')
          .replaceWith('\n');
        lyrics = $('.Lyrics__Container-sc-1ynbvzw-8').text();
        if (!lyrics) {
          reject(
            'There was a problem fetching lyrics for this song, please try again'
          );
        } else {
          resolve(lyrics.replace(/(\[.+\])/g, ''));
        }
      } else {
        resolve(lyrics.replace(/(\[.+\])/g, ''));
      }
    } catch (e) {
      console.log(e);
      reject(
        'There was a problem fetching lyrics for this song, please try again'
      );
    }
  });
}
