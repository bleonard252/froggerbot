import { EmbedBuilder } from "@discordjs/builders";
import { ButtonInteraction } from "discord.js";

module.exports = {
  custom_id: "statushelp",
  execute(ctx: ButtonInteraction) {
    ctx.reply({
      ephemeral: true,
      embeds: [new EmbedBuilder({
        title: "Command emoji",
        description: "Commands use emojis to distinguish certain privileges or features required to use it.",
        fields: [
          {
            name: "🛡️ Moderation",
            value: "Only moderators can use these commands.",
            inline: true
          },
          // {
          //   name: "📚 Database",
          //   value: "Requires this server to be allowed to use the bot's database.",
          //   inline: true
          // },
          {
            name: "👑 Owner",
            value: "Only the server owner can use these commands.",
            inline: true
          }
        ]
      })]
    })
  }
}