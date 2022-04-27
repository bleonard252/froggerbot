import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import { APIActionRowComponent, APIMessageActionRowComponent } from "discord-api-types/v10";
import { CommandInteraction, EmbedAuthorData, ReactionEmoji } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check the bot's status and/or test its online state."),
  async execute(ctx: CommandInteraction) {
    await ctx.deferReply();
    const app = await ctx.client.application!.fetch();
    const embed = new EmbedBuilder()
    .setTitle("Bot Data")
    .setColor(39129)
    .setAuthor({
      name: app.name,
      iconURL: app.icon ? app.iconURL({size: 64}) : `https://cdn.discordapp.com/embed/avatars/0.png`
    } as EmbedAuthorData)
    .setTimestamp(app.createdAt);
    embed.addFields([{name: "Node.JS Version", value: process.version}]);
    //.setFooter({text: "Hosted proudly "})
    if (app.owner) embed.addFields([{name: "Owner", value: "<@"+app.owner.id+">"}]);
    const buttons = new ActionRowBuilder().addComponents([
      new ButtonBuilder()
      .setCustomId("statushelp")
      .setStyle(2)
      .setLabel("Legend")
      .setEmoji({
        name: "❓"
      }),
      new ButtonBuilder()
      .setCustomId("padlockenter")
      .setStyle(2)
      .setEmoji({
        name: "🔒"
      }),
    ]);
    // if (ctx.memberPermissions.has("MANAGE_GUILD", true)) buttons.addComponents(
    //   new MessageButton()
    //   .setURL("discord://guild/settings/integrations/id")
    // )
    ctx.editReply({embeds: [embed], components: [buttons.toJSON() as APIActionRowComponent<APIMessageActionRowComponent>]})
  }
}