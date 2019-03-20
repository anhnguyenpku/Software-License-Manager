const mysql = require('mysql');
const SqlScape = require('sqlstring').escape;

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

/**
 * Query something from the database asynchronously with a callback.
 * @param {String} querystring A SQL string to query to the database.
 * @param {Callback} callback The callback method
 */
async function Query(querystring, callback)
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
            pool.releaseConnection(con);

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
/**
 * Query something from the database asynchronously without a callback.
 * @param {String} querystring A SQL string to query to the database.
 */
async function QueryEmpty(querystring)
{
    pool.getConnection(function(err,con)
    {
        if(err)
        {
            Logger.Error("Mysql",err.message);
            return;
        }

        con.query(querystring,function(err,results,fields)
        {
            pool.releaseConnection(con);

            if(err)
            {
                Logger.Error("Mysql",err.message);
                return;
            }
        });
    });

}

async function GetUserByLogin(login,callback)
{
    Query("SELECT * FROM `slm_users` WHERE `login`=" + SqlScape(login),callback);
}

async function GetGroupByName(name,callback)
{
    Query("SELECT * FROM `slm_groups` WHERE `name`=" + SqlScape(name),callback);
}

/**
 * 
 * @param {Array} results 
 * @param {Array} fields 
 * @param {Error} err 
 */
function Callback(results,fields,err) {};

function Stop()
{
    pool.end();
}

module.exports = {
        "Query":Query,
        "QueryEmpty":QueryEmpty,
        "Start":Start,
        "Stop":Stop,
        "GetUserByLogin": GetUserByLogin,
        "GetGroupByName": GetGroupByName
    };