/**
 * @author briantoe
 * @year 2021
 */
const { Pool } = require('pg');
const { prefix, database } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/presetEmbeds');
const valAPI = require('unofficial-valorant-api');

const pgPool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

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
      return;
    }

    const [username, tagline] = args[0].split('#');
    const text = `INSERT INTO ${database}(username, tagline) VALUES($1, $2) RETURNING *`;
    pgPool.query(text, [username, tagline], (err, res) => {
      if (err) {
        if (err.code === '23505') {
          const embed = new MessageEmbed()
            .addFields({
              name: 'Error',
              value: `**${username}#${tagline}** already exists!`,
            })
            .setColor('RANDOM');
          message.channel.send({ embeds: [embed] });
        } else {
          const msg = `Your registration failed for some reason\n**Error Code:** ${err.code}`;
          const embed = errorEmbed(msg);
          message.channel.send({ embeds: [embed] });
        }
        console.log(err.stack);
        return;
      } else {
        const msg = `**${username}#${tagline}** has been registered`;
        const embed = successEmbed(msg);
        message.channel.send({ embeds: [embed] });
      }

      //
    });
  },
  syntax(message) {
    // syntax command
    const embed = new MessageEmbed()
      .addFields({
        name: 'Usage',
        value: `${prefix}${this.name} <username>#<tagline>`,
      })
      .setDescription(`**${this.description}**`)
      .setColor('RANDOM');
    message.channel.send({ embeds: [embed] }).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  },
};
