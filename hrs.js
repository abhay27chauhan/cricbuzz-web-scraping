// highest run scorer

const request = require("request");
const cheerio = require("cheerio");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard"

request(url, cb);

function cb(error, response, html){
    if(error){
        console.log("some error occured");
    }else{
        console.log("recieved html")
        let $ = cheerio.load(html);

        let table = $(".table.batsman");
        let batsman;
        let hruns = 0;

        for(let i=0; i<table.length; i++){
            let batsmanRow = $(table[i]).find("tr");

            for(let j=0; j<batsmanRow.length; j++){
                let batsmanStats = $(batsmanRow[j]).find("td");

                if(batsmanStats.length == 8){
                    let batsmanName = $(batsmanStats[0]).text();
                    let batsmanRuns = Number.parseInt($(batsmanStats[2]).text());

                    if(batsmanRuns >= hruns){
                        hruns = batsmanRuns;
                        batsman = batsmanName;
                    }

                    console.log(batsmanName, "    ", batsmanRuns);
                }
            }

            console.log("--------------------------------------");
        }
        console.log("highest run scorer: ", batsman, " " , hruns)
    }
}