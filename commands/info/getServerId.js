const { successEmbed } = require('../../utils/presetEmbeds');

module.exports = {
  name: 'serverid', // Command name (what's gonna be used to call the command)
  aliases: [], // Command aliases

  execute(client, message) {
    const embed = successEmbed(`bye`);
    message.channel.send({ embeds: [embed] }).then((msg) => {
      msg.edit({ embeds: [successEmbed('hi')] });
    });
  },
};
