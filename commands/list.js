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
    getAllByServerId(message.guild.id)
      .then((res) => {
        if (!res.rowCount) {
          const embed = errorEmbed(
            `There are no accounts registered, try registering some using the \`${prefix}register\` command`
          );
          message.channel.send({ embeds: [embed] });
          return;
        }
        // const oldRows = res.rows.filter((row) => isOldRow(row));
        // const goodRows = res.rows.filter((row) => !isOldRow(row));

        updateRanks(res.rows).then((rows) => {
          const paginatedAccountList = paginateRows(rows, numAccountsPerPage);
          generateEmbeds(paginatedAccountList);
        });
      })
      .catch((err) => {
        const embed = errorEmbed(
          `The database is unreachable at this time\n**Error Code:** ${err.code}`
        );
        message.channel.send({ embeds: [embed] });
        console.log(err.stack);
      });

    function isOldRow(row) {
      const lastUpdate = moment(row.modified).utc();
      const nowTime = moment().utc();
      return Math.abs(lastUpdate.diff(nowTime, 'hours')) > 0;
    }

    async function updateRanks(rows) {
      const newRows = [];

      for (const row of rows) {
        const r = row;
        const lastUpdate = moment(row.modified).utc();
        const nowTime = moment().utc();
        const difference = Math.abs(lastUpdate.diff(nowTime, 'hours'));
        if (difference > 0) {
          //(difference + 100 > 0) {
          const res = await valAPI.getMMR(
            'v2',
            'na',
            row.username,
            row.tagline
          );
          if (res.status == '200') {
            [r.rank, r.tier] =
              res.data.current_data.currenttierpatched.split(' ');
          }
        }
        newRows.push(r);
        // console.log(r)
      }
      // rows.forEach((row) => {
      //   const r = row;
      //   const lastUpdate = moment(row.modified).utc();
      //   const nowTime = moment().utc();
      //   const difference = Math.abs(lastUpdate.diff(nowTime, 'hours'));
      //   if (true) {
      //     //(difference + 100 > 0) {
      //     valAPI.getMMR('v2', 'na', row.username, row.tagline).then((res) => {
      //       if (res.status === '200') {
      //         [r.rank, r.tier] =
      //           res.data.current_data.currenttierpatched.split(' ');
      //       }
      //       newRows.push(r);
      //     });
      //   }
      // });
      // // console.log(newRows);
      return newRows;
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
            ? `Rank: ${account.rank} ${account.tier ?? ''}`
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
  },
};

// TODO: have the bot check for rank updates on accounts, and update the database accordingly.
// might need to find a clever way of getting around the API request restrictions
