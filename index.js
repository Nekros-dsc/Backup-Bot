const discord = require('discord.js')
const { Client, Intents, MessageEmbed } = require('discord.js');
const backup = require('discord-backup')
const client = new Client({intents: new Intents(32767)})
const config = require('./config.js')
const { token, prefix } = require('./config.js')
client.login(config.token)



client.on('messageCreate', async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    let args = message.content.split(" ").slice(1)

    if (message.content === prefix + "help"){
        message.channel.send({embeds: [new MessageEmbed().setDescription(`**Voici les commandes faisable sur le bot:**\n\n\`${config.prefix}backup-create\` - **Créé la backup d'un serveur**\n\`${config.prefix}backup-info (backup id)\` - **Regarde les informations d'une backup**\n\`${config.prefix}backup-load (backup id)\` - **Charge une backup sur le serveur actuel**\n\`${config.prefix}backup-delete (backup id)\` - **Supprime une backup (action irréversible)**`).setColor("GREEN")]}).catch(() => false)  
    }
    else if (message.content === prefix + "backup-create"){
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply({embeds: [new MessageEmbed().setDescription("**`❌` Vous n'avez pas les permissions requises pour executer cette commande**").setColor("RED")]}).catch(() => false)

        const basemessage = await message.reply({embeds: [new MessageEmbed().setDescription("**`🐍` Création de la backup en cours...**").setColor("GREEN")]}).catch(() => false)

        backup.create(message.guild, {maxMessagesPerChannel: 0, doNotBackup: [ "bans" ]})
            .then(async (backupData) => {
            basemessage.edit({embeds: [new MessageEmbed().setDescription(`**Votre backup a bien été créée avec l'id ** \`${backupData.id}\` **!**\n\n**Voici comment l'utiliser:**\n\`\`\`${config.prefix}backup-info ${backupData.id}\`\`\`\n\`\`\`${config.prefix}backup-load ${backupData.id}\`\`\``).setColor("GREEN")]}).catch(() => false)})
        .catch(() => basemessage.edit("Je n'ai pas pu créé la backup, je n'ai sûrement pas les permissions nécessaire..").catch(() => false))
    }
    else if (message.content.startsWith(prefix + "backup-load")){
        if (args[1]) return;
        if (!message.member.permissions.has("ADMINISTRATOR")) return message.reply({embeds: [new MessageEmbed().setDescription("**`❌` Vous n'avez pas les permissions requises pour executer cette commande**").setColor("RED")]}).catch(() => false)

        const backupip = args[0]
        if (!backupip) return message.reply({embeds: [new MessageEmbed().setDescription("**`❌` Veuillez me fournir une ID de backup valide**").setColor("RED")]}).catch(() => false)

        const slt = await message.reply({embeds: [new MessageEmbed().setDescription("**`🐍` Chargement de la backup en cours...**").setColor("GREEN")]}).catch(() => false)
        backup.load(backupip, message.guild).catch(() => slt.edit({embeds: [new MessageEmbed().setDescription("**`❌` Impossible de charger la backup**").setColor("RED")]}).catch(() => false))
    }
    else if (message.content.startsWith(prefix + "backup-delete")){
        if (args[1]) return;
        backup.remove(args[0])
        .then(() => message.reply({embeds: [new MessageEmbed().setDescription(`**\`🐍\` La backup avec l'id \`${args[0]}\` a été supprimée**`).setColor("GREEN")]}).catch(() => false))
        .catch(() => message.reply({embeds: [new MessageEmbed().setDescription(`**\`❌\` La backup avec l'id \`${args[0] || "rien"}\` n'a pas pu être supprimée**`).setColor("RED")]}).catch(() => false))
    }
    else if (message.content.startsWith(prefix + "backup-info")){
        if (args[1]) return;

        const backupip = args[0]
        if (!backupip) return message.reply({embeds: [new MessageEmbed().setDescription("**`❌` Veuillez me fournir une ID de backup valide**").setColor("RED")]}).catch(() => false)

        const messagebase = await message.reply({embeds: [new MessageEmbed().setDescription("**`🐍` Chargement de la backup en cours...**").setColor("GREEN")]}).catch(() => false)

        backup.fetch(backupip)
        .then((backupInfos) => {
        messagebase.edit({embeds: [new MessageEmbed().setAuthor({name: `${backupInfos.data.name}`, iconURL: `${backupInfos.data.iconURL}`}).setDescription(`**Voici les informations de la backup**\n\n**ID: \`${backupInfos.id}\`**\n**ID du serveur: \`${backupInfos.data.guildID}\`**\n**Taille: \`${backupInfos.size} MB\`**\n**Nom du serveur: \`${backupInfos.data.name}\`**\n**Backup créé le: <t:${Math.round(backupInfos.data.createdTimestamp / 1000)}>**`).setColor("GREEN")]}).catch(() => false)
        })
        .catch(() => messagebase.edit({embeds: [new MessageEmbed().setDescription(`**\`❌\` Aucune backup trouvée avec l'id \`${backupip}\`**`)]}).catch(() => false))
    }
})


client.on('ready', async () => console.log(client.user.tag + " est en ligne"))

 


// Anti Crash
process.on('uncaughtException', (error, origin) => {
  console.log('----- Uncaught exception -----');
  console.log(error);
  console.log('----- Exception origin -----');
  console.log(origin);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log('----- Unhandled Rejection at -----');
  console.log(promise);
  console.log('----- Reason -----');
  console.log(reason);
});

process.on('warning', (name, message, stack) => {
  console.log('----- Warning -----');
  console.log(name);
  console.log('----- Message -----');
  console.log(message);
  console.log('----- Stack -----');
  console.log(stack);
});
