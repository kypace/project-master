const request = require('request');
const express = require('express');
const hbs = require('hbs');

const tastedive = require('./tastedive');
const themoviedb = require('./themoviedb')
const auth = require('./auth')

/**
 * @type {Object} - Express application
 */
var app = express();

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartial('style', '/views/partials/style')
hbs.registerPartial('navigation', '/views/partials/navigation')

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded());

/**
 * @type {Object[]} - tracks current search results, used to add favorites
 */
var currentSearch;
/**
 * @type {Object} - tracks current search option
 */
var searchChoice;
/**
 * @type {String} - tracks current sort option for actor and director search
 */
var sortChoice;
/**
 * @type {Object[]} - tracks current user favorites
 */
var userFavorites = [];
/**
 * @type {Object[]} - tracks current user reviews
 */
var userReviews = [];

/**
 * Initial landing page, displays login
 */
app.get('/', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    response.render('log.hbs', {
        signupMsg: '',
        loginMsg: ''
    });
});

/**
 * checks validity of user registration info (all fields filled, available username, matching passwords)
 */
app.post('/signup', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    var msg = ''
    try {
        if (request.body.registerName.length <= 0 || request.body.registerPw.length <= 0)
            msg = '<h2 class="fail">Username or password missing</h2>'
        else if (!auth.checkAvailable(request.body.registerName))
            msg = '<h2 class="fail">Username already taken</h2>';
        else if (!auth.checkSamePass(request.body.registerPw, request.body.confirmPw))
            msg = '<h2 class="fail">Passwords do not match</h2>'
        else {
            msg = '<h2 class="success">Registered Successfully!</h2>'
            auth.store(request.body.registerName, request.body.registerPw);
        }
    } catch (err) {
        msg = '<h2 class="fail">Username or password missing</h2>'
    }
    response.render('log.hbs', {
        signupMsg: msg,
        loginMsg: ''
    });

});

/**
 * checks validity of user login info (Username existence, correct password)
 */
app.post('/login', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (auth.checkAvailable(request.body.loginName)) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: '<h2 class="fail">Username does not exist</h2>'
        });
    } else if (!auth.check(request.body.loginName, request.body.loginPw)) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: '<h2 class="fail">Incorrect password</h2>'
        });
    } else {
        userFavorites = auth.getFavorites();
        userReviews = auth.getReviews();
        response.redirect('/home');
    }
});

/**
 * displays home page if user is logged in
 */
app.get('/home', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (auth.isLogged())
        response.render('home.hbs');
    else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

/**
 * displays search page if user is logged in
 */
app.get('/search', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (auth.isLogged()) {
        response.render('search.hbs', {
            parsed: ''
        });
    } else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

// uses themoviedb.js to query API and get search results
app.post('/search', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */

    if (typeof request.body.personID != 'undefined') {
        themoviedb.creditSearch(request.body.personID).then((result) => {
            if (searchChoice == 'Actors') {
                if (sortChoice == 'Dates') {
                    currentSearch = themoviedb.sortReleaseDescending(result.cast);
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(currentSearch)
                    });
                } else if (sortChoice == 'Titles') {
                    currentSearch = themoviedb.sortTitleDescending(result.cast);
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(currentSearch)
                    });
                } else {
                    currentSearch = result.cast;
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(result.cast)
                    });
                }
            } else {
                var i = result.crew.length
                while (i--) {
                    if (result.crew[i].job != 'Director')
                        result.crew.splice(i, 1);
                }
                if (result.crew.length < 1) {
                    response.render('search.hbs', {
                        parsed: "<h2>No movies with directing credit found!</h2>"
                    });
                } else {
                    if (sortChoice == 'Dates') {
                        currentSearch = themoviedb.sortReleaseDescending(result.crew);
                        response.render('search.hbs', {
                            parsed: themoviedb.parseResults(currentSearch)
                        });
                    } else if (sortChoice == 'Titles') {
                        currentSearch = themoviedb.sortTitleDescending(result.crew);
                        response.render('search.hbs', {
                            parsed: themoviedb.parseResults(currentSearch)
                        });
                    } else {
                        currentSearch = result.crew;
                        response.render('search.hbs', {
                            parsed: themoviedb.parseResults(result.crew)
                        });
                    }
                }
            }
        }).catch((error) => {
            if (error == 'No results found for query') {
                response.render('search.hbs', {
                    parsed: "<h2>No results found for query</h2>"
                });
            } else if (error == 'Query is empty') {
                response.render('search.hbs', {
                    parsed: "<h2>Query is empty</h2>"
                });
            } else {
                response.render('search.hbs', {
                    parsed: "<h2>" + error + "</h2>"
                });
            }
        });
    } else {
        searchChoice = request.body.searchChoice;
        sortChoice = request.body.sortChoice;
        if (request.body.searchChoice == 'Titles') {
            themoviedb.search(request.body.searchQuery).then((result) => {
                currentSearch = result;
                if (sortChoice == 'Dates') {
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(themoviedb.sortReleaseDescending(result))
                    });
                } else if (sortChoice == 'Titles') {
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(themoviedb.sortTitleDescending(result))
                    });
                } else {
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(result)
                    });
                }
            }).catch((error) => {
                if (error == 'No results found for query') {
                    response.render('search.hbs', {
                        parsed: "<h2>No results found for query</h2>"
                    });
                } else if (error == 'Query is empty') {
                    response.render('search.hbs', {
                        parsed: "<h2>Query is empty</h2>"
                    });
                } else {
                    response.render('search.hbs', {
                        parsed: "<h2>" + error + "</h2>"
                    });
                }
            });
        } else {
            themoviedb.peopleSearch(request.body.searchQuery).then((result) => {
                currentSearch = result;
                response.render('search.hbs', {
                    parsed: themoviedb.generatePeople(result)
                });
            }).catch((error) => {
                if (error == 'No results found for query') {
                    response.render('search.hbs', {
                        parsed: "<h2>No results found for query</h2>"
                    });
                } else if (error == 'Query is empty') {
                    response.render('search.hbs', {
                        parsed: "<h2>Query is empty</h2>"
                    });
                } else {
                    response.render('search.hbs', {
                        parsed: "<h2>" + error + "</h2>"
                    });
                }
            });
        }
    }
});

/**
 * displays the user's favorites if user is logged in
 */
app.get('/favorites', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (auth.isLogged()) {
        userFavorites = [...new Set(userFavorites.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));
        response.render('favorites.hbs', {
            favorites: themoviedb.generateFavorites(userFavorites)
        });
    } else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

/**
 * Modify / Delete Favorites
 */
app.post('/favorites', (request, response) => {
    /**
     * @param {string} '/favorites' - a route
     * @param {function(request: Object, response: Object)} - callback for user's requests in /favorites
     */
    if (request.body.favPush === "yes") {
        /**
         * @public {Array} userFavorites - current user's favorites  
         */
        userFavorites.push(currentSearch[request.body.favIndex]);
        userFavorites = [...new Set(userFavorites.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));
    } else {
        userFavorites.splice(request.body.favIndex, 1);
        userFavorites = [...new Set(userFavorites.map(v => JSON.stringify(v)))].map(v => JSON.parse(v));
    }
    auth.setFavorites(userFavorites);
    response.render('favorites.hbs', {
        favorites: themoviedb.generateFavorites(userFavorites)
    });
});

/**
 * displays recommendations based on favorites
 */
app.get('/recommendations', (request, response) => {
    /**
     * @param {string} '/recommendations' - a route
     * @param {function(request: Object, response: Object)} - callback for user's requests in /recommendations
     */
    if (auth.isLogged()) {
        var recString = "";
        if (userFavorites.length > 0) {
            for (var i = 0; i < userFavorites.length; i++) {
                recString += userFavorites[i].title;
                if (i != userFavorites.length - 1)
                    recString += ", ";
            }
            tastedive.getRecommendations(recString).then((result) => {
                response.render('recommendations.hbs', {
                    recommendations: tastedive.parseRecommendations(result)
                });
            }).catch((error) => {
                response.render('recommendations.hbs', {
                    recommendations: "<h2>" + error + "</h2>"
                });
            });
        } else {
            response.render('recommendations.hbs', {
                recommendations: "<h2>No favorites found! Favorite at least one movie to generate recommendations.</h2>"
            });
        }
    } else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

/**
 * user created reviews and ratings of movies
 */
app.get('/user_review', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (auth.isLogged()) {
        userReviews = auth.getReviews();
        response.render('user_review.hbs', {
            reviews: themoviedb.generateReviews(userReviews)
        });
    } else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

/**
 * user created reviews and ratings of movies
 */
app.post('/user_review', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (request.body.revPush == 'yes') {
        var movie = currentSearch[request.body.revIndex];
        movie.rating = request.body.movieRating;
        movie.review = request.body.movieReview;
        userReviews.push(movie);
    } else {
        userReviews.splice(request.body.revIndex, 1);
    }
    auth.setReviews(userReviews)
    response.render('user_review.hbs', {
        reviews: themoviedb.generateReviews(userReviews)
    });
});

/**
 * page to write user review and rating
 */
app.get('/write_review', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    response.render('write_review.hbs', {
        movietitle: currentSearch[request.query.revIndex].title,
        movieposter: currentSearch[request.query.revIndex].poster_path,
        revIndex: request.query.revIndex
    });
});

/**
 * list of top rated movies based off of ratings
 */
app.get('/top_movies', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (auth.isLogged()) {
        response.render('top_movies.hbs', {
            top_movies: themoviedb.generateRankings(auth.sortTopMovies())
        });
    } else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

/**
 * settings page to change username or password
 */
app.get('/settings', (request, response) => {
    /**
     * @param {string} '/settings' - a route
     * @param {function(request: Object, response: Object)} - callback for user's requests in /settings
     */
    if (auth.isLogged()) {
        response.render('settings.hbs', {
            settingsMsg: ''
        });
    } else {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
    }
});

/**
 *  when user submits info change
 */
app.post('/settings', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (request.body.oldPw != request.body.confirmOldPw) {
        response.render('settings.hbs', {
            settingsMsg: '<h2>Old passwords do not match</h2>'
        });
    } else if (!auth.check(auth.getCurrentName(), request.body.oldPw)) {
        response.render('settings.hbs', {
            settingsMsg: '<h2>Old password is incorrect</h2>'
        });
    } else if ((request.body.newPw !== '' || request.body.confirmNewPw !== '') && request.body.newPw !== request.body.confirmNewPw) {
        console.log(request.body.newPw);
        console.log(request.body.confirmNewPw);
        response.render('settings.hbs', {
            settingsMsg: '<h2>New passwords do not match</h2>'
        });
    } else {
        auth.changeInfo(request.body);
        response.render('settings.hbs', {
            settingsMsg: '<h2>Your changes have been saved</h2>'
        });
    }
});

/**
 *  when user ends session
 */
app.get('/logout', (request, response) => {
    /**
     * @param {string} '/logout' - a route
     * @param {function(request: Object, response: Object)} - callback for user's requests in /logout
     */
    auth.logoff();
    response.render('log.hbs', {
        signupMsg: '',
    });
});

module.exports = app;