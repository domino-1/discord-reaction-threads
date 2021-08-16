const { Client, Collection, Intents, MessageFlags, MessageButton, MessageActionRow } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const ThreadBotHelpers = require('./ThreadBotHelpers');
dotenv.config();

let config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
let helpers = new ThreadBotHelpers();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    partials: ['MESSAGE', 'REACTION']
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// set a new item in the Collection
	// with the key as the command name and the value as the exported module
	client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
});

client.on('messageReactionAdd', async (reaction, user) => {
    if (!config.guilds[reaction.message.guild.id]) return;

    // When a reaction is received, check if the structure is partial
    if (reaction.partial) {
        // If the message this reaction belongs to was removed, the fetching might result in an API error which should be handled
        try {
            await reaction.fetch();
        } catch (error) {
            console.error('Something went wrong when fetching the message: ', error);
            // Return as `reaction.message.author` may be undefined/null
            return;
        }
    }
    
    if (reaction.message.channel.isThread()) return;
    
    let logChannel;
    let logging = config.guilds[reaction.message.guild.id].logging;
    if (logging) {
        logChannel = config.guilds[reaction.message.guild.id].logchannel;
        if ( logChannel ) {
            logChannel = await client.channels.fetch(`${logChannel}`).catch(console.error);
        }
    }

    let threadName = "thread";
    if (reaction.message.channel.type === 'GUILD_NEWS') {
        threadName = config.guilds[reaction.message.guild.id].newsthreadname;
    } else {
        threadName = config.guilds[reaction.message.guild.id].threadname;
    }

    if (reaction.emoji.name === "🧵" && reaction.count >= config.guilds[reaction.message.guild.id].reactions && !reaction.message.hasThread) {
        reaction.message.startThread({name: `${threadName}`, autoArchiveDuration: config.guilds[reaction.message.guild.id].archivetime })
            .then(async newThread => {
                await reaction.users.fetch()
                    .then(reacters => reacters.each(user => {
                        newThread.members.add(user);
                    }))
                    .catch(console.error);
                if ( logChannel && logging ) {
                    await logChannel.send(`Thread ${newThread.id} created from the message "${reaction.message.content.slice(0, 15)}..." in the "#${reaction.message.channel.name}" channel.`).catch(console.error);
                }
            })
            .catch(console.error);
    } else if (reaction.emoji.name === "🧵" && reaction.message.hasThread && !reaction.message.thread.locked) {
        if (reaction.message.thread.archived) {
            await reaction.message.thread.setArchived(false).catch(console.error);
        }    
        reaction.message.thread.members.add(user);
    }
    
});

client.on('messageCreate', async message => {
    if (!message.content.startsWith(config.prefix) || message.author.bot || !message.guild.available ) return;


    if (!client.application?.owner) await client.application?.fetch();

    const data = [
        {
            name: 'name',
            description: 'Renames a thread.',
            options: [{
                name: 'input',
                type: 'STRING',
                description: 'The new name of the thread',
                required: true
            }]
        },
        {
            name: 'info',
            description: 'Provides information about the bot.'
        },
        {
            name: 'setup',
            description: 'Initial bot setup'
        },
        {
            name: 'lthread',
            description: 'Sets up a semi-permanent "lingering" thread trough a pinned embed.',
            defaultPermission: false,
            options: [
                {
                    name: 'create',
                    description: 'Creates a Lingering Thread embed message, and pins it.',
                    type: 'SUB_COMMAND',
                    options: [
                        {
                            name: 'name',
                            type: 'STRING',
                            description: 'The thread\'s name',
                            required: true
                        },
                        {
                            name: 'description',
                            type: 'STRING',
                            description: 'Describes the thread. (optional)',
                            required: false
                        }
                    ]
                },
                {
                    name: 'edit',
                    description: 'Edits an existing Lingering Thread\'s embed message.',
                    type: 'SUB_COMMAND',
                    options: [
                        {
                            name: 'thread',
                            type: 'CHANNEL',
                            description: 'The lingering thread to edit. You do not need this if the command is executed inside an lthread.',
                            required: false
                        },
                        {
                            name: 'name',
                            type: 'STRING',
                            description: 'The thread\'s new name.',
                            required: false
                        },
                        {
                            name: 'description',
                            type: 'STRING',
                            description: 'The thread\'s new description.',
                            required: false
                        }
                    ]
                }
            ]
        },
        {
            name: 'config',
            description: 'Configures bot functions.', 
            defaultPermission: false,
            options: [
                {
                    name: 'basic',
                    description: 'Basic configuration options.',
                    type: 'SUB_COMMAND',
                    options: [
                        {
                            name: 'reactions',
                            type: 'INTEGER',
                            description: 'The number of people required to react on a message to create a thread.',
                            required: false
                        },
                        {
                            name: 'threadname',
                            type: 'STRING',
                            required: false,
                            description: 'The name used when creating new threads.'
                        },
                        {
                            name: 'newsthreadname',
                            type: 'STRING',
                            required: false,
                            description: 'The name used when creating new threads from news channels.'
                        },
                        {
                            name: 'restrictnews',
                            type: 'BOOLEAN',
                            required: false,
                            description: 'Sets whether to allow use of the /name command in threads created from news channels.'
                        },
                        {
                            name: 'archivetime',
                            type: 'INTEGER',
                            description: 'The automatic archival time for threads the bot creates.',
                            choices: [
                                {
                                    name: 'hour',
                                    value: 60
                                },
                                {
                                    name: 'day',
                                    value: 1440
                                }
                            ],
                            required: false
                        }
                    ]
                },
                {
                    name: 'logging',
                    description: 'Config options for logging.',
                    type: 'SUB_COMMAND',
                    options: [
                        {
                            name: 'logging',
                            type: 'BOOLEAN',
                            description: 'Set to true to enable the bot\'s logging capabilities. Requires setting a logchannel to work.',
                            required: false
                        },
                        {
                            name: 'logchannel',
                            type: 'CHANNEL',
                            description: 'Set a channel for the bot to send log messages to. Expects a channel ID.',
                            required: false
                        }
                    ]
                }
            ]
        }];
    
    if (message.content.toLowerCase() === '!deploy guild' && message.author.id === client.application?.owner.id) {
        const command = await client.guilds.cache.get(`${message.guild.id}`)?.commands.set(data)
                                .catch(console.error);
        console.log(command);
    }

    if (message.content.toLowerCase() === '!unregister guild' && message.author.id === client.application?.owner.id) {
        (await message.guild.commands.fetch()).each(cmd => /*console.log(cmd)*/message.channel.guild.commands.delete(cmd.id));
    }

    if (message.content.toLowerCase() === '!deploy global' && message.author.id === client.application?.owner.id) {
        const commands = await client.application?.commands.set(data);
        console.log(commands);
    }

    /*if (message.content.toLowerCase() === '!setup' && ( await message.member.permissions.has('MANAGE_GUILD') )) {
        //sets up config command permissions
        await helpers.setCommandPerms(message, 'config', 'MANAGE_GUILD');
        await helpers.setCommandPerms(message, 'lthread', 'MANAGE_GUILD');

        //sets up config.json file with some defaults 
        if (!config.guilds[message.guild.id]) {
            config.guilds[message.guild.id] = {
                "reactions": 3,
                "archivetime": 60,
                "logging": false,
                "threadname": "New thread",
                "threadnameNews": "Announcement thread",
                "restrictNews": true
            };

            fs.writeFileSync('./config.json', JSON.stringify(config, null, 2));
        }
        if (config.guilds[message.guild.id]) { 
            message.channel.send({ content: 'Setup complete.'});
            console.log('Setup complete');
        } else {
            message.channel.send({ content: 'Something went wrong. Please try again. '})
        }
    }*/
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isButton()) return;
	if (!interaction.customId === 'lingering_thread_join') return;
    if (!interaction.message.hasThread) {
        await interaction.message.unpin().catch(console.error);
        await interaction.update({ content: '⚠️ This thread was deleted ⚠️', components: [] }).catch(console.error);
        return;
    }

    if (!interaction.message.thread.locked) {
        if (!(await interaction.message.thread.members.fetch().catch(console.error)).has(interaction.user.id)) {
            if (interaction.message.thread.archived) {
                await interaction.message.thread.setArchived(false).catch(console.error);
            }
            interaction.message.thread.members.add(interaction.user);
            await interaction.reply({content: `You joined the ${interaction.message.thread.name} thread.`, ephemeral: true});
        } else { 
            interaction.update({}).catch(console.error); 
        }
    } else { 
        await interaction.reply({ content: 'Cannot join locked threads.', ephemeral: true}).catch(console.error);
    }
});

client.on('threadUpdate', async (oldThread, newThread) => {
    if (!(await helpers.isLingeringThread(oldThread))) return;

    let parentMessage = await oldThread.parent.messages.fetch(oldThread.id);
    const lthreadJoinButton = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('lingering_thread_join')
                    .setLabel('Join thread')
                    .setStyle('SUCCESS')
                    .setEmoji('🧵')
                    
            );
    if ( oldThread.locked && !newThread.locked ) {
        if (!parentMessage.pinned) {
            await parentMessage.pin().catch(console.error);
        }
        lthreadJoinButton.components[0].setDisabled(false);
        await parentMessage.edit({ components: [lthreadJoinButton]});
        await parentMessage.edit(' ').catch(console.error);
    } else if ( !oldThread.locked && newThread.locked ) {
        if (parentMessage.pinned) {
            await parentMessage.unpin().catch(console.error);
        }
        await parentMessage.edit('🔒 This thread is locked 🔒').catch(console.error);
        lthreadJoinButton.components[0].setDisabled(true);
        await parentMessage.edit({ components: [lthreadJoinButton]});
    }

})

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() || !config.guilds[interaction.guild.id]) return;

	if (!client.commands.has(interaction.commandName)) return;

    try {
		await client.commands.get(interaction.commandName).execute(interaction);
        if ( interaction.commandName === 'config' || interaction.commandName === 'setup' ) {
            config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        }
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

client.login(process.env.TOKEN);