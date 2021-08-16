module.exports = {
    name: 'setup',
    description: 'Initial setup for the bot',
    async execute(interaction) {
        const fs = require('fs');
        const ThreadBotHelpers = require('../ThreadBotHelpers');
        const helpers = new ThreadBotHelpers();
        let config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        helpers.setCommandPerms(interaction, 'setup', 'MANAGE_GUILD');

        //sets up config command permissions
        await helpers.setCommandPerms(interaction, 'config', 'MANAGE_GUILD');
        await helpers.setCommandPerms(interaction, 'lthread', 'MANAGE_GUILD');

        //sets up config.json file with some defaults 
        if (!config.guilds[interaction.guild.id]) {
            config.guilds[interaction.guild.id] = {
                "reactions": 3,
                "archivetime": 60,
                "logging": false,
                "threadname": "New thread",
                "threadnameNews": "Announcement thread",
                "restrictNews": true
            };

            fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        }
        if (config.guilds[interaction.guild.id]) { 
            interaction.reply({ content: 'Setup complete.'});
            console.log('Setup complete');
        } else {
            interaction.reply({ content: 'Something went wrong. Please try again. '})
        }
    }
}