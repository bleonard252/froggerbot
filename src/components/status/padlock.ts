import * as chalk from "chalk";
import { ButtonInteraction, InteractionReplyOptions, MessageButton, MessageButtonOptions, MessageOptions } from "discord.js";
import { logError } from "../../utility/logging/consolelogger";
import { failureMessage } from "../../utility/statusreply";

module.exports = {
  custom_id_regex: /^padlock/,
  async execute(ctx: ButtonInteraction) {
    // "Turnpike mode": determine *which* padlock command to run
    if (ctx.customId.startsWith("padlocksubmit:")) {
      // else {
        return await ctx.reply({...failureMessage("This is not a valid vault code.", "Vault did not open."), ephemeral: true});
      //}
    }
    else if (ctx.customId.startsWith("padlock:")) {
      return await ctx.update(vaultDoor(ctx));
    } else if (ctx.customId == "padlockenter") {
      return await ctx.reply(vaultDoor(ctx));
    } else if (ctx.customId == "padlockclear") {
      return await ctx.update({content: "The vault has been sealed."});
    } else {
      logError(`Vault handling error: "${chalk.underline(ctx.customId)}" not handled`);
      return await ctx.reply({...failureMessage("Padlock event not handled!"), ephemeral: true});
    }
  }
}

function vaultDoor(ctx: ButtonInteraction): InteractionReplyOptions {
  const value = ctx.customId.startsWith("padlock:") ? ctx.customId.split(":")[1] : "";
  return {
    content: "You have entered the secret vault... "+value,
    ephemeral: true,
    components: [
      {
        type: "ACTION_ROW",
        components: [
          _buildVaultButton("7", value),
          _buildVaultButton("8", value),
          _buildVaultButton("9", value),
        ]
      },
      {
        type: "ACTION_ROW",
        components: [
          _buildVaultButton("4", value),
          _buildVaultButton("5", value),
          _buildVaultButton("6", value),
        ]
      },
      {
        type: "ACTION_ROW",
        components: [
          _buildVaultButton("1", value),
          _buildVaultButton("2", value),
          _buildVaultButton("3", value),
        ]
      },
      {
        type: "ACTION_ROW",
        components: [
          {
            type: "BUTTON",
            customId: "padlockclear",
            style: (value??"").length >= 4 ? "DANGER" : "SECONDARY",
            label: "X"
          },
          _buildVaultButton("0", value),
          {
            type: "BUTTON",
            customId: "padlocksubmit:"+value,
            style: value.length >= 4 ? "SUCCESS" : "SECONDARY",
            emoji: { id: null, name: "✅" },
            disabled: value.length < 4
          }
        ]
      }
    ]
  }
}
const _buildVaultButton = (digit: string, value?: string): MessageButton => new MessageButton({
  type: "BUTTON",
  style: "PRIMARY",
  customId: "padlock:"+(value??"")+digit,
  label: digit,
  disabled: (value??"").length >= 8
});