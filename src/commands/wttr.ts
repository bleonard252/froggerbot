import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("wttr")
  .setDescription("Check the weather for anywhere in the world.")
  .addStringOption(new SlashCommandStringOption()
    .setName("location")
    .setDescription("Where to check the weather for.")
    .setRequired(true)
  ),
  execute(ctx: CommandInteraction) {
    ctx.reply({
      content: "https://wttr.in/"+ctx.options.getString("location")+".png"
    });
  }
}