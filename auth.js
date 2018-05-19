const bcrypt = require('bcrypt');
const fs = require('fs');

const saltRounds = 10;

const filename = 'auth.json'; // holds all user data

var users; // users loaded from file
var currentName = ''; // current user's username


/**
 * loads users from file
 */
var load = () => {
    /**
     * @return {object} users - this is the user loaded from the file
     */
    var readUser = fs.readFileSync(filename);
    users = JSON.parse(readUser);
}


/**
 * check if the username entered is available.
 */
var checkAvailable = (registerName) => {
    /**
     * @param {string} registerName - this is the username entered by user. 
     * @return {bool} result of username availability check.
     */
    load();
    var available = true;
    for (var i = 0; i < users.length; i++) {
        if (registerName === users[i].username)
            available = false;
    }
    return available;
}


/**
 * check if confirm password entry matches exactly as password entry.
 */
var checkSamePass = (registerPw, confirmPw) => {
    /**
     * @param {string} registerPW - this is the first password entered by user.
     * @param {string} confirmPW - this is the password re-entered by user for confirmation.
     * @return {bool} result of password confirmation.
     */    
    return registerPw === confirmPw;
}


/**
 * hashes password and store both username and password into json file.
 */
var store = (registerName, registerPw) => {
    /**
     * @param {string} registerName - this is the username entered by user.
     * @param {string} registerPW - this is the password.
     * @return {function} the function that writes username and password into a json file.
     */ 
    load();
    var hash = bcrypt.hashSync(registerPw, saltRounds);
    var user = {
        username: registerName,
        password: hash,
        favorites: [],
        reviews: []
    };
    users.push(user);
    fs.writeFileSync(filename, JSON.stringify(users));
}


/**
 * compares passwords with stored encryted version to check if login is authentic
 */
var check = (loginName, loginPw) => {
    /**
     * @param {string} LoginName - this is the username.
     * @param {string} LoginPW - this is the password encrypted and stored into a json file.
     * @return {bool} result of the authentication check.
     */ 
    load();
    var isCorrect = false
    for (var i = 0; i < users.length; i++) {
        user = users[i];
        if (loginName === user.username) {
            if (bcrypt.compareSync(loginPw, user.password)) {
                currentName = loginName;
                isCorrect = true;
            }
        }
    }
    return isCorrect;
}


/**
 * this returns a current list of user's favorites
 */
var getFavorites = () => {
    /**
     * @return {object} the current user's favorite list
     */
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username)
            return users[i].favorites;
    }
}


/**
 * select and set the current user's favorites
 */
var setFavorites = (favorites) => {
    /**
     * @param {string} favorites - this is the favorite movie that users would like to add.
     * @return {function} the function that writes(adds) the favorites to user json file.
     */
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username)
            users[i].favorites = favorites;
    }
    fs.writeFileSync(filename, JSON.stringify(users));
}

/**
 * this returns a list of the user's reviews
 */
var getReviews = () => {
    /**
     * @return {object} the current user's review list
     */
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username)
            return users[i].reviews;
    }
}


/**
 * select and set the current user's reviews
 */
var setReviews = (reviews) => {
    /**
     * @param {string} reviews - list of reviews to add
     * @return {function} the function that writes(adds) the reviews to user json file.
     */
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username)
            users[i].reviews = reviews;
    }
    fs.writeFileSync(filename, JSON.stringify(users));
}


/**
 * check if a user is logged in
 */
var isLogged = () => {
    /**
     * @return {bool} the result of user log check.
     */
    if (currentName === '')
        return false;
    else
        return true;
}


/**
 * log off user and remove current user name (currentName)
 */
var logoff = () => {
    currentName = '';
}


/**
 * changes user information including username and password
 */
var changeInfo = (changes) => {
    /**
     * @param {string} changes - this is the change that users make on their user info.
     * @return {function} the function updates information stored in the user json file.
     */
    var user;
    for (var i = 0; i < users.length; i++) {
        if (currentName === users[i].username) {
            user = users[i];
        }
    }
    if (changes.newUsername != '') {
        user.username = changes.newUsername;
        currentName = changes.newUsername;
    }
    if (changes.newPw === changes.confirmNewPw) {
        user.password = bcrypt.hashSync(changes.newPw, saltRounds);
    }
    fs.writeFileSync(filename, JSON.stringify(users));
}


/**
 * returns current user's username
 */
var getCurrentName = () => {
    /**
     * @return {string} currentName - this is the current user's username.
     */
    return currentName;
}


/**
 * exports functions
 */
module.exports = {
    load,
    checkAvailable,
    checkSamePass,
    store,
    check,
    getFavorites,
    setFavorites,
    getReviews,
    setReviews,
    logoff,
    isLogged,
    getCurrentName,
    changeInfo
};