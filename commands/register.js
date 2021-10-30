/**
 * @author briantoe
 * @year 2021
 */
const { Client } = require('pg');
const dotenv = require('dotenv');

module.exports = {
  name: 'register',
  description: 'Register an account with the bot and makes the account trackable.',
  execute(client, message, args) {
    // write your logic here
    
  },
  syntax(message) {
    // syntax command
    const embed = new MessageEmbed()
      .addFields({
        name: 'Usage',
        value: `${prefix}${this.name} <username>#<tagline>`,
      })
      .setDescription(`**${this.description}**`)
      .setColor(getTemocColor());
    message.channel.send(embed).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  },
};
