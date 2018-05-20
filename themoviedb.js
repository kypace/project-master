const request = require('request');

/**
 * @type {String} - TheMovieDB API key
 */
var key = '4f7f94aba387fbfbfa50c54655774e78';

/**
 * Searches themovieDB for movies with the user's query
 */
var search = (query) => {
    /**
     * @param {String} query - this is the user's search query
     * @return {Object} returns the results of the movie search (or error message if no results or an erro)
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
            } else if (typeof body.errors != 'undefined') {
                reject('Query is empty');
            } else {
                resolve(
                    body.results
                );
            }
        });
    });
}


/**
 * Searches the movieDB for celebrities with user's query
 */
var peopleSearch = (query) => {
    /**
     * @param {String} query - this is the user's search query
     * @return {Object} returns the results of the people search (or an error message if no results)
     */
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/search/person?api_key=' + key + '&query=' + encodeURIComponent(query),
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.total_results < 1) {
                reject('No results found for query');
            } else if (typeof body.errors != 'undefined') {
                reject('Query is empty');
            } else {
                resolve(
                    body.results
                );
            }
        });
    });
}


/**
 * Searches the movieDB for actors/actrsses with user input (person's name)
 */
var creditSearch = (personid) => {
    return new Promise((resolve, reject) => {
        request({
            url: 'https://api.themoviedb.org/3/person/' + personid + '/movie_credits?api_key=' + key,
            json: true
        }, (error, response, body) => {
            if (error) {
                reject('Cannot connect to TheMovieDB');
            } else if (body.cast.length < 1 && body.crew.length < 1) {
                reject('No results found for query');
            }
            else {
                resolve(
                    body
                );
            }
        });
    });
}


/**
 * Reads the results of the search to the console log
 */
var readResults = (results) => {
    /**
     * @param {Object[]} results - this is the list of search results
     */
    for (var i = 0; i < results.length; i++) {
        console.log(`Title: ${results[i].title}`);
        console.log(`Description: ${results[i].overview}`);
    }
}

/**
 * Creates the on-screen list of movies, artwork and desciptions from the search
 */
var parseResults = (results) => {
    /**
     * @param {Object[]} results - this is the list of search results
     * @return {String} this is the styling and divs of the search page
     */
    var parsed = "";
    for (var i = 0; i < results.length; i++) {
        var overview = results[i].overview;
        if (overview.length > 400)
            overview = overview.substring(0, 400) + "..";
        parsed += `
        <div class="bg-light mDiv col-lg-3 col-md-4 col-xs-12">
            <img src='http://image.tmdb.org/t/p/w92/${results[i].poster_path}' class="mb-3 mPoster img-thumbnail rounded text-center" style="display:inline-block;" />
            <div class="p-3 text-dark mText" >
                <strong>Title</strong>: ${results[i].title}<br>
                <strong>Overview</strong>: ${overview}<br>
                <strong>Release Date</strong>: ${results[i].release_date}<br>
                <form action="/favorites" enctype="application/json" method="post">
                    <input id= "favIndex" name="favIndex" type="hidden" value=${i} />
                    <input id= "favPush" name="favPush" type="hidden" value="yes" />
                    <input id="Favorite" class="btn btn-danger fButton" action="/favorites" type="submit" value="Favorite" />
                </form>
                <form action="/write_review" enctype="application/json" method="get">
                    <input id="revIndex" name="revIndex" type="hidden" value=${i} />
                    <input id= "revPush" name="revPush" type="hidden" value="yes" />
                    <input id="WriteReview" class="btn btn-danger wButton" action="/write_review" type="submit" value="Write Review" />
                </form>
            </div>
        </div>`;
    }
    return parsed.replace(/\s\s+/g, ' ');
}

/**
 * Creates the on-screen list of movies, artwork and desciptions for the favorites page
 */
var generateFavorites = (favorites) => {
    /**
     * @param {Object[]} favorites - this is the list of favorites saved by the user
     * @return {String} this is the styling and divs of the favorite page, or a message if no favorites have been saved 
     */
    var generated = "";
    if (favorites.length < 1) {
        return "<h2>No favorites have been saved!</h2>";
    }
    for (var i = 0; i < favorites.length; i++) {
        var overview = favorites[i].overview;
        if (overview.length > 600)
            overview = overview.substring(0, 600) + "..";
        generated += `
        <div class="bg-light mDiv col-lg-3 col-md-4 col-xs-12">
            <img src='http://image.tmdb.org/t/p/w92/${favorites[i].poster_path}' class="mb-3 mPoster img-thumbnail rounded float-left"/>
            <div class="p-3 text-dark mText">
                <strong>Title</strong>: ${favorites[i].title}<br>
                <strong>Overview</strong>: ${overview}<br>
                <strong>Release Date</strong>: ${favorites[i].release_date}<br>
                <form action="/favorites" enctype="application/json" method="post">
                    <input id= "favIndex" name="favIndex" type="hidden" value=${i} />
                    <input id= "favPush" name="favPush" type="hidden" value="no" />
                    <input id="Unfavorite" class="btn btn-danger fButton" action="/favorites" type="submit" value="Unfavorite" />
                </form>
            </div>
        </div>`;
    }
    return generated.replace(/\s\s+/g, ' ');
}

/**
 * Creates the on-screen list of movies, ratings and reviews for the user review page
 */
var generateReviews = (reviews) => {
    /**
     * @param {Object[]} reviews - this is the list of reviews saved by the user
     * @return {String} this is the styling and divs of the review page, or a message if no reviews have been saved 
     */
    var generated = "";
    if (reviews.length < 1) {
        return "<h2>No reviews have been saved!</h2>";
    }
    for (var i = 0; i < reviews.length; i++) {
        var overview = reviews[i].overview;
        if (overview.length > 600)
            overview = overview.substring(0, 600) + "..";
        generated += `
        <div class="bg-light mDiv col-lg-3 col-md-4 col-xs-12">
            <img src='http://image.tmdb.org/t/p/w92/${reviews[i].poster_path}' class="mb-3 mPoster img-thumbnail rounded float-left"/>
            <div class="p-3 text-dark mText">
                <strong>Title</strong>: ${reviews[i].title}<br>
                <strong>Rating</strong>: ${reviews[i].rating}<br>
                <strong>Review</strong>: ${reviews[i].review}<br>
                <form action="/user_review" enctype="application/json" method="post">
                    <input id= "revIndex" name="revIndex" type="hidden" value=${i} />
                    <input id= "revPush" name="revPush" type="hidden" value="no" />
                    <input id="Delete" class="btn btn-danger fButton" type="submit" value="Delete" />
                </form>
            </div>
        </div>`;
    }
    return generated.replace(/\s\s+/g, ' ');
}

/**
 * Creates the on-screen list of celebrities
 */
var generatePeople = (results) => {
    /**
     * @param {Object[]} results - this is the list of celebrities searched by user
     * @return {String} this is the styling and divs of the search page
     */
    var parsed = "";

    for (var i = 0; i < results.length; i++) {
        parsed += `
        <div class="bg-light mDiv col-lg-3 col-md-4 col-xs-12">
            <img src='http://image.tmdb.org/t/p/w92/${results[i].profile_path}' class="mb-3 pPoster img-thumbnail rounded"/>
            <div class="pDesc">
                <strong>Name</strong>: ${results[i].name}<br>
                <strong>Known For</strong> :<br>`
        for (var j = 0; j < results[i].known_for.length; j++) {
            parsed += `<img src='http://image.tmdb.org/t/p/w92/${results[i].known_for[j].poster_path}' class="mb-3 mPoster2 img-thumbnail rounded"/>`
        }
        parsed += `<form action="/search" enctype="application/json" method="post">
                     <input id="personID" name="personID" type="hidden" value=${results[i].id} />
                     <input id="personSubmit" class="btn btn-danger fButton" action="/search" type="submit" value="Find Movies" />
                </form>
            </div>
        </div>`;
    }

    return parsed.replace(/\s\s+/g, ' ');
}

/**
 * Sorts the release date of the movies in descending order
 */
var sortReleaseDescending = (results) => {
    /**
     * @param {Object[]} results - this is the list of results searched by user
     * @return {String} this is the sorted list of the results.
     */
    var max = results.length;
    var sorted = [];
    for (var i = 0; i < max; i++) {
        var bigindex = 0;
        for (var j = 0; j < results.length; j++) {
            if (results[j].release_date > results[bigindex].release_date)
                bigindex = j;
        }
        sorted.push(results[bigindex])
        results.splice(bigindex, 1)
    }
    return sorted;
}

/**
 * Sorts the release date of the movies in ascending order
 */
var sortReleaseAscending = (results) => {
    /**
     * @param {Object[]} results - this is the list of results searched by user
     * @return {String} this is the sorted list of the results.
     */
    var max = results.length;
    var sorted = [];
    for (var i = 0; i < max; i++) {
        var bigindex = 0;
        for (var j = 0; j < results.length; j++) {
            if (results[j].release_date < results[bigindex].release_date)
                bigindex = j;
        }
        sorted.push(results[bigindex])
        results.splice(bigindex, 1)
    }
    return sorted;
}

/**
 * Sorts the movie title in descending order
 */
var sortTitleDescending = (results) => {
    /**
     * @param {Object[]} results - this is the list of results searched by user
     * @return {String} this is the sorted list of the results.
     */
    var max = results.length;
    var sorted = [];

    for (var i = 0; i < max; i++) {
        var bigindex = 0;
        for (var j = 0; j < results.length; j++) {
            if (results[j].title < results[bigindex].title)
                bigindex = j;
        }
        sorted.push(results[bigindex])
        results.splice(bigindex, 1)
    }
    return sorted;
}

/**
 * Sorts the movie title in ascending order
 */
var sortTitleAscending = (results) => {
    /**
     * @param {Object[]} results - this is the list of results searched by user
     * @return {String} this is the sorted list of the results.
     */
    var max = results.length;
    var sorted = [];

    for (var i = 0; i < max; i++) {
        var bigindex = 0;
        for (var j = 0; j < results.length; j++) {
            if (results[j].title > results[bigindex].title)
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
    creditSearch,
    readResults,
    parseResults,
    generateFavorites,
    generateReviews,
    generatePeople,
    sortReleaseDescending,
    sortReleaseAscending,
    sortTitleDescending,
    sortTitleAscending
};