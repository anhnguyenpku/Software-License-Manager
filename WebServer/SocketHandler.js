let io;
let app;
let authenticator;

function Listen(server,appHandler,auth)
{
    //Save References
    app = appHandler;
    authenticator = auth;

    //Create socket.io
    io = require('socket.io')(server);

    //Listen to connections
    io.on("connection",RegisterEvents);
}

function RegisterEvents(socket)
{
    
}


module.exports = {"Listen":Listen};