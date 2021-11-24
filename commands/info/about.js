const { MessageEmbed } = require('discord.js');
const { prefix } = require('../../config.json');

module.exports = {
  name: 'about', // Command name (what's gonna be used to call the command)
  description: 'about, duh',
  aliases: ['info'], // Command aliases

  execute(client, message) {
    // Construct info embed
    const embed = new MessageEmbed()
      .setTitle('About')
      .setColor('RANDOM')
      .setDescription(
        `Hi, I'm Killjoy, I can keep track of your smurf accounts. Try using \`${prefix}help\` to learn more about what I can do.`
      )
      .setFooter('Auf Wiedersehen! ~ Killjoy', client.user.displayAvatarURL());
    message.channel.send({ embeds: [embed] });
  },
};
