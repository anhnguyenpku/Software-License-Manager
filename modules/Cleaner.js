const AppHandler = require("./AppHandler");

/**
 * @type {AppHandler}
 */
var app;

const interval;
var channels = [];

function Init(appHandler)
{
    app = appHandler;

    interval = app.Settings.GetSetting("cleaner.interval");

    setInterval(Broadcast,interval);

    RegisterSocketEvents();
}

async function CleanBroadcast()
{
    app.WebServer.SocketHandler.Broadcast("socket.where");
    setTimeout(Clean,interval/2);
}

async function Clean()
{
    app.Log("Cleaner","Cleaning data!");

    var eChannels = app.WebServer.SocketHandler.Channels;
    var toDelete = [];

    for(var i = 0; i < eChannels.length; i++)
    {
        var keep = false;
        for(var j = 0; j < channels.length; j++)
        {
            if(channels[j] == eChannels[i].id)
            {
                keep = true;
                break;
            }
        }

        if(!keep)
        {
            toDelete.push(i);
        }
    }

    for(var i = toDelete.length - 1; i >= 0; i--)
    {
        app.WebServer.SocketHandler.Channels.splice(toDelete[i],1);
    }

    app.Database.Query("SELECT * FROM `slm_user_sessions`",function(results,fields,err)
    {
        for(var i = 0; i < results.length; i++)
        {
            //Clean Expired
        }
    });

}

function RegisterSocketEvents()
{
    app.WebServer.SocketHandler.servers.root.on("connection",function(socket)
    {
        socket.on("socket.here",async function()
        {
            var id = ParseCookie(socket,"channelId");
            channels.push(id);
        });
    });
}

function ParseCookie(socket,cname)
{
    try
    {
        var cookies = socket.request.headers.cookie;
        var cookiesObj = cookie.parse(cookies);
        return cookiesObj[cname];
    }
    catch(err)
    {
        app.Error("Cookie Parser",err);
        return null;
    }
}

module.exports = {"Init": Init, "Clean": CleanBroadcast };