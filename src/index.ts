import * as chalk from "chalk";
import { Client, Collection } from "discord.js";
import * as FileHound from 'filehound';
import * as fs from "fs";
import { logError, logInfo, logSuccess } from "./utility/consolelogger";
import { failureMessage } from "./utility/statusreply";

require("dotenv").config();

const client = new Client({
  intents: 0,
  presence: {
    status: "online"
  },
  userAgentSuffix: ["Frogger (20220209)"]
});

var commands = new Collection<string, any>();
const commandFiles = fs.readdirSync('src/commands').filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	commands.set(command.data.name, command);
}
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
	const command = commands.get(interaction.commandName);
	if (!command) return;
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
logInfo("Command handlers ready.");

FileHound.create()
  .paths(
    "src/components",
    "src/components/*"
  )
  .ext("ts")
  .find()
  .then((componentFiles) => {
    var components = [];
    for (const file of componentFiles) {
      const component = require("../"+file.replaceAll("\\", "/").replace(".ts", ""));
      components.push(component);
    }
    client.on('interactionCreate', async interaction => {
      if (!interaction.isMessageComponent()) return;
      const component = components.find((v) => v.custom_id == interaction.customId || v.custom_id_regex?.test(interaction.customId));
      if (!component) {
        logError(`Custom ID "${chalk.underline(interaction.customId)}" did not match any components`)
        await interaction.reply({...failureMessage("This component does not have an action associated with it at this time."), ephemeral: true});
        return;
      }
      try {
        await component.execute(interaction);
      } catch (error) {
        logError(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
      }
    });
    logInfo("Component handlers ready.");
  });

client.on("ready", () => logSuccess("Bot started."));

client.login(process.env.TOKEN ?? "");