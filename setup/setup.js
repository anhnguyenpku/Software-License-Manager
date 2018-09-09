const fs = require('fs');
const logger = require('../modules/Logger');

const contentPath = 'Content';
const executablesPath = contentPath + '/executables';

fs.mkdir(contentPath,function(err)
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
    if(err) logger.Error("Setup (SQL)", err.message);
    
    logger.Log("Setup","Done");
    database.Stop();
});