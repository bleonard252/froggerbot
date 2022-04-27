import { ButtonInteraction, PermissionFlagsBits } from "discord.js";
import { logError } from "../utility/logging/consolelogger";
import { failureMessage, successMessage } from "../utility/statusreply";

module.exports = {
  custom_id_regex: /^um[!]/,
  async execute(ctx: ButtonInteraction) {
    const parts = ctx.customId.replace("um!","").split(":");
    const moderator = parts[0];
    const target = parts[1];
    if (ctx.member.user.id != moderator) ctx.reply({
      ...failureMessage("You are not the moderator who muted this user."),
      ephemeral: true
    }); else {
      if (!ctx.memberPermissions.has(PermissionFlagsBits.ModerateMembers, true)) return await ctx.reply({
        ...failureMessage("You have to have Moderate Members to unmute people.", "Permission denied"),
        ephemeral: true
      });
      const member = await (await ctx.client.guilds.fetch(ctx.guildId)).members.fetch(target);
      if (!member) return await ctx.reply({
        ...failureMessage("The user you specified is not in this server.", "Unmute failed"),
        ephemeral: true
      });
      if (!member.isCommunicationDisabled()) return await ctx.reply({
        ...failureMessage("This user is not muted.", "Unmute failed"),
        ephemeral: true
      });
      try {
        await member.timeout(0);
        await ctx.reply({
          ...successMessage(`<@${member.user.id}> has been unmuted.`),
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
}