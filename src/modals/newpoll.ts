import { ButtonStyle, ComponentType, ModalSubmitInteraction } from "discord.js";
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
        .hSet(pollId, "question", getTextInputValue(ctx, "newpoll:question")!)
        .hSet(pollId, "owner", ctx.member.user.id)
        .hSet(pollId, "type", "custom")
        .hSet(pollId, "ans1value", getTextInputValue(ctx, "newpoll:ans1"))
        .hSet(pollId, "ans2value", getTextInputValue(ctx, "newpoll:ans2"))
        .hSet(pollId, "ans3value", getTextInputValue(ctx, "newpoll:ans3") || "")
        .hSet(pollId, "ans4value", getTextInputValue(ctx, "newpoll:ans4") || "")
        .exec();
    } catch(e) {
      logError(e);
      await ctx.reply({...failureMessage("The poll could not be created."), ephemeral: true});
      return;
    }
    try {
      await ctx.reply({
        content: `<@${ctx.member.user.id}> asks:\n> `+getTextInputValue(ctx, "newpoll:question"),
        allowedMentions: {repliedUser: false, users: []},
        components: [
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.SelectMenu,
                customId: "poll:"+pollId+":ans",
                placeholder: "Vote for this poll",
                options: [
                  {
                    label: getTextInputValue(ctx, "newpoll:ans1") ?? "Answer 1",
                    value: "ans1",
                  },
                  {
                    label: getTextInputValue(ctx, "newpoll:ans2") ?? "Answer 2",
                    value: "ans2",
                  },
                  ...insertIf(getTextInputValue(ctx, "newpoll:ans3"), {
                    label: getTextInputValue(ctx, "newpoll:ans3") ?? "Answer 3",
                    value: "ans3",
                  }),
                  ...insertIf(getTextInputValue(ctx, "newpoll:ans4"), {
                    label: getTextInputValue(ctx, "newpoll:ans4") ?? "Answer 4",
                    value: "ans4",
                  }),
                ]
              }
            ]
          },
          {
            type: ComponentType.ActionRow,
            components: [
              {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
                label: "End poll",
                customId: "poll:"+pollId+":end"
              },
              {
                type: ComponentType.Button,
                style: ButtonStyle.Secondary,
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

function getTextInputValue(ctx: ModalSubmitInteraction, key: string) {
  return ctx.components.flatMap((v) => v.components).find((v) => v.customId == key).value;
}