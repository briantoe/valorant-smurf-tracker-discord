const { MessageEmbed } = require('discord.js');

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
        'This is an example bot made by pusheen. Feel free to use me as you please.' +
          "\n*Here's some sample text for this info message.*"
      )
      .setFooter('Discord Example Bot', client.user.displayAvatarURL);
    console.log(embed);
    message.channel.send({embeds: [embed]});
  },
};
