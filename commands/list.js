const { MessageEmbed } = require('discord.js');
const paginationEmbed = require('../utils/discord.js-pagination');
const { Pool } = require('pg');
const { table } = require('../config.json');
const { errorEmbed } = require('../utils/presetEmbeds');

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
      const query = `SELECT username, tagline, rank, tier FROM ${table} LIMIT 1000`;
      pgPool.query(query, (err, res) => {
        if (err) {
          const embed = errorEmbed(
            `The database is unreachable at this time\n**Error Code:** ${err.code}`
          );
          message.channel.send(embed);
          console.log(err.stack);
        } else {
          // console.log(res.rows);
          paginatedAccountList = paginateRows(res.rows, numAccountsPerPage);
          // console.log(paginatedAccountList);
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
          const rowValue = `${account.username}#${account.tagline}\n${rank}\n`;
          return `${counter++}. ${rowValue}`;
        });
        // message.channel.send(`${listOfAccounts}`);
        // console.log(listOfAccounts);
        return new MessageEmbed().setDescription(listOfAccounts.join('\n'));
      });
      paginationEmbed(message, embedList);
    }

    getAccountsFromDatabase();
  },
};
