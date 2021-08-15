const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');

module.exports = {
    name: 'lthread',
    description: 'Creates a Lingering Thread embed message, and pins it.',
    async execute(interaction) {
        const ThreadBotHelpers = require('../ThreadBotHelpers');
        let helpers = new ThreadBotHelpers();
        helpers.setCommandPerms(interaction, 'lthread', 'MANAGE_GUILD');
        
        if (await interaction.options.getSubcommand(false) === 'create') {
            if (interaction.channel.isThread()) {
                interaction.reply({ content: 'You cannot use this inside a thread!', ephemeral: true })
                return;
            }
            
            const lthreadName = await interaction.options.getString('name');
            const lthreadDescription = await interaction.options.getString('description');
            const lthreadEmbed = new MessageEmbed()
                .setTitle(`Lingering Thread: ${lthreadName}`)
                .setColor('#513486')
                .setFooter("Click the button to join the thread!")
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
        } else if (await interaction.options.getSubcommand(false) === 'edit') {
            if (interaction.channel.isThread() && !(await helpers.isLingeringThread(interaction.channel))) {
                interaction.reply({ content: 'If you are not in a Lingering Thread, you must specify a target thread in the command!', ephemeral: true});
                return;
            }

            if (interaction.channel.isThread() && await helpers.isLingeringThread(interaction.channel)) {
                const parentMessage = await interaction.channel.parent.messages.fetch(interaction.channel.id);
                newName = await interaction.options.getString('name');
                newDescription = await interaction.options.getString('description');
                const newEmbed = new MessageEmbed()
                    .setColor('#513486')
                    .setFooter("Click the button to join the thread!")
                    .setTimestamp()
            
                if (newDescription && newName) {
                    newEmbed.setDescription(`${newDescription}`);

                    newEmbed.setTitle(`Lingering Thread: ${newName}`);

                    if( interaction.channel.name !== newName ) {
                        interaction.channel.setName(`⭐ ${newName}`).catch(console.error);
                    }
                } else if (newDescription) {
                    newEmbed.setDescription(`${newDescription}`);
                    newEmbed.setTitle(`Lingering Thread: ${interaction.channel.name}`);
                } else if (newName) {
                    newEmbed.setTitle(`Lingering Thread: ${newName}`);

                    if( interaction.channel.name !== newName ) {
                        interaction.channel.setName(`⭐ ${newName}`).catch(console.error);
                    }

                    newEmbed.setDescription(`${parentMessage.embeds[0].description}`);
                }

                parentMessage.edit({ embeds: [newEmbed] });

                interaction.reply({ content: 'Edit succesfull', ephemeral: true});
            } else {
                targetLthread = await interaction.options.getChannel('thread');
                if (await helpers.isLingeringThread(targetLthread)) {
                    const parentMessage = await targetLthread.parent.messages.fetch(targetLthread.id);
                    newName = await interaction.options.getString('name');
                    newDescription = await interaction.options.getString('description');
                    const newEmbed = new MessageEmbed()
                        .setColor('#513486')
                        .setFooter("Click the button to join the thread!")
                        .setTimestamp()
            
                    if (newDescription && newName) {
                        newEmbed.setDescription(`${newDescription}`);
    
                        newEmbed.setTitle(`Lingering Thread: ${newName}`);
    
                        if( targetLthread.name !== newName ) {
                            targetLthread.setName(`⭐ ${newName}`).catch(console.error);
                        }
                    } else if (newDescription) {
                        newEmbed.setDescription(`${newDescription}`);
                        newEmbed.setTitle(`Lingering Thread: ${targetLthread.name}`);
                    } else if (newName) {
                        newEmbed.setTitle(`Lingering Thread: ${newName}`);
    
                        if( targetLthread.name !== newName ) {
                            targetLthread.setName(`⭐ ${newName}`).catch(console.error);
                        }
    
                        newEmbed.setDescription(`${parentMessage.embeds[0].description}`);
                    }
                    parentMessage.edit({ embeds: [newEmbed] });
                    
                    interaction.reply({ content: 'Edit succesfull', ephemeral: true});
                } else {
                    interaction.reply({ content: 'Edit failed: Please sepecify a Lingering Thread!', ephemeral: true});
                }
            }
        }
    }
};