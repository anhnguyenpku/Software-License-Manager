const express = require('express');
const https = require('https');
const sockets = require('./SocketHandler');

let web = express();
let server;
let app;

//Create a static web folder
web.use(express.static("static"));

//Start the server
function StartServer(appHandler)
{
    //save th apphandler reference in the module
    app = appHandler;

    //Start the web- and socketserver
    server = https.createServer(app.Config.ReadSSL(),web).listen(app.Config.web.port);
    sockets.Listen(server,app);

    //Log
    app.Logger.Log("WebServer", "Socket- and WebServer are successfully started.")
}


module.exports = {"StartServer": StartServer};
