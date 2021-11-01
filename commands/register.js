/**
 * @author briantoe
 * @year 2021
 */
const { Pool } = require('pg');
const { prefix, table } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/presetEmbeds');
const valAPI = require('unofficial-valorant-api');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function getMMR(username, tagline) {
  valAPI.getMMR('v1', 'na', username, tagline).then((value) => {
    return value.data.currenttierpatched;
  });
}

module.exports = {
  name: 'register',
  description:
    'Register an account with the bot and makes the account trackable.',
  aliases: [],
  execute(client, message, args) {
    // write your logic here
    if (!args.length) {
      const msg = "You didn't provide a <username>#<tagline>";
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
          postToDatabase(username, tagline, rank, tier, sentMsg, loginName);
        });
    });

    function postToDatabase(username, tagline, rank, tier, message, loginName) {
      const guildId = message.guild.id;
      const text = `INSERT INTO ${table}(username, tagline, rank, tier, server_id, login_name) VALUES($1, $2, $3, $4, $5, $6) RETURNING *`;
      pgPool.query(
        text,
        [username, tagline, rank, tier, guildId, loginName],
        (err, res) => {
          if (err) {
            if (err.code === '23505') {
              const embed = new MessageEmbed()
                .addFields({
                  name: 'Error',
                  value: `**${username}#${tagline}** already exists!`,
                })
                .setColor('RANDOM');
              message.edit({ embeds: [embed] });
            } else {
              const msg = `Your registration failed for some reason, check your command and try again\n**Error Code:** ${err.code}`;
              const embed = errorEmbed(msg);
              message.edit({ embeds: [embed] });
            }
            console.log(err.stack);
          } else {
            const msg = `**${username}#${tagline}** has been registered`;
            const warning = {
              name: 'Note',
              value:
                "Rank was not obtained, I will resolve this eventually so don't worry. :smile:",
            };

            const embed =
              !rank || !tier
                ? successEmbed(msg).addFields(warning)
                : successEmbed(msg);
            message.edit({ embeds: [embed] });
          }
        }
      );
    }
  },
  syntax(message) {
    // syntax command
    const embed = new MessageEmbed()
      .addFields({
        name: 'Usage',
        value: `${prefix}${this.name} <username>#<tagline> <login_name>`,
      })
      .setDescription(`**${this.description}**`)
      .setColor('RANDOM')
      .setTitle('Syntax');
    message.channel.send({ embeds: [embed] });
  },
};
