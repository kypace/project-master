const request = require('request');

var key = '4f7f94aba387fbfbfa50c54655774e78';

/**
 * This function searches the movieDB with the user's query
 */
var search = (query) => {
    /**
     * @param {string} query - this is the user's search query
     * @return {object} - returns the results of the search (or error message if no results or an erro)
     */
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/search/movie?api_key=' + key + '&query=' + encodeURIComponent(query),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.total_results < 1) {
                reject('No results found for query');
            } else {
                resolve(
                    body.results
                );
            }
        });
    });
}

var peopleSearch = (query) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/search/person?api_key=' + key + '&query=' + encodeURIComponent(query),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.total_results < 1) {
                reject('No results found for query');
            } else {
                resolve(
                    body.results
                );
            }
        });
    });
}

var actorCreditSearch = (personid) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/person/' + personid + '/movie_credits?api_key=' + key + '&query=' + encodeURIComponent(query),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.cast.length < 1) {
                reject('No results found for query');
            } else {
                resolve(
                    body.cast
                );
            }
        });
    });
}

var directorCreditSearch = (personid) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/person/' + personid + '/movie_credits?api_key=' + key + '&query=' + encodeURIComponent(query),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.crew.length < 1) {
                reject('No results found for query');
            } else {
                resolve(
                    body.crew
                );
            }
        });
    });
}


/**
 * This function reads the results of the search to the console log
 */
var readResults = (results) => {
    /**
     * @param {array} results - this is the list of search results
     */
    for (var i = 0; i < results.length; i++) {
        console.log(`Title: ${results[i].title}`);
        console.log(`Description: ${results[i].overview}`);
    }
}

/**
 * This function creates the on-screen list of movies, artwork and desciptions from the search.
 */
var parseResults = (results) => {
    /**
     * @param {array} results - this is the list of search results
     * @return {string} - this is the styling and divs of the search page
     */
    var parsed = "";
    for (var i = 0; i < results.length; i++) {
        var overview = results[i].overview;
        if (overview.length > 250)
            overview = overview.substring(0, 250) + "..";
        parsed += `
        <div class='border border-light p-3 mb-3 col-3 bg-dark'>
            <img src='http://image.tmdb.org/t/p/w92/${results[i].poster_path}' class='mPoster'/>
            <div class='p-3 mb-2 mTextBox text-light text-left content'>
                <strong>Title</strong>: ${results[i].title}<br>
                <strong>Overview</strong>: ${overview}<br>
                <strong>Release Date</strong>: ${results[i].release_date}<br>
                <form action="/favorites" enctype="application/json" method="post">
                    <input id= "favIndex" name="favIndex" type="hidden" value=${i} />
                    <input id= "favPush" name="favPush" type="hidden" value="yes" />
                    <input class="fButton btn btn-secondary" id="Favorite" action="/favorites" type="submit" value="Favorite" />
                </form>
            </div>
        </div>`;
    }
    return parsed;
}

/**
 * This function creates the on-screen list of movies, artwork and desciptions for the favorites page.
 */
var generateFavorites = (favorites) => {
    /**
     * @param {array} favorites - this is the list of favorites saved by the user
     * @return {string} - this is the styling and divs of the favorite page, or a message if no favorites have been saved 
     */
    var generated = "";
    if (favorites.length < 1) {
        return "<h2>No favorites have been saved!</h2>";
    }
    for(var i = 0; i < favorites.length; i++) {
        var overview = favorites[i].overview;
        if (overview.length > 250)
            overview = overview.substring(0, 250) + "..";
        generated += `
        <div class='border border-light p-3 mb-3 col-3 bg-dark'>
            <img src='http://image.tmdb.org/t/p/w92/${favorites[i].poster_path}' class='mPoster'/>
            <div class='p-3 mb-2 mTextBox text-light text-left content'>
                <strong>Title</strong>: ${favorites[i].title}<br>
                <strong>Overview</strong>: ${overview}<br>
                <strong>Release Date</strong>: ${favorites[i].release_date}<br>
                <form action="/favorites" enctype="application/json" method="post">
                    <input id= "favIndex" name="favIndex" type="hidden" value=${i} />
                    <input id= "favPush" name="favPush" type="hidden" value="no" />
                    <input class="fButton btn btn-secondary" id="Unfavorite" action="/favorites" type="submit" value="Unfavorite" />
                </form>
            </div>
        </div>`;
    }
    return generated;
}

var generatePeople = (results) => {
    var parsed = "";
    for (var i = 0; i < results.length; i++) {
        parsed += `
        <div style='background-color:#FFFCF8; width:100%; height:20%; text-align:left; border-top:1px solid black; '>
            <img src='http://image.tmdb.org/t/p/w92/${results[i].profile_path}' style='left=1vw; margin:5px; height:90%; vertical-align: top; display: inline; float: left'/>
            <div style='width:100%; height:10%; vertical-align: top; display: inline'>
                <strong>Name</strong>: ${results[i].name}<br>
            </div>
        </div>`;
    }
    return parsed;
}

var sortReleaseDescending = (results) => {
    var max = results.length;
    var sorted = [];
    var bigindex = 0;
    for (var i = 0; i < max; i++) {
        for (var j = 0; j < results.length; j++) {
            if (results[j] > results[bigindex])
                bigindex = j;
        }
        sorted.push(results[bigindex])
        results.splice(bigindex, 1)
    }
    return sorted;
}

var sortReleaseAscending = (results) => {
    var max = results.length;
    var sorted = [];
    var bigindex = 0;
    for (var i = 0; i < max; i++) {
        for (var j = 0; j < results.length; j++) {
            if (results[j] < results[bigindex])
                bigindex = j;
        }
        sorted.push(results[bigindex])
        results.splice(bigindex, 1)
    }
    return sorted;
}

module.exports = {
    search,
    peopleSearch,
    actorCreditSearch,
    directorCreditSearch,
    readResults,
    parseResults,
    generateFavorites,
    generatePeople,
    sortReleaseDescending,
    sortReleaseAscending
};

