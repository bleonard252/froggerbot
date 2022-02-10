import { ButtonInteraction, MessageEmbed } from "discord.js";

module.exports = {
  custom_id: "statushelp",
  execute(ctx: ButtonInteraction) {
    ctx.reply({
      ephemeral: true,
      embeds: [new MessageEmbed({
        title: "Command emoji",
        description: "Commands use emojis to distinguish certain privileges or features required to use it.",
        fields: [
          {
            name: "🛡️ Moderation",
            value: "Requires a modrole to be set. Only moderators, distinguished by the modrole, can use these commands.",
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