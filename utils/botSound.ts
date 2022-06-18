import { readdirSync, mkdirSync } from "fs";
import { AudioResource, createAudioResource } from "@discordjs/voice";

export const enum BotSound{
	Join = "sounds_bot/join" ,
	Leave = "sounds_bot/leave"  ,
	Skip = "sounds_bot/skip"  ,
	Clip = "sounds"  
}

export function randomSoundResourceFrom (soundType: BotSound, args: string[]): AudioResource {


    //Check if folder exists
    mkdirSync(soundType,{recursive: true})
    //Read folder
    var fileList = readdirSync(soundType)

    var selected
    if (args.length == 0){
        //Random from folder
        selected = Math.floor(Math.random() * fileList.length);
        console.log("->",fileList[selected])
        return createAudioResource(soundType+'/'+fileList[selected])
    }else{
        //Search for clips using args
        var clipList: string[] = []
        fileList.forEach(file => {
            if (file.toLocaleLowerCase().includes(args[0].toLocaleLowerCase())){
                clipList.push(file)
            }
            //console.log(file);
        });
        if (clipList.length == 0){
            //Nothing matching found
            //Random from folder
            selected = Math.floor(Math.random() * fileList.length);
            console.log("->",fileList[selected]," [clip not found]")
            return createAudioResource(soundType+'/'+fileList[selected])
        }else{
            //Random from matched results
            selected = Math.floor(Math.random() * clipList.length);
            console.log("->",clipList[selected])
            return createAudioResource(soundType+'/'+clipList[selected])
        }
     
    }  
}