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
            .addField('Commands:', `\n/name - Sets the name of a thread. This command can only be used by thread creators, and only withing the first 50 messages in a thread.
            \n/setup - Initial bot setup command. This must be performed for the bot to work.
            \n/info - General information and bot commands.
            \n/config basic - Bot configuration options
            * reactions - The number of reactions needed to open a thread
            * threadname - The default name for threads the bot opens
            * archivetime - The default archive time for threads the bot opens
            * newsthreadname - The default name for threads the bot opens from NEWS type channels (usually #announcements and the like)
            * restrictnews - The option to disabled thread creation via reactions in NEWS channels
            /config logging - Bot logging options
            * logging - The option to turn logging on and off
            * logchannel - A logchannel for the bot to send logging messages to 
            Logging needs to be set to true, AND a logchannel needs to be specified for it to work!
            \n/lthread create - Creates a Lingering Thread
            * name - The thread's name
            * description - The descriptiont text in the embed message
            /lthread edit - Edits an existing Lingering Thread (message and thread)
            * thread - The Lingering Thread to edit. This does not need to be set if the command is done inside an lthread.
            * name - The Lingering Thread's new name.
            * description - The Lingering Thread's new description.`, true)
            .addField('Icon licensing: ', `Copyright 2020 Twitter, Inc and other contributors
            Code licensed under the MIT License: http://opensource.org/licenses/MIT
            Graphics licensed under CC-BY 4.0: https://creativecommons.org/licenses/by/4.0/`);

        await interaction.reply({ embeds: [infoEmbed] });
    }
};