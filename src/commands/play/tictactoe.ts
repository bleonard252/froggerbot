import * as chalk from "chalk";
import { ButtonInteraction, CommandInteraction, MessageActionRow, MessageActionRowOptions, MessageComponentOptions } from "discord.js";
import { logError } from "../../utility/logging/consolelogger";
import { failureMessage } from "../../utility/statusreply";

export function setup(ctx: CommandInteraction) {
  ctx.reply({
    content: "Game started by <@"+ctx.member.user.id+">",
    components: turnComponents("◾◾◾◾◾◾◾◾◾", true) as any,
    allowedMentions: {
      users: []
    }
  })
}
export function button(ctx: ButtonInteraction) {
  if (ctx.customId.startsWith("tictactoe:")) {
    var parts = ctx.customId.split(":");
    var gameover = isGameOver(parts[1]);
    if (Array.isArray(gameover)) ctx.update({
      content: "Game over!",
      components: turnComponents(parts[1], !(parts[2] == "1")) as any
    });
    else ctx.update({
      content: ctx.message.content ?? "Game in progress",
      components: turnComponents(parts[1], !(parts[2] == "1")) as any
    });
  } else {
    logError("Unknown custom ID in tic-tac-toe: "+chalk.underline(ctx.customId));
    ctx.reply({
      //content: "Error: unknown tictactoe custom ID " + data.data.custom_id,
      ...failureMessage("Unknown event", "Tic-Tac-Toe Broke!"),
      ephemeral: true
    });
  }
}

const cross = "❌"; const nought = "⭕"; const empty = "◾";

function turnComponents(gameState: string, xturn: boolean): MessageActionRowOptions[] {
  const state = gameState.split("");
  var gameover = isGameOver(gameState);
  const composeNewState = (digit: number, replace) => {
    var _state = Array.from(state);
    _state[digit] = state[digit] == replace
      ? "⏹️" // it no longer complains about duplicates :D
      : replace;
    return _state.join("");
  };
  return [
    {
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(0, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(0) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[0] },
          disabled: state[0] != empty || gameover !== false
        },
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(1, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(1) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[1] },
          disabled: state[1] != empty || gameover !== false
        },
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(2, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(2) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[2] },
          disabled: state[2] != empty || gameover !== false
        }
      ]
    },
    {
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(3, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(3) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[3] },
          disabled: state[3] != empty || gameover !== false
        },
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(4, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(4) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[4] },
          disabled: state[4] != empty || gameover !== false
        },
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(5, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(5) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[5] },
          disabled: state[5] != empty || gameover !== false
        }
      ]
    },
    {
      type: "ACTION_ROW",
      components: [
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(6, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(6) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[6] },
          disabled: state[6] != empty || gameover !== false
        },
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(7, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(7) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[7] },
          disabled: state[7] != empty || gameover !== false
        },
        {
          type: "BUTTON",
          customId: "tictactoe:" + composeNewState(8, xturn ? cross : nought) + ":" + (xturn ? 1 : 0),
          style: Array.isArray(gameover) && gameover.includes(8) ? "SUCCESS" : "SECONDARY",
          emoji: { id: null, name: state[8] },
          disabled: state[8] != empty || gameover !== false
        }
      ]
    }
  ]
}
function isGameOver(gameState: string): number[] | false {
  const state = gameState.split("");
  const possibleWins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ]
  for (var p = 0; p < 2; p++) {
    const pp = p == 0 ? nought : cross;
    for (var c = 0; c < 8; c++) {
      var matches = 0;
      for (var i = 0; i < 3; i++) {
        var match = possibleWins[c][i];
        if (state[match] == pp) matches++;
      };
      if (matches == 3) return possibleWins[c];
    }
  }
  return false;
}

