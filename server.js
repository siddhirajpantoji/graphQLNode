const http = require('http');
const app = require('./app');
const port = 4000;
const server = http.createServer(app);

/**
 * make a log directory, just in case it isn't there.
 */
try {
    require('fs').mkdirSync('./log');
} catch (e) {
    if (e.code != 'EEXIST') {
        console.error("Could not set up log directory, error was: ", e);
        process.exit(1);
    }
}
var log4js = require('log4js');
log4js.configure('./config/log4js.json');
logger = log4js.getLogger("Server")
server.listen(port)
logger.info("Server Started")