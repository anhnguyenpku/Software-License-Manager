const mysql = require('mysql');
let Logger;
let pool;


function Start(config, logger)
{
    //Save logger reference
    Logger = logger;

    //Add entry in the config
    config.multipleStatements = true;

    pool = mysql.createPool(config);
}

function Query(querystring, callback)
{
    pool.getConnection(function(err,con)
    {
        if(err)
        {
            //Logger.Error("Mysql",err.message);
            callback(null,null,err);
            return;
        }

        con.query(querystring,function(err,results,fields)
        {
            if(err)
            {
                //Logger.Error("Mysql",err.message);
                callback(null,null,err);
                return;
            }

            callback(results,fields,err);
        });
    });

}

module.exports = {"Query":Query,"Start":Start};