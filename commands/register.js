/**
 * @author lemn
 * @year 2021
 */

module.exports = {
  name: 'command template',
  description: 'a description for your command',
  execute(client, message, args) {
    // write your logic here
  },
  syntax(message) {
    // syntax command
    const embed = new MessageEmbed()
      .addFields({
        name: 'Usage',
        value: `${prefix}${this.name} `,
      })
      .setDescription(`**${this.description}**`)
      .setColor(getTemocColor());
    message.channel.send(embed).then((msg) => {
      setTimeout(() => msg.delete(), 10000);
    });
  },
};
