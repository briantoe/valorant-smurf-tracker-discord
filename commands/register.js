/**
 * @author briantoe
 * @year 2021
 */
const { prefix } = require('../config.json');
const { MessageEmbed } = require('discord.js');
const { successEmbed, errorEmbed } = require('../utils/presetEmbeds');
const { post } = require('../utils/post');
const valAPI = require('unofficial-valorant-api');

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
      // placeholder msg is sent, gives user something indicating that the bot is fetching data from valAPI, then
      // will edit the message once the bot is finished fetching and storing data
      const [username, tagline] = args[0].split('#');
      const loginName = args[1];
      let rank, tier;
      valAPI
        .getMMR('v1', 'na', username, tagline)
        .then((value) => {
          console.log(value);
          if (value.status !== '200') return;
          [rank, tier] = value.data.currenttierpatched.split(' ');
        })
        .finally(() => {
          const account = {
            username,
            tagline,
            rank,
            tier,
            server_id: message.guild.id,
            login_name: loginName,
          };
          post(account)
            .then(() => {
              const msg = `**${username}#${tagline}** has been registered`;
              const warning = {
                name: 'Note',
                value:
                  "Rank was not obtained, I will resolve this if possible so don't worry. :smile:",
              };
              const embed =
                !rank || !tier
                  ? successEmbed(msg).addFields(warning)
                  : successEmbed(msg);
              sentMsg.edit({ embeds: [embed] });
            })
            .catch((err) => {
              if (err.code === '23505') {
                const msg = `**${username}#${tagline}** already exists!`;
                const embed = errorEmbed(msg);
                sentMsg.edit({ embeds: [embed] });
              } else {
                const msg = `Your registration failed for some reason, check your command and try again\n**Error Code:** ${err.code}`;
                const embed = errorEmbed(msg);
                sentMsg.edit({ embeds: [embed] });
              }
              console.log(err.stack);
            });
        });
    });
  },
  syntax(message) {
    // syntax command
    const embed = new MessageEmbed()
      .addFields({
        name: 'Usage',
        value: `${prefix}${this.name} <username>#<tagline>, <login_name>`,
      })
      .setDescription(`**${this.description}**`)
      .setColor('RANDOM')
      .setTitle('Syntax');
    message.channel.send({ embeds: [embed] });
  },
};
