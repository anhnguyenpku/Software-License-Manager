//Packages
const express = require('express');
const https = require('https');
const cookieParser = require('cookie-parser');

//Modules
const sockets = require('./SocketHandler');
const TemplateBuilder = require('./TemplateBuilder')
const UserAuthenticator = require('./UserAuthenticator');

//Objects
let builder = new TemplateBuilder();
let authenticator;

let web = express();
let server;
let app;

//Express extensions
web.use(express.static(__dirname + "/static"));
web.use(cookieParser());


//Start the server
function StartServer(appHandler)
{
    //save th apphandler reference in the module
    app = appHandler;

    //Initialize authenticator
    authenticator = new UserAuthenticator(app.Database,app.Settings);

    //Start the web- and socketserver
    server = https.createServer(app.Config.ReadSSL(),web).listen(app.Config.web.port);
    sockets.Listen(server,app,authenticator);

    //Log
    app.Logger.Log("WebServer", "Socket- and WebServer are successfully started.")
}

//Web Routes

web.all("/",async function(req,res)
{
    res.send(builder.BuildPage("Dashboard",{"softpanel":"is-active"}));
});

module.exports = {"StartServer": StartServer};