const request = require('request');
const cheerio = require('cheerio');
const path = require("path");
const fs = require("fs");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595"

request(url, cb);

const teamNames = {
    MI: "Mumbai Indians",
    DC: "Delhi Capitals",
    SRH: "Sunrisers Hyderabad",
    RCB: "Royal Challengers Bangalore",
    KKR: "Kolkata Knight Riders",
    PBKS: "Punjab Kings",
    CSK: "Chennai Super Kings",
    RR: "Rajasthan Royals"
}

function cb(error, response, html){
    if(error){
        console.log(error);
    }else{
        console.log("recieved html \n");
        const $ = cheerio.load(html);

        const mainFolderPath = path.join(__dirname, "ipl_2020");
        if(fs.existsSync(mainFolderPath) === false){
            fs.mkdirSync(mainFolderPath);
        }

        const tableRow = $(".widget-container .card.content-block.w-100.sidebar-widget tbody tr")
        console.log(tableRow.length);
        for(let i=0; i<tableRow.length; i++){
            let rowData = $(tableRow[i]).find("td");
            let teamName = $(rowData[0]).text().trim();
            
            const teamFolderPath = path.join(mainFolderPath, teamNames[teamName]);
            if(fs.existsSync(teamFolderPath) === false){
                fs.mkdirSync(teamFolderPath);
            }

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
    let BolwerRows = $(teamColBlock).find(".table.bowler tbody tr");

    const teamName = $(teamColBlock).find(".header-title.label").text().split("INNINGS")[0].trim();

    const batsmanStats = {
       ...matchInfo,
        opponent,
        result: winner + " wins"
    }

    const bowlerStats = {
        ...matchInfo,
        opponent,
        result: winner + " wins"
    }

    generateBowlerData(BolwerRows, bowlerStats, teamName, $);
    generateBatsmanData(BatsmanRows, batsmanStats, teamName, $);
}

function createFile(filePath){
    fs.openSync(filePath, 'w');
}

function generateBatsmanData(BatsmanRows, batsmanStats, teamName, $){
    let batsmanStatsArr = [];

    for(let i=0; i<BatsmanRows.length; i++){
        let batsmanAttrCol = $(BatsmanRows[i]).find("td");

        if(batsmanAttrCol.length === 8){
            let playerName = $(batsmanAttrCol[0]).text();
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

            let folderPath = path.join(__dirname, "ipl_2020/" +teamName);
            let filePath = path.join(folderPath, playerName.split(" ").join("_") + ".json");

            batsmanStatsArr.push(batsmanStats);

            if(fs.existsSync(filePath) === false){
                createFile(filePath);
                let jsonString = JSON.stringify(batsmanStatsArr, null, "\t");
                fs.writeFileSync(filePath, jsonString)
            }else{
                let rawdata = fs.readFileSync(filePath);
                let stats = JSON.parse(rawdata);
                stats.forEach(obj => batsmanStatsArr.push(obj));

                let jsonString = JSON.stringify(batsmanStatsArr, null, "\t");
                fs.writeFileSync(filePath, jsonString)
            }
                
        }
    }
}

function generateBowlerData(BolwerRows, bowlerStats, teamName, $){
    let bowlerStatsArr = [];

    for(let i=0; i<BolwerRows.length; i++){
        let bowlerAttrCol = $(BolwerRows[i]).find("td");
        let bowlerName = $(bowlerAttrCol[0]).text();

        bowlerStats["Name"] = bowlerName;
        bowlerStats["Runs_Given"] = $(bowlerAttrCol[3]).text();
        bowlerStats["Wickets"] = $(bowlerAttrCol[4]).text();
        bowlerStats["ECO"] = $(bowlerAttrCol[5]).text();

        let folderPath = path.join(__dirname, "ipl_2020/" +teamName);
        let filePath = path.join(folderPath, bowlerName.split(" ").join("_") + ".json");

        bowlerStatsArr.push(bowlerStats);

        if(fs.existsSync(filePath) === false){
            createFile(filePath);
            let jsonString = JSON.stringify(bowlerStatsArr, null, "\t");
            fs.writeFileSync(filePath, jsonString)
        }else{
            let rawdata = fs.readFileSync(filePath);
            let stats = JSON.parse(rawdata);
            stats.forEach(obj => bowlerStatsArr.push(obj));

            let jsonString = JSON.stringify(bowlerStatsArr, null, "\t");
            fs.writeFileSync(filePath, jsonString)
        }
    }
}

