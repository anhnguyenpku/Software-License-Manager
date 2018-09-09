const SessionInfo = require('./modules/SessionInfo').SocketSessionInfo;

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