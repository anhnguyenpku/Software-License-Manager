const SessionInfo = require('./modules/SessionInfo').SocketSessionInfo;
const SqlScape = require('sqlstring').escape;
const cookie = require("cookie");
const UserAuthenticator = require('./modules/UserAuthenticator');
const App = require('../modules/AppHandler');
const EncryptedChannel = require("./modules/EncryptedChannel");

var socketServers = 
{
    "root": null,
    "login": null,
    "panel": null
};

/**
 * @type {App}
 */
let app;
/**
 * @type {UserAuthenticator}
 */
let authenticator;

/**
 * @type {EncryptedChannel[]}
 */
let encryptedChannels = [];
let masterKeys;

function Listen(server,appHandler,auth)
{
    //Save References
    app = appHandler;
    authenticator = auth;

    EncryptedChannel.primeLength = parseInt(app.Settings.GetSetting("encryption.primelength"));
    EncryptedChannel.cipher = app.Settings.GetSetting("encryption.cipher");
    EncryptedChannel.encoding = app.Settings.GetSetting("encryption.encoding");
    //Must be cipher bits divided by 8
    EncryptChannel.keylength = parseInt(app.Settings.GetSetting("encryption.keylength"));

    app.Log("Channel Encryptor", "Generating prime number...");
    app.Log("Channel Encryptor", "This might take a while!");
    masterKeys = EncryptedChannel.CreateMasterKeys();

    //Create socket.io
    var io = require('socket.io')(server);
    socketServers.root = io;

    //Listen to root connections
    socketServers.root.on("connection",EncryptChannel);

    //Listen to dashboard connections
    socketServers.panel = socketServers.root.of("/dashboard");
    socketServers.panel.on("connection",ValidateSocket);

    //Listen to login connections
    socketServers.login = socketServers.root.of("/login");
    socketServers.login.on("connection",RegisterLoginPageEvents);
}

function AttachEncryptedChannel(socket)
{
    if(socket.channel) return true;
    
    try
    {
        var cookies = socket.request.headers.cookie;
        var cookiesObj = cookie.parse(cookies);
        var id = cookiesObj["channelId"];

        socket["channel"] = GetChannel(id);
        return socket["channel"];
    }
    catch(err)
    {
        return false;
    }
}

async function EncryptChannel(socket)
{
    //Check if client has got an id
    var channelID = ParseCookie(socket,"channelId");
    if(channelID && channelID != null)
    {
        var channel = GetChannel(channelID)
        if(channel)
        {
            channel.EmitConstants(socket);
            return;
        }
        else
        {
            socket.emit("encrypt.invalid");
        }
    }

    //Start an encrypted channel
    let eCh = new EncryptedChannel(socket,masterKeys);
    encryptedChannels.push(eCh);

    socket.once("encrypt.encrypted",function()
    {
        let i = encryptedChannels.lastIndexOf(eCh);
        encryptedChannels.splice(i,1);
    });
}

async function ValidateSocket(socket)
{
    socket.on("auth.validate",async function(cookieEncrypted)
    {
        if(AttachEncryptedChannel(socket))
        {
            let sesinfo = new SessionInfo(socket);
            let cookie = socket.channel.DecryptMessage(cookieEncrypted);

            authenticator.ValidateCookie(cookie,sesinfo,function(success,user,err)
            {
                if(success) RegisterEvents(socket);
            });
        }
    });
}

async function RegisterEvents(socket)
{
    /*SOFTWARE API*/
    socket.on("software.list",async function()
    {
        //TODO implement error casting
        app.Database.Query("SELECT * FROM `slm_software` ORDER BY `date` DESC",function(results,fields,err)
        {
            let done = false;
            for (let i = 0; i < results.length; i++)
            {
                const result = results[i];
                let query = "SELECT * FROM `slm_software_versions` WHERE `id`='" + result.lastVersion + "';";

                app.Database.Query(query,function(versions,fields,err)
                {
                    if(err)
                    {
                        app.Error("SocketHandler", err.message);

                        results[i].version = "No Versions Found";
                    }
                    else if(versions.length === 0)
                    {
                        results[i].version = "No Versions Found";
                    }
                    else
                    {
                        results[i].version = versions[0].label;
                    }

                    if(i === results.length -1)
                    {
                        var encrypted = socket.channel.EncryptMessage(results);
                        socket.emit("software.list",encrypted);
                    }
                });
            }
        });
    });

    socket.on("software.versions.list",async function(sidEn)
    {
        let sid = socket.channel.DecryptMessage(sidEn);
        app.Database.Query("SELECT * FROM `slm_software_versions` WHERE `software`=" + SqlScape(sid) + " ORDER BY `date` DESC",function(results,fields,err)
        {
            if(err)
            {
                app.Error("SocketHandler", err.message);
            }

            var encrypted = socket.channel.EncryptMessage(results);
            socket.emit("software.versions.list",encrypted);
        });
    });

    /* SETTINGS */

    socket.on("settings.list",async function()
    {
        app.Database.Query("SELECT * FROM `slm_settings`",function(results,fields,err)
        {
            var encrypted = socket.channel.EncryptMessage(results);
            socket.emit("settings.list",encrypted);
        });
    });

    /* FILEBROWSER */
    socket.on("files.basefolder", async function()
    {
        let items = app.BaseFileBrowser.ReadBaseFolderSafe();
        var encrypted = socket.channel.EncryptMessage(items);
        socket.emit("files.folderitems",encrypted);
    }); 

    socket.on("files.folder",async function(relPath)
    {
        let items = app.BaseFileBrowser.ReadFolderSafe(relPath);

        var encrypted = socket.channel.EncryptMessage(items);
        socket.emit("files.folderitems",encrypted);
    });

    /* USER */

    socket.on("user.users",async function()
    {
        app.Database.Query("SELECT * FROM `slm_users`",function(results,fields,err)
        {
            if(err)
            {
                socket.emit("error.user.users",err);
            }
            else
            {
                let users = [];

                for(let i = 0; i < results.length; i++)
                {
                    users.push({"id":results[i].id,"name":results[i].login});
                }

                var encrypted = socket.channel.EncryptMessage(users);
                socket.emit("user.users",encrypted);
            }
        });
    });

    socket.on("user.chanePassword",async function(userdata)
    {
        authenticator.ChangePassword(userdata.login,userdata.oldPWD,userdatanewPWD,function(success)
        {
            if(success)
            {
                socket.emit("user.changePassword");
            }
            else
            {
                var encrypted = socket.channel.EncryptMessage("The password could not be changed!");
                socket.emit("error.user.changePassword",encrypted);
            }
        });
    });

    /* PERMISSIONS */

    socket.on("permissions.list",function()
    {
        app.Database.Query("SELECT * FROM `slm_groups`",function(results,fields,err)
        {
            var encrypted = socket.channel.EncryptMessage(results);
            socket.emit("permissions.list",encrypted);
        });
    });
}

async function RegisterLoginPageEvents(socket)
{   
    let sesinfo = new SessionInfo(socket);

    socket.on("auth.login",function(encAuth)
    {
        AttachEncryptedChannel(socket);

        var auth = socket.channel.DecryptMessage(encAuth);

        authenticator.Authenticate(auth.login, auth.password, sesinfo, function(cookie,success,err)
        {
            if(err || !success)
            {
                var encErr = socket.channel.EncryptMessage(err);
                socket.emit("failed",encErr);
                return;
            }

            var encCookie = socket.channel.EncryptMessage(cookie);
            socket.emit("success",encCookie);
        });
    });
}

async function Broadcast(event)
{
    socketServers.root.emit(event);
}

async function Broadcast(event,data)
{

}

/**
 * @param {String} id The socket id
 */
function GetChannel(id)
{
    for (let i = 0; i < encryptedChannels.length; i++)
    {
        const channel = encryptedChannels[i];

        if(channel.id == id)
        {
            return channel;
        }
    }

    return null;
}

function ParseCookies(socket)
{
    var cookies = socket.request.headers.cookie;
    var cookiesObj = cookie.parse(cookies);
    return cookiesObj;
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

module.exports = 
    {
        "Listen":Listen,
        "servers":socketServers,
        "Channels": encryptedChannels,
        "GetChannel": GetChannel,
        "Broadcast":Broadcast
    };