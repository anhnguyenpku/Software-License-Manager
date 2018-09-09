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
const database = require('./modules/Mysql');
database.Start(config.database, logger);

logger.Log("Loader", "Loaded Mysql Database Pool");

//Load Settings from database
const Settings = require('./modules/Settings');
let settings = new Settings(database,function(err)
{
    if(err)
    {
        logger.Error("Settings", err.message);

        logger.Log("Loader","Stopping Server...");
        database.Stop();
        
        return;
    }

    logger.Log("Loader", "Loaded Settings");

    //Load Web Server
    const webServer = require("./WebServer/WebServer");

    logger.Log("Loader", "Loaded WebServer");

    //Load File Server

    //Setting up AppHandler
    app.Logger = logger;
    app.Database = database;
    app.Config = config;
    app.WebServer = webServer;

    logger.Log("Loader", "Starting WebServer");
    webServer.StartServer(app);

    logger.Log("Loader","Server started succesfully.");
});