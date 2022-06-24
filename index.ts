import { Client, Intents } from "discord.js";
import { Bot } from "./structs/Bot";
import { getVoiceConnection } from "@discordjs/voice";

export const bot = new Bot(
  new Client({
    restTimeOffset: 0,
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_VOICE_STATES,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
      Intents.FLAGS.DIRECT_MESSAGES
    ]
  }).on('voiceStateUpdate', (oldState, newState) => {


    if (oldState.channel?.id !==  oldState?.guild?.me?.voice?.channel?.id || newState.channel)
        return;

    console.log("Disconnected from same channel!")
    if (oldState.channel?.members.size == 1) {

        console.log("Alone!")
        getVoiceConnection(oldState.channel.guild.id)?.disconnect();
    }
  })
);
