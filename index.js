const { Client, Collection, Intents } = require('discord.js');
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
    
    let logChannel;
    let logging = config.guilds[reaction.message.guild.id].logging;
    if (logging) {
        logChannel = config.guilds[reaction.message.guild.id].logchannel;
        if ( logChannel ) {
            logChannel = await client.channels.fetch(`${logChannel}`).catch(console.error);
        }
    }

    let threadName;
    if (reaction.message.channel.type === 'GUILD_NEWS') {
        threadName = config.guilds[reaction.message.guild.id].newsthreadname;
    } else {
        threadName = config.guilds[reaction.message.guild.id].threadname;
    }

    if (reaction.emoji.name === "🧵" && reaction.count >= config.guilds[reaction.message.guild.id].reactions && reaction.message.thread == null) {
        reaction.message.startThread(threadName, config.guilds[reaction.message.guild.id].archivetime)
            .then(async newThread => {
                await reaction.users.fetch()
                    .then(reacters => reacters.each(user => {
                        newThread.members.add(user);
                    }))
                    .catch(console.error);
                if ( logging ) {
                    await logChannel.send(`Thread ${newThread.id} created from the message "${reaction.message.content.slice(0, 15)}..." in the "#${reaction.message.channel.name}" channel.`).catch(console.error);
                }
            })
            .catch(console.error);
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

    if (message.content.toLowerCase() === '!deploy global' && message.author.id === client.application?.owner.id) {
        const commands = await client.application?.commands.set(data);
        console.log(commands);
    }

    if (message.content.toLowerCase() === '!setup' && ( await message.member.permissions.has('MANAGE_GUILD').then().catch(console.error) )) {
        //sets up config command permissions
        helpers.setConfigPerms(message);

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
            setupComplete = true; 
            console.log('Setup complete');
        } else {
            message.channel.send({ content: 'Something went wrong. Please try again. '})
        }
    }
});

client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand() || !config.guilds[interaction.guild.id]) return;

	if (!client.commands.has(interaction.commandName)) return;

    try {
		await client.commands.get(interaction.commandName).execute(interaction);
        if ( interaction.commandName === 'config' ) {
            config = JSON.parse(fs.readFileSync('./config.json', 'utf-8'));
        }
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}

});

client.login(process.env.TOKEN);