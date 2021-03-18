const { Command } = require('discord.js-commando');
const { Database } = require("quickmongo");
const db = new Database("mongodb+srv://admin:lakilaki@cluster0.yvw90.mongodb.net/guaa?retryWrites=true&w=majority", "playlist");

module.exports = class CreatePlaylistCommand extends Command {
  constructor(client) {
    super(client, {
      name: 'playlist',
      group: 'music',
      memberName: 'playlist',
      guildOnly: true,
      description: 'Create and save playlist',
      args: [
        {
          key: 'type',
          prompt: 'What is the name of the playlist you would like to create?',
          type: 'string',
          default: ''
        }
      ]
    });
  }

  async run(message, { type }) {
    if (type.toLowerCase() == 'play') {
        return message.client.commands.get("play-playlist").run(message, '');
    } else if (type.toLowerCase() == 'add') {
        return message.client.commands.get("save-to-playlist").run(message, '');
    } else if (type.toLowerCase() == 'remove') {
        return message.client.commands.get("remove-from-playlist").run(message, '');
    } else if (type.toLowerCase() == 'create') {
        return message.client.commands.get("create-playlist").run(message, '');
    } else if (type.toLowerCase() == 'delete') {
        return message.client.commands.get("delete-playlist").run(message, '');
    } else if (type.toLowerCase() == 'see') {
        return message.client.commands.get("see-playlist").run(message, '');
    } else if (type.toLowerCase() == '') {
        
    }
  }
};