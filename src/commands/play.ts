import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from "@discordjs/builders";
import * as chalk from "chalk";
import { CommandInteraction } from "discord.js";
import { logError } from "../utility/consolelogger";
import { failureMessage, successMessage } from "../utility/statusreply";
import { setup } from "./play/tictactoe";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("play")
  .setDescription("Play a game!")
  .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("tictactoe")
    .setDescription("The classic game of noughts-and-crosses.")
  ),
  execute(ctx: CommandInteraction) {
    switch (ctx.options.getSubcommand(true)) {
      case "tictactoe":
        // logError(`Subcommand handling error: /play ${chalk.underline(ctx.options.getSubcommand(true))} handler not set up`);
        // return ctx.reply({...successMessage("Playing tic-tac-toe... soon..."), ephemeral: true});
        setup(ctx);
        break;
      default:
        logError(`Subcommand handling error: /play ${chalk.underline(ctx.options.getSubcommand(true))} not handled`);
        return ctx.reply({...failureMessage("Subcommand not handled!"), ephemeral: true});
    }
  }
}