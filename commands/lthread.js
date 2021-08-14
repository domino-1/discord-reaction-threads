const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'lthread',
    description: 'Creates a Lingering Thread embed message, and pins it.',
    async execute(interaction) {
        if (interaction.channel.isThread() == true) {
            interaction.reply({ content: 'You cannot use this inside a thread!', ephemeral: true })
            return;
        }
        
        const ThreadBotHelpers = require('../ThreadBotHelpers');
        let helpers = new ThreadBotHelpers();
        helpers.setCommandPerms(interaction, 'lthread', 'MANAGE_GUILD');
        
        if (await interaction.options.getSubcommand(false) === 'create') {
            const lthreadName = await interaction.options.getString('name');
            const lthreadDescription = await interaction.options.getString('description');
            const lthreadEmbed = new MessageEmbed()
                .setTitle(`Lingering Thread: ${lthreadName}`)
                .setColor('#513486')
                .setFooter("Click the to join the thread!")
                .setTimestamp()
                
            if (lthreadDescription) {
                lthreadEmbed.setDescription(`${lthreadDescription}`);
            }

            const lthreadJoinButton = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('lingering_thread_join')
                        .setLabel('Join thread')
                        .setStyle('SUCCESS')
                        .setEmoji('🧵')
                );
            await interaction.reply({ embeds: [lthreadEmbed], components: [lthreadJoinButton] });
            await interaction.fetchReply()
                .then(async reply => {
                    reply.pin().catch(console.error);
                    await reply.startThread({ name: `⭐ ${lthreadName}`, autoArchiveDuration: 'MAX', reason: `Created lingering thread '${lthreadName}'`})
                        .catch(console.error);
                })
                .catch(console.error);
        }
    }
};