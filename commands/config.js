const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'config',
    description: 'Configures bot functions.',
    async execute(interaction) {
        const fs = require('fs');
        const config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        const ThreadBotHelpers = require('../ThreadBotHelpers');
        let helpers = new ThreadBotHelpers();

        await helpers.setCommandPerms(interaction, 'config', 'MANAGE_GUILD');

        const guildId = `${interaction.guild.id}`;

        let guildConfig = config.guilds[guildId];

        const replyEmbed = new MessageEmbed()
            .setColor('#90ee90')
            .setTimestamp()
            .setAuthor('ThreadBot', 'https://cdn.discordapp.com/avatars/780452775070662686/5afd92e587f0daaa379ae35fb8691f1f.webp?size=256')
            .setFooter("ThreadBot created by domino#3355");

        if (!interaction.options.data[0].options) {
            currentConfigString = "";
            for (let [key, value] of Object.entries(guildConfig)) {
                replyEmbed.addField(`${key}`, `${value}`, true);
            }
            replyEmbed.setTitle('Current bot config:')
            await interaction.reply({ embeds: [replyEmbed] });
        } else { 
            await interaction.options.data[0].options.forEach(async elem => {
                let option = elem.value; 
                if (option != guildConfig[elem.name]) {
                    replyEmbed.setTitle('Bot config updated:')
                    replyEmbed.addField('- old value:', `${elem.name}: ${guildConfig[elem.name]}`);
                    replyEmbed.addField('+ new value:', `${elem.name}: ${option}`);
                    guildConfig[elem.name] = option;
                } else {
                    replyEmbed.setTitle('No bot config change')
                    replyEmbed.setDescription('No config options were changed because the current and new config option(s) specified were the same.')
                }
            })
            
            
            await interaction.reply({ embeds: [replyEmbed] }); 
        }
        
        let data = JSON.stringify(config, null, 2);
        fs.writeFileSync('./config.json', data);
    }
};