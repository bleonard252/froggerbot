import { Collection, MessageComponentInteraction } from "discord.js";
import { db } from "../../utility/database";
import { logDebug, logError } from "../../utility/logging/consolelogger";
import { insertIf } from "../../utility/misc";
import { failureMessage, successMessage } from "../../utility/statusreply";

module.exports = {
  custom_id_regex: /^poll:(.+?):(ans|yes|no)$/,
  async execute(ctx: MessageComponentInteraction) {
    await ctx.deferUpdate();
    const [_, pollId, action] = ctx.customId.match(module.exports.custom_id_regex);
    if (action == "ans" && ctx.isSelectMenu()) {
      const answerId: "ans1" | "ans2" | "ans3" | "ans4" | string = ctx.values[0];
      const hasAnswer = await db.hExists(pollId+":ans", ctx.member.user.id);
      const answer = hasAnswer ? await db.hGet(pollId+":ans", ctx.member.user.id) : null;
      
      if (answer == answerId) {
        await ctx.followUp({
          ...failureMessage("You've already given this answer."),
          ephemeral: true
        });
      }
      else if (hasAnswer) {
        const name = await db.hGet(pollId, answerId+"value");
        await db.hSet(pollId+":ans", ctx.member.user.id, answerId);
        await ctx.followUp({
          ...successMessage("Your answer has been changed to "+name+"."),
          ephemeral: true
        });
      } else {
        const name = await db.hGet(pollId, answerId+"value");
        await db.hSet(pollId+":ans", ctx.member.user.id, answerId);
        await ctx.followUp({
          ...successMessage("Your answer has been set to "+name+"."),
          ephemeral: true
        });
      }

      const answers = await db.hVals(pollId+":ans");
      const poll = await db.hGetAll(pollId);
      const ans1ct = answers.filter((v,i,a) => v == "ans1")?.length ?? 0;
      const ans2ct = answers.filter((v,i,a) => v == "ans2")?.length ?? 0;
      const ans3ct = answers.filter((v,i,a) => v == "ans3")?.length ?? 0;
      const ans4ct = answers.filter((v,i,a) => v == "ans4")?.length ?? 0;
      return await ctx.editReply({
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
                    label: poll['ans1value'] ?? "Answer 1",
                    description: ans1ct > 0 ? `${ans1ct} vote${ans1ct==1?"":"s"}` : undefined,
                    value: "ans1",
                  },
                  {
                    label: poll['ans2value'] ?? "Answer 2",
                    description: ans2ct > 0 ? `${ans2ct} vote${ans2ct==1?"":"s"}` : undefined,
                    value: "ans2",
                  },
                  ...insertIf(poll['ans3value'], {
                    label: poll['ans3value'] ?? "Answer 3",
                    description: ans3ct > 0 ? `${ans3ct} vote${ans3ct==1?"":"s"}` : undefined,
                    value: "ans3",
                  }),
                  ...insertIf(poll['ans4value'], {
                    label: poll['ans4value'] ?? "Answer 4",
                    description: ans4ct > 0 ? `${ans4ct} vote${ans4ct==1?"":"s"}` : undefined,
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
    } else if (action == "yes" || action == "no") {
      const hasAnswer = await db.hExists(pollId+":ans", ctx.member.user.id);
      const answer = hasAnswer ? await db.hGet(pollId+":ans", ctx.member.user.id) : null;

      if (answer == action) {
        await ctx.followUp({
          ...failureMessage("You've already given this answer."),
          ephemeral: true
        });
      }
      else if (hasAnswer) {
        const name = action == "yes" ? "Yes" : "No";
        await db.hSet(pollId+":ans", ctx.member.user.id, action);
        await ctx.followUp({
          ...successMessage("Your answer has been changed to "+name+"."),
          ephemeral: true
        });
      } else {
        const name = action == "yes" ? "Yes" : "No";
        await db.hSet(pollId+":ans", ctx.member.user.id, action);
        await ctx.followUp({
          ...successMessage("Your answer has been set to "+name+"."),
          ephemeral: true
        });
      }

      const answers = (await db.hVals(pollId+":ans")) || [];
      const yesct = answers.filter((v) => v == "yes").length;
      const noct = answers.filter((v) => v == "no").length;
      return await ctx.editReply({
        components: [
          {
            type: "ACTION_ROW",
            components: [
              {
                type: "BUTTON",
                customId: "poll:"+pollId+":yes",
                emoji: {id: null, name: "👍"},
                //...insertIf(yesct > 0, {label: `${yesct}`}),
                label: yesct > 0 ? `${yesct}` : undefined,
                style: "SUCCESS"
              },
              {
                type: "BUTTON",
                customId: "poll:"+pollId+":no",
                emoji: {id: null, name: "👎"},
                label: noct > 0 ? `${noct}` : undefined,
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
    } else {
      logError("Unexpected poll action: "+ action);
      await ctx.followUp({
        ...failureMessage("Your answer could not be submitted."),
        ephemeral: true
      });
      return;
    }
  }
}