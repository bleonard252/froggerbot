import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import * as chalk from "chalk";
import { Collection, CommandInteraction } from "discord.js";
import { logError } from "../utility/logging/consolelogger";
import { failureMessage, successMessage } from "../utility/statusreply";
import { handleSubcommands } from "../utility/subcommands";
import { setup } from "./play/tictactoe";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a game!")
  .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("tictactoe")
    .setDescription("The classic game of noughts-and-crosses.")
  ),
  execute: handleSubcommands(new Collection([
    ["tictactoe", (ctx) => {setup(ctx)}]
  ]))
}