const request = require('request');

/**
 * @type {String} - Tastedive API key
 */
var key = '302969-StudentP-ITG1R8RP';


/**
 * Query made from favorites sent to tastedive api
 */
var getRecommendations = (seed) => {
    /**
     * @param {Object} seed 
     * @param {Object} resolve
     * @param {Object} reject
     * @param {String} error
     * @param {String} response
     * @param {String} body
     * @return {Object} Promise - returns similar results for recommendations 
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
 * outputs all recommendations, used for initial testing
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
     * @param {Object} reclist - the recommended list 
     * @return {Object} generated - arrays of movies shown in html with teasers
     */
	var generated = "";
	for (var i = 0; i < reclist.length; i++) {
        var teaser = reclist[i].wTeaser;
        if (teaser.length > 600)
            teaser = teaser.substring(0, 600) + "..";
        generated += `
        <div class="col-xs-12 col-md-6 col-lg-4 recDiv bg-light text-dark">
            <iframe src='${reclist[i].yUrl}' allowFullScreen class ="mr-3 embed-responsive-item mTrailer"></iframe> 
            <div class="m-3 text-dark">
                <strong>Title</strong>: ${reclist[i].Name}<br>
                <strong>Overview</strong>: ${teaser}<br>
            </div>
        </div>`;
    }
    return generated.replace(/\s\s+/g, ' ');
}

module.exports = {
    getRecommendations,
    readRecommendations,
    parseRecommendations
};