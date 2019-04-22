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
const database = require('../modules/Mysql');
database.Start(config.database, logger);

logger.Log("Setup (DB)","Creating tables...");
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

    logger.Log("Setup (DB)","Adding group entries...");
    //Add Groups
    AddGroupEntries(AddUserEntries);
});

function AddGroupEntries(callback)
{
    const adminPermissions =
    {
        "su": true,
        "readonly": false,
        "softwareManager": false,
        "distributor": false
    };

    const readonlyPermissions =
    {
        "su": false,
        "readonly": true,
        "softwareManager": true,
        "distributor": false
    };

    const managerPermissions =
    {
        "su": false,
        "readonly": false,
        "softwareManager": true,
        "distributor": false
    };

    const distributorPermissions =
    {
        "su": false,
        "readonly": false,
        "softwareManager": false,
        "distributor": true
    };


    let qeurys = [
        "INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (1,'" 
        + setupConfig.groups.superusers + "','" + JSON.stringify(adminPermissions) +"');",

        "INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (2,'" 
        + setupConfig.groups.readonly + "','" + JSON.stringify(readonlyPermissions) +"');",

        "INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (3,'" 
        + setupConfig.groups.softwareManager + "','" + JSON.stringify(managerPermissions) +"');",

        "INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (4,'" 
        + setupConfig.groups.distributor + "','" + JSON.stringify(distributorPermissions) +"');"
    ];
    var currentQuery = -1;

    NextQeury();

    function NextQeury()
    {
        currentQuery++;
        if(currentQuery == qeurys.length)
        {
            callback();
            return;
        }

        database.Query(qeurys[currentQuery],function(r,f,e)
        {
            if(e)
            {
                logger.Error("Setup (DB)",e);
            }

            NextQeury();
        });
    }
}

function AddUserEntries()
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