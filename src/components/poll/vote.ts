import { MessageComponentInteraction } from "discord.js";
import { db } from "../../utility/database";
import { logError } from "../../utility/logging/consolelogger";
import { failureMessage, successMessage } from "../../utility/statusreply";

module.exports = {
  custom_id_regex: /^poll:(.+?):(ans|yes|no)$/,
  async execute(ctx: MessageComponentInteraction) {
    const [_, pollId, action] = ctx.customId.match(module.exports.custom_id_regex);
    if (action == "ans" && ctx.isSelectMenu()) {
      const answerId: "ans1" | "ans2" | "ans3" | "ans4" | string = ctx.values[0];
      const hasAnswer = await db.hExists(pollId+":ans", ctx.member.user.id);
      const answer = hasAnswer ? await db.hGet(pollId+":ans", ctx.member.user.id) : null;
      
      if (answer == answerId) {
        await ctx.reply({
          ...failureMessage("You've already given this answer."),
          ephemeral: true
        });
        return;
      }
      else if (hasAnswer) {
        const name = await db.hGet(pollId, answerId+"value");
        await db.hSet(pollId+":ans", ctx.member.user.id, answerId);
        await ctx.reply({
          ...successMessage("Your answer has been changed to "+name+"."),
          ephemeral: true
        });
        return;
      } else {
        const name = await db.hGet(pollId, answerId+"value");
        await db.hSet(pollId+":ans", ctx.member.user.id, answerId);
        await ctx.reply({
          ...successMessage("Your answer has been set to "+name+"."),
          ephemeral: true
        });
        return;
      }
    } else if (action == "yes" || action == "no") {
      const hasAnswer = await db.hExists(pollId+":ans", ctx.member.user.id);
      const answer = hasAnswer ? await db.hGet(pollId+":ans", ctx.member.user.id) : null;

      if (answer == action) {
        await ctx.reply({
          ...failureMessage("You've already given this answer."),
          ephemeral: true
        });
        return;
      }
      else if (hasAnswer) {
        const name = action == "yes" ? "Yes" : "No";
        await db.hSet(pollId+":ans", ctx.member.user.id, action);
        await ctx.reply({
          ...successMessage("Your answer has been changed to "+name+"."),
          ephemeral: true
        });
        return;
      } else {
        const name = action == "yes" ? "Yes" : "No";
        await db.hSet(pollId+":ans", ctx.member.user.id, action);
        await ctx.reply({
          ...successMessage("Your answer has been set to "+name+"."),
          ephemeral: true
        });
        return;
      }
    } else {
      logError("Unexpected poll action: "+ action);
      await ctx.reply({
        ...failureMessage("Your answer could not be submitted."),
        ephemeral: true
      });
      return;
    }
  }
}