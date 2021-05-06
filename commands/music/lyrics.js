const { Command } = require('discord.js-commando');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const Pagination = require('discord-paginationembed');
const cheerio = require('cheerio');
const { geniusLyricsAPI, normalcolor, errorcolor, xmoji, cmoji } = require('../../config.json');

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
    if (!message.guild.me.hasPermission("EMBED_LINKS")) {
      return message.channel.send(`I don't have permission to send embed`);
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

    // remove stuff like (Official Video)
    songName = songName.replace(/ *\([^)]*\) */g, '');

    // remove emojis
    songName = songName.replace(
      /([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g,
      ''
    );

    LyricsCommand.searchSong(songName)
      .then(async function(url) {
        LyricsCommand.getSongPageURL(url)
          .then(async function(url) {
            LyricsCommand.getLyrics(url)
              .then(async function(lyrics) {   
                if (lyrics.length < 2048) {
                  const lyricsEmbed = new MessageEmbed()
                    .setTitle(songName)
                    .setColor(normalcolor)
                    .setDescription(lyrics.trim())
                    .setFooter('Provided by genius.com');
                  return sentMessage.edit('', lyricsEmbed);
                } else {
                  let zenbu = []
                  let pg1 = lyrics.slice(0, 2048)
                  let pg2 = lyrics.slice(2048, 4096) 
                  let pg3
                  if (lyrics.length > 4096) {
                    pg3 = lyrics.slice(4096, lyrics.length) 
                    zenbu.push(pg1)
                    zenbu.push(pg2)
                    zenbu.push(pg3)
                  } else {
                    zenbu.push(pg1)
                    zenbu.push(pg2)
                  }
                  sentMessage.delete();
                  
                  let currentPage = 0;
                  const embeds = generateQueueEmbed(message, zenbu);
              
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
                  return;
                }
              })
              .catch(function(err) {
                message.say(err);
                return;
              });
          })
          .catch(function(err) {
            message.say(err);
            return;
          });
      })
      .catch(function(err) {
        message.say(err);
        return;
      });

      
  function generateQueueEmbed(message, lyrics) {
    let embeds = [];
    let k = 1;
  
    for (let i = 0; i < lyrics.length; i += 1) {
      const current = lyrics.slice(i, k);
      let j = i;
      k += 1;
  
      const info = current.map((e) => `${e}`);
      const embed = new MessageEmbed()
      .setTitle(`🎶 Lyrics for ${songName}`)
      .setColor(normalcolor)
      .setDescription(`${info}`)
      .setFooter(`Provided by genius.com`)
      embeds.push(embed);
    }
    return embeds;
  };
  }

  static searchSong(query) {
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
        reject('No song has been found for this query');
      }
    });
  }

  static getSongPageURL(url) {
    return new Promise(async function(resolve, reject) {
      const headers = {
        Authorization: `Bearer ${geniusLyricsAPI}`
      };
      try {
        const body = await fetch(url, { headers });
        const result = await body.json();
        if (!result.response.song.url) {
          reject('There was a problem finding a URL for this song');
        } else {
          resolve(result.response.song.url);
        }
      } catch (e) {
        console.log(e);
        reject('There was a problem finding a URL for this song');
      }
    });
  }

  static getLyrics(url) {
    return new Promise(async function(resolve, reject) {
      try {
        const response = await fetch(url);
        const text = await response.text();
        const $ = cheerio.load(text);
        let lyrics = $('.lyrics')
          .text()
          .trim();
        if (!lyrics) {
          $('.Lyrics__Container-sc-1ynbvzw-2')
            .find('br')
            .replaceWith('\n');
          lyrics = $('.Lyrics__Container-sc-1ynbvzw-2').text();
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
};
