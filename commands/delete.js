const { MessageEmbed } = require('discord.js');
const { Pool } = require('pg');
const { table } = require('../config.json');
const { errorEmbed } = require('../utils/presetEmbeds');
const { prefix } = require('../config.json');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  name: 'delete',
  description: 'Delete an account using their username#tagline or login_name',
  aliases: [],
  execute(client, message, args) {
    const numAccountsPerPage = !args.length ? 10 : args[0];

    if (!args.length) {
      const msg = "You didn't provide a <username>#<tagline>";
      const embed = errorEmbed(msg);
      message.channel.send({ embeds: [embed] });
      this.syntax(message);
      return;
    }
    if (!message.hasComma) {
      const msg =
        "There wasn't a comma in the arguments, I need this to register accounts with spaces in their username!";
      const embed = errorEmbed(msg);
      message.channel.send({ embeds: [embed] });
      this.syntax(message);
      return;
    }

    const placeholderEmbed = new MessageEmbed().addFields({
      name: 'Fetching rank data...',
      value: 'Please wait :smile:',
    });

    message.channel.send({ embeds: [placeholderEmbed] }).then((sentMsg) => {
      const [username, tagline] = args[0].split('#');
      const loginName = args[1] ? args[1] : null;
      let rank, tier;
      valAPI
        .getMMR('v1', 'na', username, tagline)
        .then((value) => {
          console.log(value);
          [rank, tier] = value.data.currenttierpatched.split(' ');
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          deleteAccount(username, tagline, loginName);
        });
    });

    function deleteAccount(username, tagline, loginName) {}

    function getAccountsFromDatabase() {
      const isDev = process.env.DEV_ENV === 'true';
      const query = `SELECT username, tagline, rank, tier, login_name FROM ${table}${
        isDev ? '_dev' : ''
      } WHERE server_id = '${message.guild.id}' LIMIT 1000`;
      pgPool.query(query, (err, res) => {
        if (err) {
          const embed = errorEmbed(
            `The database is unreachable at this time\n**Error Code:** ${err.code}`
          );
          message.channel.send({ embeds: [embed] });
          console.log(err.stack);
        } else {
          // console.log(res.rows);
          if (!res.rows.length) {
            const embed = errorEmbed(
              `There are no accounts registered, try registering some using the \`${prefix}register\` command`
            );
            message.channel.send({ embeds: [embed] });
            return;
          }
          paginatedAccountList = paginateRows(res.rows, numAccountsPerPage);
          generateEmbeds(paginatedAccountList);
        }
      });
    }
  },
};
