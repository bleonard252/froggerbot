import * as fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { logError, logSuccess } from './utility/logging/consolelogger';
//import { clientId, guildId, token } from '../config.json';

require("dotenv").config();

const commands = [];
const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.ts'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN ?? "");

rest.put(process.env.GUILD_ID 
  ? Routes.applicationGuildCommands(process.env.CLIENT_ID ?? "", process.env.GUILD_ID) 
  : Routes.applicationCommands(process.env.CLIENT_ID ?? ""),
  { body: commands })
	.then(() => logSuccess('Successfully registered commands.'))
	.catch(logError);
