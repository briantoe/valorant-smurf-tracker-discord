const { MessageEmbed } = require('discord.js');
const { errorEmbed, successEmbed } = require('../utils/presetEmbeds');
const { prefix } = require('../config.json');
const { deleteAccount } = require('../utils/crud/delete');

module.exports = {
  name: 'delete',
  description: 'Delete an account using their username#tagline or login name',
  aliases: ['remove'],
  execute(client, message, args) {
    if (!args.length) {
      const msg = "You didn't provide a <username>#<tagline> OR <login_name>!";
      const embed = errorEmbed(msg);
      message.channel.send({ embeds: [embed] });
      this.syntax(message);
      return;
    }

    const placeholderEmbed = new MessageEmbed().addFields({
      name: 'Deleting account...',
      value: 'Please wait :smile:',
    });

    message.channel.send({ embeds: [placeholderEmbed] }).then((sentMsg) => {
      let username, tagline, loginName;
      if (args[0].includes('#')) {
        [username, tagline] = args[0].split('#');
      } else {
        loginName = args[0];
      }
      const serverId = message.guild.id;
      const account = {
        username,
        tagline,
        serverId,
        loginName,
      };
      deleteAccount(account)
        .then((res) => {
          if (res.rowCount === 0) {
            const embed = errorEmbed('No account was deleted :thinking:');
            sentMsg.edit({ embeds: [embed] });
          } else if (res.rowCount === 1) {
            const embed = successEmbed('Account deleted successfully :smile:');
            sentMsg.edit({ embeds: [embed] });
          } else if (res.rowCount > 1) {
            const accountsDeleted = res.rows.map(
              (row) => `${row.username}#${row.tagline}`
            );
            const embed = successEmbed(
              'Account(s) deleted successfully? :thinking:'
            ).addFields(
              {
                name: 'Note',
                value: `${res.rowCount} accounts were deleted, strange...\nMight want to let Brian and that person know.`,
              },
              {
                name: 'Accounts deleted: ',
                value: `${JSON.stringify(accountsDeleted)}`,
              }
            );
            sentMsg.edit({ embeds: [embed] });
          } else {
            const embed = errorEmbed(
              'Something unexpected happened!'
            ).addFields({
              name: 'Result',
              value: JSON.stringify(res),
            });
            sentMsg.edit({ embeds: [embed] });
          }
        })
        .catch((err) => {
          const embed = errorEmbed('Something unexpected happened!').addFields({
            name: 'Error Message',
            value: JSON.stringify(err),
          });
          sentMsg.edit({ embeds: [embed] });
          console.log(err);
        });
    });
  },
  syntax(message) {
    // syntax command
    const embed = new MessageEmbed()
      .addFields({
        name: 'Usage',
        value: `${prefix}${this.name} <username>#<tagline> OR <login_name>`,
      })
      .setDescription(`**${this.description}**`)
      .setColor('RANDOM')
      .setTitle('Syntax');
    message.channel.send({ embeds: [embed] });
  },
};
