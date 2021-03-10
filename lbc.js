// last ball commentary

const request = require("request");
const cheerio = require("cheerio");

url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595/delhi-capitals-vs-mumbai-indians-final-1237181/ball-by-ball-commentary"

request(url, cb);

function cb(error, response, html){
    if(error){
        console.log("some error occured");
    }else{
        console.log("recieved html")
        let $ = cheerio.load(html);

        let lastBallCom = $(".match-comment .d-flex.match-comment-padder.align-items-center .match-comment-long-text p");

        // console.log(ele.length);
        // const htm = lastBallCom.html();
        // console.log(htm)
        const text = $(lastBallCom[0]).text();
        console.log(text)

    }
}

// cheerio functions
/*
1. text()
2. html() -> returns the first matched result
3. find()
4. attr()
5. hasClass()
 */