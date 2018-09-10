const SessionInfo = require('./modules/SessionInfo').SocketSessionInfo;
const SqlScape = require('sqlstring').escape;

let io;
let lio;
let app;
let authenticator;

function Listen(server,appHandler,auth)
{
    //Save References
    app = appHandler;
    authenticator = auth;

    //Create socket.io
    io = require('socket.io')(server);

    //Listen to dashboard connections
    io.on("connection",RegisterEvents);

    //Listen to login connections
    lio = io.of("/login");
    lio.on("connection",RegisterLoginPageEvents);
}

function RegisterEvents(socket)
{
    /*SOFTWARE API*/
    socket.on("software.list",function()
    {
        //TODO implement error casting
        app.Database.Query("SELECT * FROM `slm_software`",function(results,fields,err)
        {
            let query = "SELECT * FROM `slm_software_versions` WHERE (";
            for (let i = 0; i < results.length; i++)
            {
                const result = results[i];
                
                query += "`id`='" + result.lastVersion + "' OR ";
            }

            query = query.substr(0,query.length - 4) + ");";

            app.Database.Query(query,function(versions,fields,err)
            {
                for (let i = 0; i < versions.length; i++)
                {
                    const version = versions[i];
                    results[i].version = version.label;
                }

                socket.emit("software.list",results);
            });
        });
    });

    socket.on("software.versions.list",function(sid)
    {
        app.Database.Query("SELECT * FROM `slm_software_versions` WHERE `software`=" + SqlScape(sid),function(results,fields,err)
        {
            if(err)
            {
                app.Error("SocketHandler", err.message);
            }

            socket.emit("software.versions.list",results);
        });
    });
}

function RegisterLoginPageEvents(socket)
{
    let sesinfo = new SessionInfo(socket);

    socket.on("auth",function(auth)
    {
        authenticator.Authenticate(auth.login, auth.password, sesinfo, function(cookie,success,err)
        {
            if(err || !success)
            {
                socket.emit("failed",err);
                return;
            }

            socket.emit("success",cookie);
        });
    });
}


module.exports = {"Listen":Listen};