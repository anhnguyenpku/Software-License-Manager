console.log("Starting up Software License Server...");

//Load Logger
const logger = require('./modules/Logger');

logger.Log("Loader","Loaded logger");

//Load AppHandler
const AppHandler = require('./modules/AppHandler')
let app = new AppHandler();

logger.Log("Loader","Loaded AppHandler");

//Load Config
const config = require('./modules/ConfigHandler');

logger.Log("Loader","Loaded Config");

//Load Database
const mysql = require('mysql');
var connection = mysql.createConnection(config.database);
connection.connect(function(err)
{
    if(err)
        logger.Error("Loader",err.message);
});

//Load Web Server
const webServer = require("./WebServer/WebServer");

logger.Log("Loader", "Loaded WebServer");

//Load File Server

//Setting up AppHandler
app.Logger = logger;
app.Database = connection;
app.Config = config;
app.WebServer = webServer;

logger.Log("Loader", "Starting WebServer");
webServer.StartServer(app);

logger.Log("Loader","Server started succesfully.");