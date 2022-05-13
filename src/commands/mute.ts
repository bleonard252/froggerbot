import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder, SlashCommandStringOption, SlashCommandUserOption } from "@discordjs/builders";
import { ButtonStyle, ChatInputCommandInteraction, CommandInteraction, PermissionFlagsBits, PermissionOverwrites, PermissionsBitField } from "discord.js";
import { logError } from "../utility/logging/consolelogger";
import { failureMessage, successMessage } from "../utility/statusreply";
import * as Time from "duration-parser.js";
import { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";

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
  extra: {
    default_member_permissions: new PermissionsBitField(PermissionFlagsBits.ModerateMembers).bitfield.toString(),
    dm_permission: false
  },
  async execute(ctx: ChatInputCommandInteraction) {
    if (!ctx.memberPermissions.has(PermissionFlagsBits.ModerateMembers, true)) return await ctx.reply({
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
        components: [new ActionRowBuilder().addComponents([
          new ButtonBuilder()
            .setCustomId(`um!${ctx.member.user.id}:${user.id}`)
            .setLabel("Unmute")
            .setStyle(ButtonStyle.Primary)
        ]).toJSON() as APIActionRowComponent<APIMessageActionRowComponent>]
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