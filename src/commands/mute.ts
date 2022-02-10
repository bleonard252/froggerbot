import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, MessageButton } from "discord.js";
import { logError } from "../utility/logging/consolelogger";
import { failureMessage, successMessage } from "../utility/statusreply";
import * as Time from "duration-parser.js";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("mute")
  .setDescription("🛡️ Mute and timeout a user.")
  .addUserOption(new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to mute.")
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName("duration")
    .setDescription("The time to mute the user for. Default is 30 minutes.")
    //.setAutocomplete(true) //Autocomplete not yet implemented
    .setRequired(false)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName("reason")
    .setDescription("The reason the user is muted.")
    .setRequired(false)
  ),
  async execute(ctx: CommandInteraction) {
    if (!ctx.memberPermissions.has("MODERATE_MEMBERS", true)) return await ctx.reply({
      ...failureMessage("You have to have Moderate Members to mute people.", "Permission denied"),
      ephemeral: true
    });
    const user = ctx.options.getUser("user", true);
    const member = (await ctx.client.guilds.fetch(ctx.guildId)).members.fetch(user);
    if (!member) return await ctx.reply({
      ...failureMessage("The user you specified is not in this server.", "Mute failed"),
      ephemeral: true
    });
    const duration = new Time(ctx.options.getString("duration", false) || "30m");
    const reason = ctx.options.getString("reason", false);
    try {
      await (await member).timeout(duration.ms(), reason);
      await ctx.reply({
        ...successMessage(`<@${user.id}> has been muted for ${duration.toString()}${reason ? ": "+reason : ""}`),
        allowedMentions: {},
        components: [new MessageActionRow().addComponents(new MessageButton()
          .setCustomId(`um!${ctx.member.user.id}:${user.id}`)
          .setLabel("Unmute")
          .setStyle("SECONDARY")
        )]
      })
    } catch(e) {
      logError(e);
      return await ctx.reply({
        ...failureMessage("The mute did not succeed due to an unknown error."),
        ephemeral: true
      });
    }
  }
}