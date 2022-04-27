import { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, SlashCommandStringOption, TextInputBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction, CommandInteraction, TextInputComponent, TextInputStyle } from "discord.js";
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
  async execute(ctx: ChatInputCommandInteraction) {
    if (ctx.options.get("question", false).value
    && ctx.options.getString("question").length > 250) return await ctx.reply({
      ...failureMessage("Your question cannot be over 250 characters."), 
      ephemeral: true
    });
    const _question = new TextInputBuilder()
      .setCustomId("newpoll:question")
      .setStyle(TextInputStyle.Short)
      .setLabel("Question")
      .setMaxLength(250)
      .setRequired(true);
    if (ctx.options.getString("question")) _question.setValue(ctx.options.getString("question"));
    await ctx.showModal(new ModalBuilder()
      .setTitle("New Poll")
      .setCustomId("newpoll")
      .addComponents([new ActionRowBuilder<TextInputBuilder>()
        .addComponents([_question]), new ActionRowBuilder<TextInputBuilder>()
        .addComponents([new TextInputBuilder()
          .setCustomId("newpoll:ans1")
          .setStyle(TextInputStyle.Short)
          .setLabel("Answer 1")
          .setMaxLength(250)
          .setRequired(true)
        ]), new ActionRowBuilder<TextInputBuilder>()
        .addComponents([new TextInputBuilder()
          .setCustomId("newpoll:ans2")
          .setStyle(TextInputStyle.Short)
          .setLabel("Answer 2")
          .setMaxLength(250)
          .setRequired(true)
        ]), new ActionRowBuilder<TextInputBuilder>()
        .addComponents([new TextInputBuilder()
          .setCustomId("newpoll:ans3")
          .setStyle(TextInputStyle.Short)
          .setLabel("Answer 3")
          .setMaxLength(250)
          .setRequired(false)
        ]), new ActionRowBuilder<TextInputBuilder>()
        .addComponents([new TextInputBuilder()
          .setCustomId("newpoll:ans4")
          .setStyle(TextInputStyle.Short)
          .setLabel("Answer 4")
          .setMaxLength(250)
          .setRequired(false)
        ])
      ])
    )
  }
}