/**
 * @author briantoe
 * @year 2021
 */
const { Client } = require('pg');
const { prefix, database } = require('../config.json');
const { MessageEmbed } = require('discord.js');

const pgClient = new Client({
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
    const [username, tagline] = args[0].split('#');
    const text = `INSERT INTO ${database}(username, tagline) VALUES($1, $2) RETURNING *`;
    pgClient.query(text, [username, tagline], (err, res) => {
      if (err) {
        console.log('error');
        const embed = new MessageEmbed()
          .addFields({
            name: 'Error',
            value: 'Your registration failed for some reason',
          })
          .setColor('RANDOM');
        message.channel.send({embeds: [embed]}).then((msg) => {
          setTimeout(() => msg.delete(), 10000);
        });
        this.syntax(message);
        console.log(err.stack);
      } else {
        console.log(res.rows[0]);
      }
      pgClient.end();
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
    message.channel.send({embeds: [embed]}).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  },
};
