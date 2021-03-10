// highest wicket taker

const request = require("request");
const cheerio = require("cheerio");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard"

request(url, cb);

let statsArr = [];

function cb(error, response, html){
    if(error){
        console.log("some error occured");
    }else{
        console.log("recieved html")
        let $ = cheerio.load(html);

        let table = $(".table.bowler");
        let hwt = 0;
        let hwtker;
        for(let i=0; i<table.length; i++){

            let teamBowlers = $(table[i]).find("tr");
            for(let j=0; j<teamBowlers.length; j++){
                let bowlerData = $(teamBowlers[j]).find("td");
                let bowlerName = $(bowlerData[0]).text();
                let bowlerWicket = $(bowlerData[4]).text();
                if(bowlerWicket> hwt){
                    hwtker = bowlerName;
                    hwt = bowlerWicket;
                }

                statsArr.push({
                    Name: bowlerName,
                    Wicket: bowlerWicket
                })

                
            }
            console.table(statsArr);
            console.log("--------------------------------------------");
            statsArr = [];
        }

        console.log("Highest Wicket Taker: ", hwtker, " No. of Wickets: ", hwt);

    }
}