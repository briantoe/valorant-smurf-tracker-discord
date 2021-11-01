# Valorant Smurf Tracker

## Background
My Discord server needed a way to keep track of their Valorant smurf ranks, since they have many and it was becoming very cumbersome to manually edit old Discord messages after a rank change.

Register with the bot and it'll keep track of your account's current rank!
 
## Dependencies
- PostgreSQL
- Node.js 16.0.0 or higher
- "discord.js": "^13.2.0",
- "dotenv": "^10.0.0",
- "glob": "^7.2.0",
- "pg": "^8.7.1",
- "unofficial-valorant-api": "^1.0.2"

## Running

1. Clone the repository `git clone https://github.com/briantoe/valorant-smurf-tracker-discord.git`.
2. Open the project in your terminal e.g `cd C:\Projects\valorant-smurf-tracker`, and run: `npm install` to install dependencies from the package.json.

If you have all you need installed you should just be able to open a terminal in your project directory and run `npm start` or `node bot.js` and it should start the bot.


## Current progress
Right now the bot only has a `register` and `list` command, and is highly dependent on you having set up your own PostgreSQL database (I went with Heroku for as a cheap solution). Documentation will be provided later if the demand is high enough, or whenever I feel like writing it myself.

## Other people's work I used _(thanks :])_
- https://github.com/lem-n/discord.js-boilerplate
- https://www.npmjs.com/package/discord.js-pagination
- https://github.com/Henrik-3/unofficial-valorant-api/tree/main/package
#
### _Smurf account tracking made simpler_