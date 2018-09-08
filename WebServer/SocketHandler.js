let io;
let app;

function Listen(server,appHandler)
{
    app = appHandler;

    io = require('socket.io')(server);

    io.on("connection",RegisterEvents);
}

function RegisterEvents(socket)
{
    
}


module.exports = {"Listen":Listen};