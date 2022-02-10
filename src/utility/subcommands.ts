import * as chalk from "chalk";
import { Collection, CommandInteraction } from "discord.js";
import { logError } from "./logging/consolelogger";
import { failureMessage } from "./statusreply";

export function handleSubcommands(subcommandHandlers: Collection<string, (ctx: CommandInteraction) => void>) {
  return (ctx: CommandInteraction) => {
    var subcommand = subcommandHandlers.get(ctx.options.getSubcommand(true));
    if (!subcommand) {
      logError(`Subcommand handling error: /${ctx.commandName} ${chalk.underline(ctx.options.getSubcommand(true))} not handled`);
      return ctx.reply({...failureMessage("Subcommand not handled!"), ephemeral: true});
    }
    subcommand(ctx);
  }
}