const fs = require('fs');

module.exports = {
    name: 'name',
    description: 'Renames a thread.',
    async execute(interaction) {
        const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        const allArgs = await interaction.options.getString('input');

        async function getThreadOwners(outputArray, inputInter) {
            let threadID = inputInter.channel.id;
        
            await inputInter.channel.parent.messages.fetch(threadID)
                .then(async msg => {
                    let threadEmoji = msg.reactions.cache.get("🧵");
        
                    await threadEmoji.users.fetch()
                        .then(reacters => reacters.each(user => {
                            outputArray.push(user);
                        }))
                        .catch(console.error);
        
                    return outputArray;
                })
                .catch(console.error);
        }

        if (config.guilds[interaction.guild.id].restrictnews && interaction.channel.parent.type === 'GUILD_NEWS') {
            await interaction.reply({ content: "The /name command cannot be used in this thread.", ephemeral: true});
            return;
        }

        let logChannel;
        let logging = config.guilds[interaction.guild.id].logging;
        if (logging) {
            logChannel = config.guilds[interaction.guild.id].logchannel;
            if ( logChannel ) {
                logChannel = await interaction.client.channels.fetch(`${logChannel}`).catch(console.error);
            }
        }

        if (interaction.channel.isThread() && interaction.channel.messageCount < 50) {
            await interaction.defer();
            
            let oldThreadName = interaction.channel.name;
            let threadOwners = [];
            await getThreadOwners(threadOwners, interaction);

            if (threadOwners.includes(interaction.user)) {
                interaction.channel.setName(`${allArgs}`)
                    .then(newThread => { 
                        interaction.editReply({ content: `Thread name changed.`})
                            .then(msg => console.log(`Sent message: "${msg.content}"`))
                            .catch(console.error);
                        if ( logChannel ) {
                            logChannel.send(`Thread '${newThread.id}' name changed from "${oldThreadName}" to "${newThread.name}" by <@${interaction.user.id}>.`); 
                        }
                    })
                    .catch(console.error);
            } else {
                interaction.editReply({ content: 'You do not have permission to change the thread\'s name. Contact one of the thread\'s creators.', ephemeral: true })
                    .then(msg => console.log(`Sent message: "${msg.content}"`))
                    .catch(console.error);
            }
        } else {
            if (interaction.channel.isThread()) {
                interaction.reply({ content: 'You may only change the thread\'s name within the first 50 messages.', ephemeral: true })
                    .then(msg => console.log(`Sent message: "${msg.content}"`))
                    .catch(console.error);
            } else {
                interaction.reply({ content: 'The "/name" command can only be used in a thread.'})
                    .then(msg => console.log(`Sent message: "${msg.content}"`))
                    .catch(console.error);
            }
        }
	}
};