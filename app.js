const request = require('request');
const express = require('express');
const hbs = require('hbs');

const tastedive = require('./tastedive');
const themoviedb = require('./themoviedb')
const auth = require('./auth')

var app = express();

hbs.registerPartials(__dirname + '/views/partials');
hbs.registerPartial('style', '/views/partials/style')
hbs.registerPartial('navigation', '/views/partials/navigation')

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded());

var currentSearch; // tracks current search results, used to add favorites
var searchChoice; // tracks current search option
var sortChoice; // tracks current sort option for actor and director search
var userFavorites = []; // tracks current user favorites

/**
 * Used to check if the user has logged in when accessing certain URLs.
 */
var checkLogin = (response) => {
    /**
     * @param {Object} response - Express HTTP response object
     * @return {bool} - bool determining if user is logged in or not
     */
    if (!auth.isLogged()) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: ''
        });
        return false;
    } else
        return true;
}

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
            msg = '<h2>Username or password missing</h2>'
        else if (!auth.checkAvailable(request.body.registerName))
            msg = '<h2>Username unavailable</h2>';
        else if (!auth.checkSamePass(request.body.registerPw, request.body.confirmPw))
            msg = '<h2>Passwords do not match</h2>'
        else {
            msg = '<h2>Registered Successfully!</h2>'
            auth.store(request.body.registerName, request.body.registerPw);
        }
    } catch (err) {
        msg = '<h2>Username or password missing</h2>'
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
            loginMsg: '<h2>Username does not exist</h2>'
        });
    } else if (!auth.check(request.body.loginName, request.body.loginPw)) {
        response.render('log.hbs', {
            signupMsg: '',
            loginMsg: '<h2>Incorrect password</h2>'
        });
    } else {
        userFavorites = auth.getFavorites();
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
    if (checkLogin(response))
        response.render('home.hbs');
});

/**
 * displays search page if user is logged in
 */
app.get('/search', (request, response) => {
    /**
     * @param {Object} request - Express HTTP request object
     * @param {Object} response - Express HTTP response object
     */
    if (checkLogin(response)) {
        response.render('search.hbs', {
            parsed: ''
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
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(themoviedb.sortReleaseDescending(result.cast))
                    });
                } else if (sortChoice == 'Titles') {
                    response.render('search.hbs', {
                        parsed: themoviedb.parseResults(themoviedb.sortTitleDescending(result.cast))
                    });
                } else {
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
                        response.render('search.hbs', {
                            parsed: themoviedb.parseResults(themoviedb.sortReleaseDescending(result.crew))
                        });
                    } else if (sortChoice == 'Titles') {
                        response.render('search.hbs', {
                            parsed: themoviedb.parseResults(themoviedb.sortTitleDescending(result.crew))
                        });
                    } else {
                        response.render('search.hbs', {
                            parsed: themoviedb.parseResults(result.crew)
                        });
                    }
                }
            }
            currentSearch = result;

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
    if (checkLogin(response)) {
        response.render('favorites.hbs', {
            favorites: themoviedb.generateFavorites(userFavorites)
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
        auth.setFavorites(userFavorites);
    } else {
        userFavorites.splice(request.body.favIndex, 1);
        auth.setFavorites(userFavorites);
    }
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
    if (checkLogin(response)) {
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
    if (checkLogin(response)) {
        response.render('settings.hbs', {
            settingsMsg: ''
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
        loginMsg: '<h2>You have been successfully logged out!</h2>'
    });
});

module.exports = app;