const { MessageEmbed } = require('discord.js');
const paginationEmbed = require('../utils/discord.js-pagination');
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
  name: 'list',
  description: 'Lists all registered accounts',
  aliases: [],
  execute(client, message, args) {
    const numAccountsPerPage = !args.length ? 10 : args[0];
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

    function paginateRows(rows, numAccountsPerPage) {
      const paginatedAccountList = new Array(
        Math.ceil(rows.length / numAccountsPerPage)
      )
        .fill()
        .map((_) => rows.splice(0, numAccountsPerPage));
      return paginatedAccountList;
    }
    function generateEmbeds(paginatedAccountList) {
      let counter = 1;
      const embedList = paginatedAccountList.map((accounts) => {
        const listOfAccounts = accounts.map((account) => {
          const rank = account.rank
            ? `Rank: ${account.rank} ${account.tier}`
            : `Rank not available`;
          const loginName = account.login_name
            ? `Login Name: ${account.login_name}`
            : `Login name not available`;
          const rowValue = `${account.username}#${account.tagline}\n${loginName}\n${rank}\n`;
          return `${counter++}. ${rowValue}`;
        });
        // message.channel.send(`${listOfAccounts}`);
        // console.log(listOfAccounts);
        return new MessageEmbed()
          .setTitle('Accounts:')
          .setDescription(listOfAccounts.join('\n'));
      });
      paginationEmbed(message, embedList);
    }

    getAccountsFromDatabase();
  },
};

// TODO: have the bot check for rank updates on accounts, and update the database accordingly.
// might need to find a clever way of getting around the API request restrictions
