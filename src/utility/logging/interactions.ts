import * as chalk from "chalk";
import { Interaction } from "discord.js";

export function inspectInteraction(interaction: Interaction) {
  var out: Array<string> = [];
  out.push(chalk.bold.underline`Interaction`);
  if (interaction.isCommand()) {
    out.push(chalk`{bold Type:} Slash Command`);
    out.push(chalk`{bold Command:} /${interaction.commandName}`);
    if (interaction.guild) out.push(chalk`{bold Server:} ${interaction.client.guilds.resolve(interaction.guildId).name || ""} {dim (${interaction.guildId})}`);
    else if (interaction.user) out.push(chalk`{bold DM from:} ${interaction.user?.username}{dim #${interaction.user.discriminator} (${interaction.user.id})}`);
    if (interaction.options.getSubcommand(false)) out.push(chalk`{bold Subcommand:} ${interaction.options.getSubcommand()}`);
  } else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
    if (interaction.isButton()) out.push(chalk`{bold Type:} Button`);
    else if (interaction.isSelectMenu()) out.push(chalk`{bold Type:} Select Menu`);
    else if (interaction.isModalSubmit()) out.push(chalk`{bold Type:} Modal Submit`);
    else out.push(chalk`{bold Type:} Unknown component`);
    
    // All components
    out.push(chalk`{bold Custom ID:} ${interaction.customId}`);
    
    // Specific components
    if (interaction.isSelectMenu()) {
      out.push(chalk`{bold Selected values:} ${interaction.values.join(", ")}`)
    }
  } else {
    out.push("Unsupported type")
  }
  return out.join("\n");
}