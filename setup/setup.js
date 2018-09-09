const fs = require('fs');
const logger = require('../modules/Logger');
const Settings = require('../modules/Settings');
const Auth = require("../WebServer/modules/UserAuthenticator");

const contentPath = 'Content';
const executablesPath = contentPath + '/executables';

const login = "admin";
const password = "admin";

if(!fs.existsSync(contentPath)) fs.mkdir(contentPath,function(err)
{
    if(err)
    {
        LogFSError(err);
        return;
    }

    fs.mkdir(executablesPath, LogFSError);
});

function LogFSError(err)
{
    if(err)
        logger.Error("Setup (FS)", err.message);
}

const config = require('../modules/ConfigHandler');

const database = require('../modules/Mysql');
database.Start(config.database, logger);

let query = fs.readFileSync(__dirname + "/SQL/setup.sql").toString();

database.Query(query,function(results,fields,err)
{
    if(err)
    {
        logger.Error("Setup (SQL)", err.message);
        logger.Log("Setup", "Stopping the setup...");
        logger.Log("Setup", "Try to fix the error and try again.");

        database.Stop();
        return;
    }
    
    AddAdminUserEntry();   
});

function AddAdminUserEntry()
{
    //Load the settings
    let settings = new Settings(database,function(err)
    {
        if(err)
        {
            logger.Error("Setup (Settings)", err.message);
            logger.Log("Setup", "Stopping the setup...");
            logger.Log("Setup", "Try to fix the error and try again.");

            database.Stop();
            return;
        }

        //Load The Authenticator
        let auth = new Auth(database,settings);

        auth.Register(login,auth.Hmac(login,password));

        logger.Log("Setup","Done");
        database.Stop();
    });
}