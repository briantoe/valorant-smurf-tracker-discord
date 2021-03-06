const { MessageEmbed } = require('discord.js');
const paginationEmbed = require('../utils/discord.js-pagination');
const { getAllByServerId } = require('../utils/crud/getAllByServerId');
const { update } = require('../utils/crud/update');
const { errorEmbed } = require('../utils/presetEmbeds');
const { prefix } = require('../config.json');
const moment = require('moment');
const valAPI = require('unofficial-valorant-api');

module.exports = {
  name: 'list',
  description: 'Lists all registered accounts',
  aliases: [],
  execute(client, message, args) {
    const numAccountsPerPage = !args.length ? 10 : args[0];
    const placeholderEmbed = new MessageEmbed().addFields({
      name: 'Fetching new data...',
      value: 'Please wait :smile:',
    });

    message.channel.send({ embeds: [placeholderEmbed] }).then((sentMsg) => {
      getAllByServerId(message.guild.id)
        .then((res) => {
          if (!res.rowCount) {
            const embed = errorEmbed(
              `There are no accounts registered, try registering some using the \`${prefix}register\` command`
            );
            sentMsg.edit({ embeds: [embed] });
            return;
          }

          fetchRanks(res.rows).then((rows) => {
            rows.forEach((row) => {
              //attach serverId to row!!!
              row.serverId = message.guild.id;
              row.modified = moment().utc().toDate();

              update(row).catch((err) => {
                console.log('update error');
                console.log(err);
              });
            });
            const paginatedAccountList = paginateRows(rows, numAccountsPerPage);
            generateEmbeds(paginatedAccountList).then(() => {
              sentMsg.delete();
            });
          });
        })
        .catch((err) => {
          const embed = errorEmbed(
            `The database is unreachable at this time\n**Error Code:** ${err.code}`
          );
          sentMsg.edit({ embeds: [embed] });
          console.log(err.stack);
        });
    });

    async function fetchRanks(rows) {
      const unresolved = rows.map(async (row) => {
        const lastUpdate = moment(row.modified).utc();
        const nowTime = moment().utc();
        const difference = Math.abs(lastUpdate.diff(nowTime, 'minutes'));
        if (difference > 30) {
          const res = await valAPI.getMMR(
            'v2',
            'na',
            row.username,
            row.tagline
          );
          if (res.status == '200') {
            [row.rank, row.tier] =
              res.data.current_data.currenttierpatched.split(' ');
          } else {
            console.log(res);
          }
        }
        return row;
      });
      const resolved = await Promise.all(unresolved);
      return resolved;
    }

    function paginateRows(rows, numAccountsPerPage) {
      const paginatedAccountList = new Array(
        Math.ceil(rows.length / numAccountsPerPage)
      )
        .fill()
        .map((_) => rows.splice(0, numAccountsPerPage));
      return paginatedAccountList;
    }

    async function generateEmbeds(paginatedAccountList) {
      let counter = 1;
      const embedList = paginatedAccountList.map((accounts) => {
        const listOfAccounts = accounts.map((account) => {
          const rank = account.rank
            ? `Rank: ${account.rank} ${account.tier ?? ''}`
            : `Rank not available`;
          const loginName = account.login_name
            ? `Login Name: ${account.login_name}`
            : `Login name not available`;
          const rowValue = `${account.username}#${account.tagline}\n${loginName}\n${rank}\n`;
          return `${counter++}. ${rowValue}`;
        });
        return new MessageEmbed()
          .setTitle('Accounts:')
          .setDescription(listOfAccounts.join('\n'));
      });
      paginationEmbed(message, embedList);
    }
  },
};

// TODO: have the bot check for rank updates on accounts, and update the database accordingly.
// might need to find a clever way of getting around the API request restrictions
