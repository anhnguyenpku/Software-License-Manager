const MongoClient = require('mongodb').MongoClient;
const Db = require('mongodb').Db;


class Database
{
    constructor(config,logger)
    {
        this.config = config;
        this.logger = logger;
        this.url = "mongodb://" + this.config.host + ":" + this.config.port;
        this.options = {useNewUrlParser: true, "auth":this.config.auth};
    }

    /**
     * 
     * @param {callbackTypes.Connect} callback 
     */
    Connect(callback)
    {
        const self = this;
        MongoClient.connect(this.url,self.options,function(err,client)
        {
            function Stop() {client.close()};

            if(err)
            {
                self.logger.Error("DB",err.message);
                
                callback(err,null,Stop);
                return;
            }

            const db = client.db(this.config.db);

            

            callback(null,db,Stop);
        });
    }
}

module.exports = Database;

var callbackTypes = {};

/**
 * @param {Db} db
 * @param {callbackTypes.ConnectCallback} callback
 */
callbackTypes.Connect = function(err,db,callback){};

callbackTypes.ConnectCallback = function(){};