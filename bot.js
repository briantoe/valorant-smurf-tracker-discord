const { Client, Collection, Intents } = require('discord.js');
const path = require('path');
const glob = require('glob');
const dotenv = require('dotenv');

const config = require('./config.json');
const client = new Client({
  intents: [
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    Intents.FLAGS.GUILDS,
  ],
});

// Create two Collections where we can store our commands and aliases in.
// Store these collections on the client object so we can access them inside commands etc.
client.commands = new Collection();
client.aliases = new Collection();

dotenv.config();

function loadCommands(commandDirectoryPath) {
  // Create an empty array that will store all the file paths for the commands,
  // and push all files to the array.
  const commandArray = [];
  commandArray.push(
    ...glob.sync(`${path.join(__dirname, commandDirectoryPath)}/**/*.js`)
  );

  // Iterate through each element of the items array and add the commands / aliases
  // to their respective Collection.
  for (const commandItem of commandArray) {
    // Remove any cached commands
    if (require.cache[require.resolve(commandItem)])
      delete require.cache[require.resolve(commandItem)];

    // Store the command and aliases (if it has any) in their Collection.
    const command = require(commandItem);

    // Check if this command has some precondition that should prevent it from being loaded
    if ('shouldLoad' in command && !command.shouldLoad()) continue;

    // Add command to our commands collection and map aliases
    client.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        client.aliases.set(alias, command.name);
      }
    }
  }
  console.log('Commands was loaded...');
}

// Load commands from the './commands' folder
loadCommands('commands');

client.on('ready', () => {
  console.log('Bot is ready...');
});
// Client message event, contains the logic for the command handler.
client.on('messageCreate', (message) => {
  // Make sure the message contains the command prefix from the config.json.
  if (!message.content.startsWith(config.prefix)) {
    return;
  }
  // Make sure the message author isn't a bot
  if (message.author.bot) {
    return;
  }
  // Make sure the channel the command is called in is a text channel.
  // if (message.channel.type !== 'text') {
  //   console.log("not a text channel??")
  //   return;
  // }

  // Split the message content and store the command called, and the args.

  // if command has arguments that need to be split by ,
  let messageSplit, cmd, args;
  if (message.content.includes(',')) {
    // console.log(message.content.substr(1).split(','));
    cmd = message.content.substr(1).split(' ')[0];
    args = message.content
      .substr(cmd.length + 1)
      .split(',')
      .map((elem) => elem.trim());
  } else {
    messageSplit = message.content.split(/\s+/g);
    cmd = messageSplit[0].slice(config.prefix.length);
    args = messageSplit.slice(1);
  }

  message.hasComma = message.content.includes(','); // for commands that need a comma to separate command args

  try {
    // Check if the command called exists in either the commands Collection
    // or the aliases Collection.
    let command;

    if (client.commands.has(cmd.toLowerCase())) {
      command = client.commands.get(cmd);
    } else if (client.aliases.has(cmd)) {
      command = client.commands.get(client.aliases.get(cmd));
    }

    // Make sure command is defined.
    if (!command) return;

    // If the command exists then run the execute function inside the command file.
    command.execute(client, message, args);
  } catch (err) {
    console.error(err);
    console.log(command);
    command.syntax(message);
  }
});

client.login(process.env.TOKEN);
