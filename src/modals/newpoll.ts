import { ModalSubmitInteraction } from "discord.js";
import { ulid } from "ulid";
import { db } from "../utility/database";
import { logError } from "../utility/logging/consolelogger";
import { insertIf } from "../utility/misc";
import { failureMessage } from "../utility/statusreply";

module.exports = {
  custom_id: "newpoll",
  async execute(ctx: ModalSubmitInteraction) {
    //await ctx.deferReply(); //deferring does not work with d.js yet
    const pollId = ulid();
    try {
      await db.multi()
        .hSet(pollId, "question", ctx.getTextInputValue("newpoll:question")!)
        .hSet(pollId, "owner", ctx.member.user.id)
        .hSet(pollId, "type", "custom")
        .hSet(pollId, "ans1value", ctx.getTextInputValue("newpoll:ans1"))
        .hSet(pollId, "ans2value", ctx.getTextInputValue("newpoll:ans2"))
        .hSet(pollId, "ans3value", ctx.getTextInputValue("newpoll:ans3") || "")
        .hSet(pollId, "ans4value", ctx.getTextInputValue("newpoll:ans4") || "")
        .exec();
    } catch(e) {
      logError(e);
      await ctx.reply({...failureMessage("The poll could not be created."), ephemeral: true});
      return;
    }
    try {
      await ctx.reply({
        content: `<@${ctx.member.user.id}> asks:\n> `+ctx.getTextInputValue("newpoll:question"),
        allowedMentions: {repliedUser: false, users: []},
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "SELECT_MENU",
                customId: "poll:"+pollId+":ans",
                placeholder: "Vote for this poll",
                options: [
                  {
                    label: ctx.getTextInputValue("newpoll:ans1") ?? "Answer 1",
                    value: "ans1",
                  },
                  {
                    label: ctx.getTextInputValue("newpoll:ans2") ?? "Answer 2",
                    value: "ans2",
                  },
                  ...insertIf(ctx.getTextInputValue("newpoll:ans3"), {
                    label: ctx.getTextInputValue("newpoll:ans3") ?? "Answer 3",
                    value: "ans3",
                  }),
                  ...insertIf(ctx.getTextInputValue("newpoll:ans4"), {
                    label: ctx.getTextInputValue("newpoll:ans4") ?? "Answer 4",
                    value: "ans4",
                  }),
                ]
              }
            ]
          },
          {
            type: "ACTION_ROW",
            components: [
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
      await ctx.reply({...failureMessage("The poll could not be sent."), ephemeral: true});
      await db.del(pollId);
      return;
    }
  }
}