
const request = require("request");
const cheerio = require("cheerio");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/match-results"

request(url, cb);

function cb(error, response, html){
    if(error){
        console.log("some error occured");
    }else{
        console.log("recieved html")
        let $ = cheerio.load(html);

        let matchCards = $(".col-md-8.col-16");

        for(let i=0; i<matchCards.length; i++){
            let container = $(matchCards[i]).find(".match-cta-container .btn.btn-sm.btn-outline-dark.match-cta");

            let link = $(container[2]).attr("href");
            let fullLink = "https://www.espncricinfo.com"+link;

            console.log(fullLink);
        }
    }
}