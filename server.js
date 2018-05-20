const app = require('./app');

/**
 * Starts a server and listens on port 8080
 */
app.listen(8080, () => {
    console.log('Server is up on the port 8080');
});