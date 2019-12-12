// Initialize discord instance
const Discord = require('discord.js');

// Create discord client
const client = new Discord.Client({
	disableEveryone: false,
	disabledEvents: []
});

// Load config, where discord token is stored
const config = require('./config.json');

// Load exit hook lib to logout when exitting process
const exitHook = require('async-exit-hook');

// Create variable of PonK guild
let guild;

// Same for limbo message & settings message
let limboMessage;
let settingsMessage;

exitHook(() => {
    console.log('Calling exit hook');
    client.destroy();
    console.log('Called exit hook');
});

client.on('ready', () => {
    guild = client.guilds.first();

    console.log(`Logged in as ${client.user.tag}, serving ${client.users.size} users in guild ${guild.id}`);

    let limboChannel = client.channels.get('608096219998453790');
    let settingsChannel = client.channels.get('608108979507167293');

    limboChannel.fetchMessages({limit: 1}).then(messages => {
        if (messages.size > 0)
            messages.first().delete();
    });


    settingsChannel.fetchMessages({limit: 1}).then(messages => {
        if (messages.size > 0)
            messages.first().delete();
    });

    limboChannel.send({embed:{
        "description": "Salut, si t'es ici, c'est pas normal. Mets la réaction ci-dessous pour **essayer** de corriger le problème. Si ce \"c'est pas normal\" persiste, je t'invite à contacter un membre de l'administration de ce magnifique Discord.",
        "color": 14302994
    }}).then(message => {
        limboMessage = message;

        message.react('😅');
    });

    settingsChannel.send({embed:{
        "description": "Utilisez les réactions ci-dessous afin de gérer vos besoins de notifications quotidiennes (ou presque) !\n\nCi-dessous des expliquations courtes de qui fait quoi :\n\n🎬 » Permet de recevoir/ne plus recevoir les notifications des nouvelles vidéos.\n📹 » Permet de recevoir/ne plus recevoir les notifications des streams",
        "color": 15499520
    }}).then(message => {
        settingsMessage = message;

        message.react('🎬');
        message.react('📹');
    });

    client.user.setActivity('Toujours la patate');
});

// Limbo
client.on('messageReactionAdd', (reaction, user) => {
    if (!limboMessage || reaction.message.id !== limboMessage.id || user.bot)
        return;

    guild.fetchMember(user).then(member => {
        member.addRole('493511255114383361', 'Added reaction to limbo channel.');
    });

    reaction.remove(user);
});

// Settings
client.on('messageReactionAdd', (reaction, user) => {
    if (!settingsMessage || reaction.message.id !== settingsMessage.id || user.bot)
        return;

    if (reaction.emoji.name === '🎬') {
        guild.fetchMember(user).then(member => {
            if (!member.roles.has('608110004771225620'))
                member.addRole('608110004771225620', 'Added reaction to settings channel.').then(unused => reaction.remove(member));
            else
                member.removeRole('608110004771225620', 'Added reaction to settings channel.').then(unused => reaction.remove(member));
        });
    } else if (reaction.emoji.name === '📹') {
        guild.fetchMember(user).then(member => {
            if (!member.roles.has('608109922546089984'))
                member.addRole('608109922546089984', 'Added reaction to settings channel.').then(unused => reaction.remove(member));
            else
                member.removeRole('608109922546089984', 'Added reaction to settings channel.').then(unused => reaction.remove(member));
        });
    }
});

// On-join rank add
client.on("guildMemberAdd", member => {
    member.addRole('608110004771225620', 'Joined the discord server');
    member.addRole('608109922546089984', 'Joined the discord server');
});

client.login(config.token);