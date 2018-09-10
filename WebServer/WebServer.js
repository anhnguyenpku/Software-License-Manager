//Packages
const express = require('express');
const https = require('https');
const http = require('http');
const SqlScape = require('sqlstring').escape;

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');

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
web.use(bodyParser.urlencoded({ extended: true }));
web.use(bodyParser.json());
web.use(fileUpload());

//CheckAuthentication
async function CheckAuthentication(req,res,next)
{
    if(req.path === "/login")
    {
        next();
        return;
    }
    else if(!req.cookies['seskey'])
    {
        res.redirect("/login");
        return;
    }

    let sesinfo = new SessionInfo(req);
    authenticator.ValidateCookie(sesinfo.cookies['seskey'],sesinfo,function(valid,err)
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
    if(app.Config.ssl.enabled)
    {
        server = https.createServer(app.Config.ReadSSL(),web).listen(app.Config.web.port);
    }
    else
    {
        server = http.Server(web);
        server.listen(app.Config.web.port);
    }

    sockets.Listen(server,app,authenticator);

    //Log
    app.Logger.Log("WebServer", "Socket- and WebServer are successfully started.")
}

//Secure Web Routes

web.all("/",async function(req,res)
{
    res.send(builder.BuildPage("Dashboard",{"softpanel":"is-active"}));
});

web.all("/software",async function(req,res)
{
    res.send(builder.BuildPage("Software",{"softpanel":"is-active"}));
});

web.get("/software/add",async function(req,res)
{
    res.send(builder.BuildPage("Software",{"softpanel":"is-active","modal-active":"is-active"}));
});

web.post("/software/add", async function(req,res)
{
    let software = req.body.name;
    let version = req.body.version;
    let distributor = req.body.distributor;
    let file = req.files.package;

    app.FileSystem.RegisterSofwareVersion(software,distributor,version,file);

    res.redirect("/software");
});

web.post("/software/:id",function(req,res)
{
    app.Database.Query("UPDATE `slm_software` SET `name`=" + SqlScape(req.body.name) + ", `distributor`=" + SqlScape(req.body.distributor) + 
        " WHERE `id`=" + SqlScape(req.params.id),function(results,fields,err)
    {
        if(err) app.Error("WebServer",err.message);
        res.redirect("/software/" + req.params.id);
    });
});

web.get("/software/:id",function(req,res)
{
    app.Database.Query("SELECT * FROM `slm_software` WHERE `id`=" + SqlScape(req.params.id),function(results,fields,err)
    {
        if(err)
        {
            app.Error("Webserver (/software/:id)", err.message);
            res.redirect("/software");
            return;
        }
        else if(results.length == 0)
        {
            res.redirect("/software");
            return;
        }

        res.send(builder.BuildPage("SoftwareItem",
            {"softpanel":"is-active","title":"Software - " + results[0].name,"software-name":results[0].name,"software-distributor":results[0].distributor, "sid":req.params.id}));
    });
});

//Insecure Web Routes

web.all("/login",async function(req,res)
{
    res.send(builder.BuildLoginPage({}));
});

web.all("*",function(req,res)
{
    res.status(404).send(builder.BuildErrorPage(404));
});

module.exports = {"StartServer": StartServer};