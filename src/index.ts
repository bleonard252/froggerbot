import * as chalk from "chalk";
import { Client, Collection } from "discord.js";
import * as FileHound from 'filehound';
import * as fs from "fs";
import { logDebug, logError, logInfo, logSuccess } from "./utility/logging/consolelogger";
import { failureMessage } from "./utility/statusreply";
import { inspectInteraction } from "./utility/logging/interactions";
import { db } from "./utility/database";

require("dotenv").config();

const client = new Client({
  intents: 0,
  presence: {
    status: "online"
  },
  rest: {
    userAgentAppendix: "Frogger (20220427)"
  }
});

FileHound.create()
  .depth(0)
  .paths("src/commands")
  .ext("ts")
  .find()
  .then((commandFiles) => {
    var commands = new Collection<string, any>();
    for (const file of commandFiles) {
      const command = require("../"+file.replaceAll("\\", "/").replace(".ts", ""));
      // Set a new item in the Collection
      // With the key as the command name and the value as the exported module
      commands.set(command.data.name, command);
    }
    client.on('interactionCreate', async interaction => {
      logDebug(inspectInteraction(interaction));
      if (!interaction.isCommand()) return;
      const command = commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (error) {
        logError(error);
        try {
          await (interaction.replied ? interaction.followUp : interaction.reply)
          ({ content: 'There was an error while executing this command!', ephemeral: true });
        } catch(e) {
          logError(e)
        }
      }
    });
    logInfo("Command handlers ready.");
  });

FileHound.create()
  .depth(1)
  .path("src/components")
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
        try {
          await (interaction.replied ? interaction.followUp : interaction.reply)
          ({ content: 'There was an error while executing this command!', ephemeral: true });
        } catch(e) {
          logError(e)
        }
      }
    });
    logInfo("Component handlers ready.");
  });

  FileHound.create()
  .depth(0)
  .path("src/modals")
  .ext("ts")
  .find()
  .then((componentFiles) => {
    var components = [];
    for (const file of componentFiles) {
      const component = require("../"+file.replaceAll("\\", "/").replace(".ts", ""));
      components.push(component);
    }
    client.on('interactionCreate', async interaction => {
      if (!interaction.isModalSubmit()) return;
      const component = components.find((v) => v.custom_id == interaction.customId || v.custom_id_regex?.test(interaction.customId));
      if (!component) {
        logError(`Custom ID "${chalk.underline(interaction.customId)}" did not match any modals`)
        await interaction.reply({...failureMessage("This modal does not have a submit action associated with it at this time."), ephemeral: true});
        return;
      }
      try {
        await component.execute(interaction);
      } catch (error) {
        logError(error);
        try {
          await interaction.reply({ content: 'There was an error while submitting the modal!', ephemeral: true });
        } catch(e) {
          logError(e)
        }
      }
    });
    logInfo("Modal handlers ready.");
  });

db.connect().then(() => logInfo("Database connected."))
.catch((err) => {
  logError("Could not connect to database!");
  logError(err);
  process.exit(8);
});

client.on("ready", () => logSuccess("Bot started."));

client.login(process.env.TOKEN ?? "");