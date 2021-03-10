
const request = require("request");
const cheerio = require("cheerio");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/full-scorecard"

function singleMatchExtractor(url){
    request(url, cb);
}

let statsArr = [];

function cb(error, response, html){
    if(error){
        console.log("some error occured");
    }else{
        let $ = cheerio.load(html);

        let bothTeams = $(".event .teams>.team");
        let myTeam;
        for(let i=0; i<bothTeams.length; i++){
            let lossingTeam = $(bothTeams[i]).hasClass("team-gray");
            if(lossingTeam === false){
                myTeam = $(bothTeams[i]).find(".name-detail .name-link").text();
            }
        }
        
        let colBlock = $(".Collapsible");

        let bothInningsTeamName = $(".Collapsible .header-title.label");
        for(let i=0; i<bothInningsTeamName.length; i++){
            let teamName = $(bothInningsTeamName[i]).text().split("INNINGS")[0].trim();

            if(teamName === myTeam){
                console.log(myTeam);
                let winTeamColBlock = $(colBlock[i]);
                printTeamStats(winTeamColBlock, $);
            }
        }
    }
}

function printTeamStats(winTeamColBlock, $){
    let BatsmanRows = $(winTeamColBlock).find(".table.batsman tbody tr");

    for(let i=0; i<BatsmanRows.length; i++){
        let batsmanStats = $(BatsmanRows[i]).find("td");

        if(batsmanStats.length === 8){
            let playerName = $(batsmanStats[0]).text();
            let runs = $(batsmanStats[2]).text();

            statsArr.push({
                Name: playerName,
                Runs: runs
            })
        }
    }
    console.table(statsArr);
    console.log("``````````````````````````````````````````````");
    statsArr = [];
}

module.exports = ({
    fn:singleMatchExtractor
});