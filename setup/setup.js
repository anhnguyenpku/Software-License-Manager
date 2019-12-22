const fs = require('fs');
const logger = require('../modules/Logger');
const Settings = require('../modules/Settings');
const Auth = require("../WebServer/modules/UserAuthenticator");

logger.Log("Setup","Loading configs...");

const config = require('../modules/ConfigHandler');
const setupConfig = require('./setup.json');

logger.Log("Setup","Creating Content directory...");
if(!fs.existsSync(config.Content)) fs.mkdir(config.Content,LogFSError);

function LogFSError(err)
{
    if(err) logger.Error("Setup (FS)", err.message);
}

logger.Log("Setup","Connecting to database...");
const Database = require('../modules/Database');
const database = new Database(config.database, logger);

logger.Log("Setup (DB)","Creating tables...");
let query = require('./database.json');

database.Connect(function(err,db,stop)
{
    if(err)
    {
        stop();
        return;
    }

    for(let key in Object.keys(query))
    {
        db.createCollection(key,{},function(err,coll)
        {
            if(err)
            {
                logger.Error("Setup (DB)",err.message);
                return;
            }

            coll.insert(query[key],function(err,res)
            {
                if(err)
                {
                    logger.Error("Setup (DB)",err.message);
                    return;
                }
            });
        });
    }    
});

function AddUserEntries(db,stop)
{
    logger.Log("Setup (DB)","Adding user entries...");
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
        let auth = new Auth({Database:database,Settings:settings});

        var i = -1;
        NextQuery();
        function NextQuery()
        {
            i++;
            if(i == setupConfig.users.length)
            {
                logger.Log("Setup","Done");
                return;
            }

            const user = setupConfig.users[i];

            auth.RegisterWithGroup(user.login, auth.Hmac(user.login,user.password), setupConfig.groups[user.group], function(err)
            {                
                if(err)
                {
                    logger.Error("Setup (Account Creator)", err.message);
                    logger.Log("Setup", "Stopping the setup...");
                    logger.Log("Setup", "Try to fix the error and try again.");

                    return;
                }

                NextQuery();
            });
        }
    });
}