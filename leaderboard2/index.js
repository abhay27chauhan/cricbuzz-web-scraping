const request = require('request');
const cheerio = require('cheerio');
const path = require("path");
const fs = require("fs");

const url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"

request(url, cb);

function cb(error, response, html){
    if(error){
        console.log(error);
    }else{
        console.log("recieved html \n");
        const $ = cheerio.load(html);

        const folderPath = path.join(__dirname, "ipl_2020");
        if(fs.existsSync(folderPath) === false){
            fs.mkdirSync(folderPath);
        }

        const links = $(".jsx-850418440.navbar.navbar-expand-lg.sub-navbar .jsx-850418440.custom-scroll ul li");

        const link = $(links[1]).find("a").attr("href");
        const fullLink = "https://www.espncricinfo.com" + link;

        generateLeaderboard(fullLink);
    }
}

function generateLeaderboard(url){
    request(url, cb);

    function cb(error, response, html){
        if(error){
            console.log(error);
            return;
        }

        const $ = cheerio.load(html);

        let matchCards = $(".col-md-8.col-16");
        console.log(matchCards.length);

        for(let i=0; i<matchCards.length; i++){
            let container = $(matchCards[i]).find(".match-cta-container .btn.btn-sm.btn-outline-dark.match-cta");

            let link = $(container[2]).attr("href");
            let fullLink = "https://www.espncricinfo.com"+link;

           scorecard(fullLink);
        }
    }
}

function scorecard(url){
    request(url, cb);

    function cb(error, response, html){
        if(error){
            console.log(error);
            return;
        }

        const $ = cheerio.load(html);

        const matchInfoArr = $(".match-info.match-info-MATCH .description").text().split(",");

        const matchDate = matchInfoArr[2].trim();
        const matchNum = matchInfoArr[0].trim();
        const matchPlace = matchInfoArr[1].trim();

        const matchInfo = {
            matchDate,
            matchNum, 
            matchPlace
        }

        let bothTeams = $(".event .teams>.team");
        let winTeam;
        let loseTeam;
        for(let i=0; i<bothTeams.length; i++){
            let lossingTeam = $(bothTeams[i]).hasClass("team-gray");
            if(lossingTeam === false){
                winTeam = $(bothTeams[i]).find(".name-detail .name-link").text();
            }else{
                loseTeam = $(bothTeams[i]).find(".name-detail .name-link").text();
            }
        }

        let colBlock = $(".Collapsible");

        let bothInningsTeamName = $(".Collapsible .header-title.label");
        for(let i=0; i<bothInningsTeamName.length; i++){
            let teamName = $(bothInningsTeamName[i]).text().split("INNINGS")[0].trim();

            if(teamName === winTeam){
                let winTeamColBlock = $(colBlock[i]);
                generateTeamStats(winTeamColBlock, loseTeam, winTeam, matchInfo, $);
            }else{
                let loseTeamColBlock = $(colBlock[i]);
                generateTeamStats(loseTeamColBlock, winTeam, winTeam, matchInfo, $);
            }
        }
    }
}

function generateTeamStats(teamColBlock, opponent, winner, matchInfo, $){
    let BatsmanRows = $(teamColBlock).find(".table.batsman tbody tr");

    const teamName = $(teamColBlock).find(".header-title.label").text().split("INNINGS")[0].trim();

    const batsmanStats = {
       ...matchInfo,
        opponent,
        result: winner + " wins"
    }

    generateBatsmanData(BatsmanRows, batsmanStats, teamName, $);
}

function generateBatsmanData(BatsmanRows, batsmanStats, teamName, $){

    for(let i=0; i<BatsmanRows.length; i++){
        let batsmanAttrCol = $(BatsmanRows[i]).find("td");

        if(batsmanAttrCol.length === 8){
            let batsmanStatsArr = [];

            let playerName = $(batsmanAttrCol[0]).text().trim();
            let runs = $(batsmanAttrCol[2]).text();
            let balls = $(batsmanAttrCol[3]).text();
            let fours = $(batsmanAttrCol[5]).text();
            let sixes = $(batsmanAttrCol[6]).text();
            let SR = $(batsmanAttrCol[7]).text();

            batsmanStats["Name"] = playerName;
            batsmanStats["runs"] = runs;
            batsmanStats["balls_played"] = balls;
            batsmanStats["fours"] = fours;
            batsmanStats["sixes"] = sixes;
            batsmanStats["SR"] = SR;

            let folderPath = path.join(__dirname, "ipl_2020", teamName);
            if(fs.existsSync(folderPath) === false){
                fs.mkdirSync(folderPath);
            }
            
            let filePath = path.join(folderPath, playerName + ".json");

            if(fs.existsSync(filePath)){
                let rawdata = fs.readFileSync(filePath);
                batsmanStatsArr = JSON.parse(rawdata);
            }

            batsmanStatsArr.push(batsmanStats);
            let jsonString = JSON.stringify(batsmanStatsArr, null, "\t");
            fs.writeFileSync(filePath, jsonString)        
        }
    }
}
