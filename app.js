console.log("Starting up Software License Manager...");

//Load Logger
const logger = require('./modules/Logger');

logger.Log("Loader","Loaded logger");

//Load AppHandler
const AppHandler = require('./modules/AppHandler')
let app = new AppHandler();

app.Logger = logger;
logger.Log("Loader","Loaded AppHandler");

//Load FileBrowser Class
const FileBrowser = require('./FileSystem/FileBrowser');

app.FileBrowser = FileBrowser;
app.BaseFileBrowser = new FileBrowser(__dirname + "/Content");

logger.Log("Loader", "Loaded FileBrowser");

//Load Config
const config = require('./modules/ConfigHandler');

app.Config = config;
logger.Log("Loader","Loaded Config");

//Load Database
const database = require('./modules/Mysql');
database.Start(config.database, logger);

app.Database = database;
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

    app.Settings = settings;
    logger.Log("Loader", "Loaded Settings");

    //Load Web Server
    const webServer = require("./WebServer/WebServer");

    app.WebServer = webServer;
    logger.Log("Loader", "Loaded WebServer");

    //Load FileSystem
    const FileSystem = require('./FileSystem/FileHandler');
    let fileSystem = new FileSystem(app);

    app.FileSystem = fileSystem;
    logger.Log("Loader", "Loaded FileSystem");

    logger.Log("Loader", "Starting WebServer");
    webServer.StartServer(app);

    logger.Log("Loader","Server started succesfully.");
});