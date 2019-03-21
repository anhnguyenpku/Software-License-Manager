const fs = require('fs');
const logger = require('../modules/Logger');
const Settings = require('../modules/Settings');
const Auth = require("../WebServer/modules/UserAuthenticator");

const contentPath = 'Content';

const setupConfig = require('./setup.json');

if(!fs.existsSync(contentPath)) fs.mkdir(contentPath,LogFSError);

function LogFSError(err)
{
    if(err) logger.Error("Setup (FS)", err.message);
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

    //Add Groups
    AddGroupEntries();

    AddUserEntries();   
});

function AddGroupEntries()
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


    database.QueryEmpty("INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (1," 
        + setupConfig.groups.superusers + ",'" + JSON.stringify(adminPermissions) +"');");
    database.QueryEmpty("INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (2," 
        + setupConfig.groups.readonly + ",'" + JSON.stringify(readonlyPermissions) +"');");
    database.QueryEmpty("INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (3," 
        + setupConfig.groups.softwareManager + ",'" + JSON.stringify(managerPermissions) +"');");
    database.QueryEmpty("INSERT IGNORE INTO `slm_groups` (`id`, `name`, `permissions`) VALUES (4," 
        + setupConfig.groups.distributor + ",'" + JSON.stringify(distributorPermissions) +"');");
}

function AddUserEntries()
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


        for(var i = 0; i < setupConfig.users; i++)
        {
            const user = setupConfig.users[i];

            auth.RegisterWithGroup(user.login, auth.Hmac(user.login,user.password), setupConfig[user.group], function(err)
            {
                database.Stop();
                
                if(err)
                {
                    logger.Error("Setup (Account Creator)", err.message);
                    logger.Log("Setup", "Stopping the setup...");
                    logger.Log("Setup", "Try to fix the error and try again.");

                    return;
                }

                logger.Log("Setup","Done");
            });
        }
    });
}