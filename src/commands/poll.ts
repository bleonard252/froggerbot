import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction, MessageActionRow, Modal, TextInputComponent } from "discord.js";
import { TextInputStyles } from "discord.js/typings/enums";
import { db } from "../utility/database";
import { failureMessage } from "../utility/statusreply";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("poll")
  .setDescription("Set up a poll with 2-4 custom choices. For yes/no, use /yesno. USES A MODAL")
  .addStringOption(new SlashCommandStringOption()
    .setName("question")
    .setDescription("Pre-fill your question.")
    .setRequired(false)
  ),
  async execute(ctx: CommandInteraction) {
    if (ctx.options.getString("question", false) 
    && ctx.options.getString("question").length > 250) return await ctx.reply({
      ...failureMessage("Your question cannot be over 250 characters."), 
      ephemeral: true
    });
    const _question = new TextInputComponent()
      .setCustomId("newpoll:question")
      .setStyle(TextInputStyles.SHORT)
      .setLabel("Question")
      .setMaxLength(250)
      .setRequired(true);
    if (ctx.options.getString("question", false)) _question.setValue(ctx.options.getString("question"));
    await ctx.presentModal(new Modal()
      .setTitle("New Poll")
      .setCustomId("newpoll")
      .addComponents(new MessageActionRow<TextInputComponent>()
        .addComponents(_question), new MessageActionRow<TextInputComponent>()
        .addComponents(new TextInputComponent()
          .setCustomId("newpoll:ans1")
          .setStyle(TextInputStyles.SHORT)
          .setLabel("Answer 1")
          .setMaxLength(250)
          .setRequired(true)
        ), new MessageActionRow<TextInputComponent>()
        .addComponents(new TextInputComponent()
          .setCustomId("newpoll:ans2")
          .setStyle(TextInputStyles.SHORT)
          .setLabel("Answer 2")
          .setMaxLength(250)
          .setRequired(true)
        ), new MessageActionRow<TextInputComponent>()
        .addComponents(new TextInputComponent()
          .setCustomId("newpoll:ans3")
          .setStyle(TextInputStyles.SHORT)
          .setLabel("Answer 3")
          .setMaxLength(250)
          .setRequired(false)
        ), new MessageActionRow<TextInputComponent>()
        .addComponents(new TextInputComponent()
          .setCustomId("newpoll:ans4")
          .setStyle(TextInputStyles.SHORT)
          .setLabel("Answer 4")
          .setMaxLength(250)
          .setRequired(false)
        )
      )
    )
  }
}