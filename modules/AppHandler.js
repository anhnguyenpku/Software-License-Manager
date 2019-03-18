const Database = require('./Mysql');
const Settings = require('./Settings');
const WebServer = require('../WebServer/WebServer');

class AppHandler
{
    constructor()
    {
        /** @type {Database} */
        this.Database;
        /** @type {WebServer} */
        this.WebServer;
        this.FileServer;
        this.Config;
        this.Logger;
        /** @type {Settings} */
        this.Settings;
        this.FileSystem;
        this.FileBrowser;
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