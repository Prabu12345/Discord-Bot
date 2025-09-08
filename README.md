
# Muah (msp-bot)

[![Discord.js](https://img.shields.io/badge/Discord.js-v12.5.3-blue.svg)](https://discord.js.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-yellow.svg)](https://opensource.org/licenses/ISC)
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/PraboHD/msp-bot/graphs/commit-activity)

## Description

Muah, also known as msp-bot, is a versatile Discord music bot built with Discord.js. It offers a range of features beyond just music playback, including guild management tools, GIF commands, and other miscellaneous utilities. It's designed to be easy to use and extend, making it a great choice for Discord communities of all sizes.

## Table of Contents

- [Features](#features)
- [Setup](#setup)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

*   **Music Playback:** Play music from YouTube, Spotify, and other sources.
*   **Guild Management:** Tools for managing your Discord server.
*   **GIF Commands:** Access a library of GIFs for various situations.
*   **Miscellaneous Commands:** A collection of useful and fun commands.
*   **Beginner-Friendly:** Easy to set up and use.

## Setup

Follow these steps to set up Muah on your Discord server:

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) (version 12 or higher)
    *   [npm](https://www.npmjs.com/) (Node Package Manager) or [Yarn](https://yarnpkg.com/)
    *   A Discord bot token.  You can create a bot and obtain a token from the [Discord Developer Portal](https://discord.com/developers/applications).
    *   MongoDB database. You can use a local instance or a cloud-based service like [MongoDB Atlas](https://www.mongodb.com/atlas/database).

2.  **Clone the repository:**

    bash
    npm install # or yarn install
        *   Create a `.env` file in the root directory of the project.
    *   Add the following environment variables to the `.env` file:

bash
    npm start
        *   Generate an invite link for your bot with the appropriate permissions. You can use a tool like the [Discord Permissions Calculator](https://discordapi.com/permissions.html) to generate the link.
    *   Visit the generated link in your browser and select the server you want to invite the bot to.

## Usage

Once the bot is running and invited to your server, you can use its commands by typing them in a Discord channel.

Here are some example commands:

*   `!play <song name>`: Plays the specified song.
*   `!pause`: Pauses the currently playing song.
*   `!resume`: Resumes the paused song.
*   `!skip`: Skips the current song.
*   `!queue`: Displays the current song queue.
*   `!gif <search term>`: Sends a random GIF based on the search term.
    > The bot uses a command framework (discord.js-commando), so refer to the bot's command list for a full list of available commands. The prefix might be different based on configuration.

## Contributing

We welcome contributions to Muah! If you'd like to contribute, please follow these steps:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear, concise messages.
4.  Submit a pull request to the main branch.

> Please ensure your code adheres to the project's coding style and includes appropriate tests.

## License

This project is licensed under the ISC License. See the `LICENSE` file for details.

## Contact

If you have any questions or issues, please contact the project maintainer:

*   PraboHD

> You can reach out to the maintainer via GitHub or Discord (if the maintainer provides their Discord tag).
