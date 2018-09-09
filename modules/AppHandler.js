class AppHandler
{
    constructor()
    {
        this.Database;
        this.WebServer;
        this.FileServer;
        this.Config;
        this.Logger;
        this.Settings;
        this.FileSystem;
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