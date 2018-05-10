const request = require('request');

var key = '302969-StudentP-ITG1R8RP';


/**
 * Query made from favorites sent to tastedive api
 */
var getRecommendations = (seed) => {
    /**
    * @param {object} seed 
    * @param {object} resolve
    * @param {object} reject
    * @param {string} error
    * @param {string} response
    * @param {string} body
    * @return {object} Promise - returns similar results for recommendations 
    */
    return new Promise((resolve, reject) => {
        request({
            url: 'https://tastedive.com/api/similar?type=movies&info=1&k=' + key + '&q=' + encodeURIComponent(seed),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to Tastedive');
            } else if (body.Similar.Results.length< 1) {
                reject('No recommendations found for query');
            } else {
                resolve(
                    body.Similar.Results
                );
            }
        });
    });
}

/**
 * This was only used for testing purposes
 */
var readRecommendations = (reclist) => {
    for (var i = 0; i < reclist.length; i++) {
        console.log(`Name: ${reclist[i].Name}`);
        console.log(`Description: ${reclist[i].wTeaser}`);
    }
}

/**
 * Displays recommendations with teasers into html 
 */
var parseRecommendations = (reclist) => {
    /**
    * @param {object} reclist - the recommended list 
    * @return {object} generated - arrays of movies shown in html with teasers
    */
	var generated = "";
	for (var i = 0; i < reclist.length; i++) {
        var teaser = reclist[i].wTeaser;
        if (teaser.length > 600)
            teaser = teaser.substring(0, 600) + "..";
        generated += `
        <div class='col-2'></div>
        <div class='p-2 col-8 bg-dark recDiv content'>
            <iframe src='${reclist[i].yUrl}' allowFullScreen class="embed-responsive embed-responsive-16by9 mTrailer"></iframe> 
            <div class='pl-3 ml-2 mb-2 bg-dark text-light text-justify'>

        <div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black;'>
            <iframe src='${reclist[i].yUrl}' allowFullScreen style='left=1vw; margin:5px; vertical-align: top; height:85%; display: inline; float: left'></iframe> 
            <div style='width:100%; height:10%; vertical-align: top; display: inline'>

                <strong>Title</strong>: ${reclist[i].Name}<br>
                <strong>Overview</strong>: ${teaser}<br>
            </div>
        </div>
        <div class='col-2'></div>`;
    }
    return generated;
}

module.exports = {
    getRecommendations,
    readRecommendations,
    parseRecommendations
};