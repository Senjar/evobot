import { DiscordGatewayAdapterCreator, getVoiceConnection, joinVoiceChannel, createAudioPlayer, AudioPlayerState, AudioPlayerStatus, createAudioResource, NoSubscriberBehavior, VoiceConnection } from "@discordjs/voice";
import { Message, SystemChannelFlags } from "discord.js";
import { bot } from "../index";
import { i18n } from "../utils/i18n";
import { BotSound, randomSoundResourceFrom } from "../utils/botSound";

export default {
    name: "clip",
    cooldown: 3,
    aliases: ["c"],
    description: i18n.__("clip.description"),
    permissions: ["CONNECT", "SPEAK", "ADD_REACTIONS", "MANAGE_MESSAGES"],
    async execute(message: Message, args: string[], soundType: BotSound = BotSound.Clip, connection: VoiceConnection) {
        const queue = bot.queues.get(message.guild!.id);

        if (soundType === BotSound.Leave){
            const clipPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
            connection.subscribe(clipPlayer)
            console.log("destroy")
            clipPlayer.once(AudioPlayerStatus.Idle, async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                connection.destroy();
            });
            clipPlayer.play(randomSoundResourceFrom(soundType,args));
            return
        }

        const { channel } = message.member!.voice;
        if (!channel) return message.reply(i18n.__("play.errorNotChannel")).catch(console.error);

        const clipPlayer = createAudioPlayer({ behaviors: { noSubscriber: NoSubscriberBehavior.Play } });
        const voiceCon2 = getVoiceConnection(channel.guild.id) ?? joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator as DiscordGatewayAdapterCreator
          })
        if (!voiceCon2){
          console.log("Could not join channel");

        }else{
            //Change player to clip
            voiceCon2.subscribe(clipPlayer);
            if (queue){
                
                //Pause Music Queue
                if (soundType == BotSound.Join || soundType == BotSound.Skip){
                    if (queue.player.state.status == 'idle' || queue.player.state.status == 'buffering'){// will resume if clip played while already paused? (returns true if already paused?)
                        queue.player.once(AudioPlayerStatus.Playing, async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                            queue.player.pause();
                        });
                    }else if (queue.player.state.status == 'playing') {
                        queue.player.pause()
                    }
                }


                //Prepare for resuming after the pause
                clipPlayer.once(AudioPlayerStatus.Idle, async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                    //console.log("[CL] ",oldState.status," -> ",newState.status)
                    if (oldState.status !== AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Idle){
                        //After clip ends...
                        //Reset to Music Queue player
                        voiceCon2.subscribe(queue.player);

                        //UnPause Music Queue
                        if (soundType == BotSound.Join || soundType == BotSound.Skip){
                            queue.player.unpause();
                            //console.log("[CL] unpause")
                        

                            //If clip finished before queue even loaded/started playing -> counter the pause that is incoming (by the "Pause Music Queue" above)
                            if (queue.player.state.status == 'idle' || queue.player.state.status == 'buffering'){
                                queue.player.once(AudioPlayerStatus.Paused, async (oldState: AudioPlayerState, newState: AudioPlayerState) => {
                                    queue.player.unpause();
                                    //console.log("[CL] unpause 2")
                                });
                            }
                        } 
                    }
                }); 
            }

            //Play clip
            clipPlayer.play(randomSoundResourceFrom(soundType,args));

        }
    }
};