const { MessageEmbed } = require('discord.js');

module.exports = {
    name: 'info',
    description: 'Provides information about the bot.',
    async execute(interaction) {
        
        const infoEmbed = new MessageEmbed()
            .setTitle('Bot information')
            .setColor('#513486')
            .setAuthor('ThreadBot', 'https://cdn.discordapp.com/avatars/780452775070662686/5afd92e587f0daaa379ae35fb8691f1f.webp?size=256')
            .setFooter("ThreadBot created by domino#3355")
            .setImage('https://cdn.discordapp.com/avatars/780452775070662686/5afd92e587f0daaa379ae35fb8691f1f.webp?size=256')
            .setTimestamp()
            .setDescription('ThreadBot is a discord bot meant allow for threads to be created based on the number of 🧵 reactions on a message.')
            .addField('Commands:', '/name : Sets the name of a thread. This command can only be used by thread creators, and only withing the first 50 messages in a thread.', true)
            .addField('Config:', '/config basic : Sets basic configuration options for the bot.\n/config logging : Sets logging config for the bot. The bot can log related events to a channel. For this to work, "logging" needs to be set to true, and a "logchannel" needs to be set.', true)
            .addField('Icon licensing: ', `Copyright 2020 Twitter, Inc and other contributors
            Code licensed under the MIT License: http://opensource.org/licenses/MIT
            Graphics licensed under CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/`);

        await interaction.reply({ embeds: [infoEmbed] });
    }
};