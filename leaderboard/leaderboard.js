const request = require("request");
const cheerio = require("cheerio");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results"

// let statsArr = [];
let leaderBoardArr = [];
let gCount;
let count = 1;

request(url, cb);

function cb(error, response, html){
    if(error){
        console.log("some error occured");
    }else{
        console.log("recieved html \n");
        let $ = cheerio.load(html);

        let matchCards = $(".col-md-8.col-16");
        gCount = matchCards.length;
        console.log(gCount);
        for(let i=0; i<matchCards.length; i++){
            let container = $(matchCards[i]).find(".match-cta-container .btn.btn-sm.btn-outline-dark.match-cta");

            let link = $(container[2]).attr("href");
            let fullLink = "https://www.espncricinfo.com"+link;

           request(fullLink, cbsingle);
        }
    }
}

function cbsingle(error, response, html){
    if(error){
        console.log("some error occured");
        return;
    }
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
            // console.log(myTeam);
            let winTeamColBlock = $(colBlock[i]);
            printTeamStats(winTeamColBlock, $);
        }
    }

    if (count === gCount-1) {
            leaderBoardArr.sort((a, b) => b.runs-a.runs);
            console.table(leaderBoardArr);
            console.log("Completed!!")
    } else {
        console.log(count);
        count++;
    }
}

function printTeamStats(winTeamColBlock, $){
    let BatsmanRows = $(winTeamColBlock).find(".table.batsman tbody tr");

    for(let i=0; i<BatsmanRows.length; i++){
        let batsmanStats = $(BatsmanRows[i]).find("td");

        if(batsmanStats.length === 8){
            let playerName = $(batsmanStats[0]).text();
            let runs = $(batsmanStats[2]).text();

            // statsArr.push({
            //     Name: playerName,
            //     Runs: runs
            // })

            addToLeaderBoard(playerName, runs);
        }
    }
    // console.table(statsArr);
    // console.log("``````````````````````````````````````````````");
    // statsArr = [];
}

function addToLeaderBoard(playerName, cruns){
    doesExist = false;
    for(let i=0; i<leaderBoardArr.length; i++){
        if(leaderBoardArr[i].name == playerName){
            leaderBoardArr[i].runs += Number(cruns);
            doesExist = true;
            break;
        }
    }
    if(doesExist == false){
        leaderBoardArr.push({
            name: playerName,
            runs: Number(cruns)
        })
    }
}