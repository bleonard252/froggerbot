import { ButtonInteraction } from "discord.js";
import { db } from "../../utility/database";
import { failureMessage } from "../../utility/statusreply";

module.exports = {
  custom_id_regex: /^poll:(.+?):end$/,
  async execute(ctx: ButtonInteraction) {
    await ctx.deferUpdate();
    const pollId = ctx.customId.match(module.exports.custom_id_regex)[1];
    const ownerId = await db.hGet(pollId, "owner");
    const poll = await db.hGetAll(pollId);
    if (!(ctx.memberPermissions.has("MANAGE_MESSAGES", true)
    || ctx.member.user.id == ownerId)) {
      await ctx.followUp({
        ...failureMessage("Only the poll's owner and the server's moderators can end the poll.", 
        /*title*/ "You don't have permission to end this poll."),
        ephemeral: true
      });
      return;
    }
    if (poll == {} || !ownerId) return await ctx.followUp(failureMessage("This poll has already ended! Results could not be calculated."));
    // Calculate the output of the poll
    var answers: string[];
    var ansct: number, ans1ct: number, ans2ct: number,
      ans3ct: number, ans4ct: number, yesct: number, noct: number;
    try {
      answers = await db.hVals(pollId+":ans");
      //TODO: figure out whether each member who voted is still in the server... maybe
      ansct = answers?.length ?? 0;
      ans1ct = answers.filter((v,i,a) => v == "ans1")?.length ?? 0;
      ans2ct = answers.filter((v,i,a) => v == "ans2")?.length ?? 0;
      ans3ct = answers.filter((v,i,a) => v == "ans3")?.length ?? 0;
      ans4ct = answers.filter((v,i,a) => v == "ans4")?.length ?? 0;
      yesct = answers.filter((v,i,a) => v == "yes")?.length ?? 0;
      noct = answers.filter((v,i,a) => v == "no")?.length ?? 0;
    } catch(e) {
      console.error("{{ ERROR in Poll command Calculate step }} ", e);
      await ctx.followUp({
        ...failureMessage("The poll was not closed. An error occurred."),
        ephemeral: true
      });
      return;
    }
    // Try to delete the poll
    var delSuccess = true;
    try {
      await db.multi()
        .del(pollId)
        .del(pollId+":ans")
      .exec();
    } catch(_) {delSuccess = false;}
    var order = poll["type"] != "yesno" ? [
      {key: poll["ans1value"], value: ans1ct},
      {key: poll["ans2value"], value: ans2ct},
      {key: poll["ans3value"], value: ans3ct},
      {key: poll["ans4value"], value: ans4ct}
    ] : [
      {key: "Yes", value: yesct},
      {key: "No", value: noct},
    ];
    order = order.filter((v,i,a) => v.key);
    order.sort((a, b) => a.value - b.value).reverse();
    // Return the result of the poll (and if deleting it failed)
    const b2 = order[1]?.value == order[0].value ? `**` : ``;
    const b3 = order[2]?.value == order[0].value ? `**` : ``;
    const b4 = order[3]?.value == order[0].value ? `**` : ``;
    await ctx.editReply({
      allowedMentions: {repliedUser: false},
      content: `**The poll is over!**\n<@${poll["owner"]}> asked:\n> `+poll["question"]+"\n" +
      (order[0] ? `**\`${((order[0].value/ansct)*100).toString().padStart(3," ")}\%\`** **${order[0].key}**\n`
      : `🛑 No possible answers to this poll!`) +
      (order[1] ? `${b2}\`${((order[1].value/ansct)*100).toString().padStart(3," ")}\%\`${b2} ${b2}${order[1].key}${b2}\n` : ``) +
      (order[2] ? `${b3}\`${((order[2].value/ansct)*100).toString().padStart(3," ")}\%\`${b3} ${b3}${order[2].key}${b3}\n` : ``) +
      (order[3] ? `${b4}\`${((order[3].value/ansct)*100).toString().padStart(3," ")}\%\`${b4} ${b4}${order[3].key}${b4}\n` : ``) +
      `**Total respondents:** ${ansct}\n`+
      (delSuccess ? `` : `⚠️ The poll was not deleted from the database!`),
      components: []
    });
  }
}