import { button } from "../commands/play/tictactoe"

module.exports = {
  custom_id_regex: /tictactoe\:/,
  execute(ctx) {
    return button(ctx);
  }
}