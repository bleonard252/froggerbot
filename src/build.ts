import * as fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { logError, logSuccess } from './utility/logging/consolelogger';
import { Collection } from 'discord.js';
//import { clientId, guildId, token } from '../config.json';

require("dotenv").config();

const globalCommands = [];
const guildCommands = new Collection<string, Array<any>>();
const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	if (command.guild) guildCommands.set(command.guild, [
		...guildCommands.get(command.guild),
		{...command.data.toJSON(), ...(command.extra || {})}
	]);
	else globalCommands.push({...command.data.toJSON(), ...(command.extra || {})});
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? "");

rest.put(process.env.GUILD_ID 
  ? Routes.applicationGuildCommands(process.env.CLIENT_ID ?? "", process.env.GUILD_ID) 
  : Routes.applicationCommands(process.env.CLIENT_ID ?? ""),
  { body: globalCommands })
	.then(() => logSuccess('Successfully registered commands.'))
	.catch(logError);
for (const guild in guildCommands) {
	rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID ?? "", guild),
		{ body: guildCommands.get(guild) })
		.then(() => logSuccess(`Successfully registered commands for guild ID ${guild}.`))
		.catch(logError);
}