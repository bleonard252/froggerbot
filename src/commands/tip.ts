import { SlashCommandBuilder, SlashCommandStringOption } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import fetch, { Request } from "node-fetch";
import { logDebug } from "../utility/consolelogger";

module.exports = {
  data: new SlashCommandBuilder()
  .setName("tip")
  .setDescription("Ask me for a useful tip! Or not...")
  .addStringOption(new SlashCommandStringOption()
    .setName("category")
    .setDescription("Pick a category to get a more specific tip.")
    .addChoices([
      ["This bot", "bot"],
      ["Splitgate", "splitgate"],
      ["Minecraft", "minecraft"],
      ["Lucid dreaming", "lucid"],
      ["ARG solving", "solving"]
    ])
    .setRequired(false)
  ),
  async execute(ctx: CommandInteraction) {
    await ctx.deferReply();
    const tips = await (await fetch("https://gist.githubusercontent.com/bleonard252/29ef20ea81a52df3acd565bee82ba310/raw/tips.json")).json();
    let redacted = false;
    if (tips["redacted"] && tips["redacted"].length != 0) {
      logDebug((parseInt(ctx.id) >> 22) + 1420070400000);
      const ts = (parseInt(ctx.id) >> 22) + 1420070400000;
      if (Math.floor(ts/1000) % 120 == 0) redacted = true;
    }
    const category = ctx.options.getString("category") || (redacted ? "redacted" : ["bot", "splitgate", "minecraft", "lucid", "solving"][Math.floor(Math.random()*5)]);

    if (redacted && !ctx.options.getString("category")) {
      var tip = tips["redacted"][Math.floor(
        Math.random()
        * tips["redacted"].length
      )];
      var tipno: string | number = "??";
    } else {
      var tipno: string | number = Math.floor(
        Math.random()
        * tips[category].length
      );
      var tip = tips[category][tipno as number]
      tipno = tipno+1;
    }
    await ctx.editReply({
      content: tip ? `**${categoryNames[category]} Tip #${tipno}:** ${tip}` : `Sorry, the tip you asked for couldn't be found.`,
      allowedMentions: {},
    });
  }
}

const categoryNames = {
  "bot": "Bot",
  "splitgate": "Splitgate",
  "minecraft": "Minecraft",
  "lucid": "Lucid Dreaming",
  "solving": "ARG Solving",
  "redacted": "█████"
}