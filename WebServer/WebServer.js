//Packages
const express = require('express');
const https = require('https');
const cookieParser = require('cookie-parser');

//Modules
const sockets = require('./SocketHandler');
const TemplateBuilder = require('./modules/TemplateBuilder')
const UserAuthenticator = require('./modules/UserAuthenticator');
const SessionInfo = require('./modules/SessionInfo').SessionInfo;

//Objects
let builder = new TemplateBuilder();
let authenticator;

let web = express();
let server;
let app;

//Express extensions
web.use(express.static(__dirname + "/files/static"));
web.use(cookieParser());
web.use(CheckAuthentication);

//CheckAuthentication
async function CheckAuthentication(req,res,next)
{
    if(req.path === "/login")
    {
        next();
        return;
    }

    let sesinfo = new SessionInfo(req);
    authenticator.ValidateCookie(sesinfo.cookies.seskey,sesinfo,function(valid,err)
    {
        if(valid)
        {
            next();
        }
        else
        {
            res.redirect("/login");
        }
    });
}

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

web.all("/login",async function(req,res)
{
    res.send(builder.BuildLoginPage({}));
});

module.exports = {"StartServer": StartServer};