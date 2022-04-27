import { SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "@discordjs/builders";
import { CommandInteraction, PermissionFlagsBits, PermissionsBitField } from "discord.js";
import { logError } from "../utility/logging/consolelogger";
import { failureMessage, successMessage } from "../utility/statusreply";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("🛡️ Unmute a user, clearing their timer if one is set.")
  .addUserOption(new SlashCommandUserOption()
    .setName("user")
    .setDescription("The user to unmute.")
    .setRequired(true)
  )
  .addStringOption(new SlashCommandStringOption()
    .setName("reason")
    .setDescription("The reason the user is unmuted.")
    .setRequired(false)
  ),
  extra: {
    default_member_permissions: new PermissionsBitField(PermissionFlagsBits.ModerateMembers).bitfield.toString()
  },
  async execute(ctx: CommandInteraction) {
    if (!ctx.memberPermissions.has(PermissionFlagsBits.ModerateMembers, true)) return await ctx.reply({
      ...failureMessage("You have to have Moderate Members to unmute people.", "Permission denied"),
      ephemeral: true
    });
    const user = ctx.options.getUser("user", true);
    const member = await (await ctx.client.guilds.fetch(ctx.guildId)).members.fetch(user);
    if (!member) return await ctx.reply({
      ...failureMessage("The user you specified is not in this server.", "Unmute failed"),
      ephemeral: true
    });
    if (!member.isCommunicationDisabled()) return await ctx.reply({
      ...failureMessage("This user is not muted.", "Unmute failed"),
      ephemeral: true
    });
    const reason = ctx.options.get("reason", false).value as string;
    try {
      await member.timeout(0, reason);
      await ctx.reply({
        ...successMessage(`<@${user.id}> has been unmuted${reason ? ": "+reason : "."}`),
        allowedMentions: {}
      })
    } catch(e) {
      logError(e);
      return await ctx.reply({
        ...failureMessage("The unmute did not succeed due to an unknown error."),
        ephemeral: true
      });
    }
  }
}