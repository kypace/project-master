const app = require('./app');

/**
 *  print 'server is up' 
 */
app.listen(8080, () => {
    console.log('Server is up on the port 8080');
});