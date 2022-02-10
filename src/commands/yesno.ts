import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { ulid } from "ulid";
import { db } from "../utility/database";
import { logError } from "../utility/logging/consolelogger";
import { insertIf } from "../utility/misc";
import { failureMessage } from "../utility/statusreply";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("yesno")
  .setDescription("Set up a poll with basic yes/no buttons.")
  .addStringOption(new SlashCommandStringOption()
    .setName("question")
    .setDescription("The question you want to ask.")
    .setRequired(true)
  ),
  async execute(ctx: CommandInteraction) {
    //await ctx.deferReply(); //consistency
    const pollId = ulid();
    try {
      await db.multi()
        .hSet(pollId, "question", ctx.options.getString("question"))
        .hSet(pollId, "owner", ctx.member.user.id)
        .hSet(pollId, "type", "yesno")
        .exec();
    } catch(e) {
      logError(e);
      await ctx.reply({...failureMessage("The poll could not be created."), ephemeral: true});
      return;
    }
    try {
      await ctx.reply({
        content: `<@${ctx.member.user.id}> asks:\n> `+ctx.options.getString("question"),
        allowedMentions: {},
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                customId: "poll:"+pollId+":yes",
                emoji: {id: null, name: "👍"},
                style: "SUCCESS"
              },
              {
                type: "BUTTON",
                customId: "poll:"+pollId+":no",
                emoji: {id: null, name: "👎"},
                style: "DANGER"
              },
              {
                type: "BUTTON",
                style: "SECONDARY",
                label: "End poll",
                customId: "poll:"+pollId+":end"
              },
              {
                type: "BUTTON",
                style: "SECONDARY",
                label: "Manage poll",
                emoji: {id: null, name: "⚙️"},
                disabled: true,
                customId: "poll:"+pollId+":manage"
              }
            ]
          }
        ]
      });
      return;
    } catch(e) {
      logError(e);
      await ctx.reply({...failureMessage("The poll could not be created."), ephemeral: true});
      await db.del(pollId);
      return;
    }
  }
}