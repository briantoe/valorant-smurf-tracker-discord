const { MessageEmbed } = require('discord.js');

module.exports = {
  successEmbed(message) {
    const embed = new MessageEmbed()
      .addFields({
        name: 'Success',
        value: message,
      })
      .setColor('RANDOM');
    return embed;
  },
  errorEmbed(message) {
    const embed = new MessageEmbed()
      .addFields({
        name: 'Error',
        value: message,
      })
      .setColor('RANDOM');
    return embed;
  },
};
