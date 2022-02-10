import { ActionRow, ButtonComponent, SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction, EmbedAuthorData, MessageActionRow, MessageButton, MessageEmbed, ReactionEmoji } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Check the bot's status and/or test its online state."),
  async execute(ctx: CommandInteraction) {
    await ctx.deferReply();
    const app = await ctx.client.application!.fetch();
    const embed = new MessageEmbed()
    .setTitle("Bot Data")
    .setColor(39129)
    .setAuthor({
      name: app.name,
      iconURL: app.icon ? app.iconURL({size: 64}) : `https://cdn.discordapp.com/embed/avatars/0.png`
    } as EmbedAuthorData)
    .setTimestamp(app.createdAt);
    embed.addField("Node.JS Version", process.version);
    //.setFooter({text: "Hosted proudly "})
    if (app.owner) embed.addField("Owner", "<@"+app.owner.id+">");
    const buttons = new MessageActionRow().addComponents(
      new MessageButton()
      .setCustomId("statushelp")
      .setStyle(2)
      .setLabel("Legend")
      .setEmoji("❓"),
      new MessageButton()
      .setCustomId("padlockenter")
      .setStyle(2)
      .setEmoji("🔒")
    );
    // if (ctx.memberPermissions.has("MANAGE_GUILD", true)) buttons.addComponents(
    //   new MessageButton()
    //   .setURL("discord://guild/settings/integrations/id")
    // )
    ctx.editReply({embeds: [embed], components: [buttons]})
  }
}