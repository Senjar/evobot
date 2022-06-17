import { canModifyQueue } from "../utils/queue";
import { i18n } from "../utils/i18n";
import { Message } from "discord.js";
import { bot } from "../index";
import { BotSound } from "../utils/botSound";
import { config } from "../utils/config";

export default {
  name: "skip",
  aliases: ["s"],
  description: i18n.__("skip.description"),
  execute(message: Message) {
    const queue = bot.queues.get(message.guild!.id);

    if (!queue) return message.reply(i18n.__("skip.errorNotQueue")).catch(console.error);

    if (!canModifyQueue(message.member!)) return i18n.__("common.errorNotChannel");

    queue.player.stop(true);

    if (config.BOT_SOUNDS) bot.commands.get("clip")!.execute(message,null,BotSound.Skip);

    queue.textChannel.send(i18n.__mf("skip.result", { author: message.author })).catch(console.error);
  }
};
