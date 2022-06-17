const fs = require('fs');
const mp3Duration = require('mp3-duration');

module.exports = {
async extraMessage(queueConstruct,type){
    let fileList = [];
    fs.readdirSync("./sounds_makhs/"+type+"/").forEach(file => {
        fileList.push("./sounds_makhs/"+type+"/"+file);
    });
    selected = Math.floor(Math.random() * fileList.length);
    var durationMS = 0
    await mp3Duration(fileList[selected], async function (err, duration) {
        if (err) return console.log(err.message);
        durationMS = (duration+1)*1000;
        if (type=="leave") {durationMS = durationMS + 2000}
    });

    return new Promise(resolve => {
        if (queueConstruct.songs.length != 0 || type=="leave"){
            //console.log("playing...",fileList[selected]);
            queueConstruct.connection.play(fileList[selected]);
            //console.log("waiting...",durationMS);
            setTimeout(resolve, durationMS);
        }
        else{
            //console.log("STOP")
            setTimeout(resolve, 1);
        }});
  }
}