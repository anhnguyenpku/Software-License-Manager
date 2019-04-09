const Database = require('./Mysql');
const Settings = require('./Settings');
const WebServer = require('../WebServer/WebServer');
const FileBrowser = require('../FileSystem/FileBrowser');

const defaultConfig = {
    "web":
    {
        "port": 80
    },
    "database":
    {
        "host":"localhost",
        "port": 3306,
        "user":"user",
        "password":"password",

        "database": "licenseServer"
    },
    "ssl":
    {
        "enabled": false,
        "key": "path/to/key",
        "cert": "path/to/cert",
        "passphrase": ""
    }
};

class AppHandler
{
    constructor()
    {
        /** @type {Database} */
        this.Database;
        /** @type {WebServer} */
        this.WebServer;
        this.FileServer;
        /** @type { defaultConfig } */
        this.Config;
        this.Logger;
        /** @type {Settings} */
        this.Settings;
        this.FileSystem;
        /**@type {FileBrowser} */
        this.BaseFileBrowser;
    }

    Log(source, message)
    {
        this.Logger.Log(source,message);
    }
    
    Error(source, message)
    {
        this.Logger.Error(source,message);
    }
}

module.exports = AppHandler;