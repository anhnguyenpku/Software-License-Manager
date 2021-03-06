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
const Api = require('./Api');
const TemplateBuilder = require('./modules/TemplateBuilder')
const UserAuthenticator = require('./modules/UserAuthenticator');
const SessionInfo = require('./modules/SessionInfo').SessionInfo;
const User = require('./modules/User');

//Objects
var builder = new TemplateBuilder();
var authenticator;

var web = express();
var server;
var app;

//Express extensions
web.use(express.static(__dirname + "/files/static"));
web.use(cookieParser());
web.use(bodyParser.urlencoded({ extended: true }));
web.use(bodyParser.json());
web.use(CheckAuthentication);
web.use(fileUpload());

//Start the server
function StartServer(appHandler)
{
    //save the apphandler reference in the module
    app = appHandler;

    //Setup User Module
    User.SetupModule(app);
    UserAuthenticator.SetupModule(app);

    //Register Api Route and 404 Route
    web.all("/" + app.Settings.GetSetting("web.apiroute") + ":request" ,ApiHandler);
    web.all("*", page404);

    //Initialize authenticator
    authenticator = new UserAuthenticator();

    //Start the web- and socketserver
    if(app.Config.ssl.enabled)
    {
        server = https.createServer(app.Config.ReadSSL(),web).listen(app.Config.web.httpsPort);
        
        http.createServer(function(req,res)
        {
            res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
            res.end();
        }).listen(app.Config.web.httpPort);
    }
    else
    {
        server = http.Server(web);
        server.listen(app.Config.web.httpPort);
    }

    sockets.Listen(server,app,authenticator);

    //Log
    app.Logger.Log("WebServer", "Socket- and WebServer are successfully started.")
}

//CheckAuthentication
async function CheckAuthentication(req,res,next)
{
    if(req.path.includes(app.Settings.GetSetting("web.apiroute")))
    {
        next();
        return;
    }

    //Check if user has a sessionkey ready
    if(!req.cookies['seskey'])
    {
        //if the requested path is login
        if(req.path === "/login")
        {
            //Serve the requested page
            next();
            return;
        }

        //No session key: redirect the user to the login page
        res.redirect("/login");
        return;
    }

    //get all session info of the user
    let sesinfo = new SessionInfo(req);

    //Validate the session key
    authenticator.ValidateCookie(sesinfo.cookies['seskey'],sesinfo,function(valid,user,err)
    {
        //If session key is valid
        if(valid)
        {
            //if the requested path is login
            if(req.path === "/login")
            {
                //redirect the user to the dashboard
                res.redirect("/");
                return;
            }

            //Serve the requested page
            req["user"] = user;

            
            //Continue doing action
            if(user.HasPermission(req))
                next();
            //Go back to homepage
            else
                res.end(builder.BuildErrorPage("401"));
        }
        //If key is invalid
        else
        {
            //if the requested path is login
            if(req.path === "/login")
            {
                //Serve the requested page
                next();
            }
            else
            {
                //redirect to the dashboard
                res.redirect("/login");
            }
        }
    });
}

//Secure Web Routes

//Software Routes

web.all("/",async function(req,res)
{
    res.send(builder.BuildPage("Dashboard",{"softpanel":"is-active"},{}));
});

web.all("/software",async function(req,res)
{
    res.send(builder.BuildPage("Software",{}, 
    {
        "subMenu":"Software"
    }));
});

web.get("/software/add",async function(req,res)
{
    res.send(builder.BuildPage("Software",
    {
        "modal-active":"is-active"
    }, 
    {
        "subMenu":"Software"
    }));
});

web.post("/software/add", async function(req,res)
{
    //Get All info from the submitted form
    let software = req.body.name;
    let version = req.body.version;
    let distributor = req.body.distributor;
    let file = req.files.package;

    //Register Software in the FileSystem
    app.FileSystem.RegisterSofwareVersion(software,distributor,version,file,function(sid,vid)
    {
        //Redirect the user to the Software page that they just created
        res.redirect("/software/" + sid);
    });
});

web.post("/software/:sid/version/add",function(req,res)
{
    //Get Software Info from the database
    app.Database.Query("SELECT * FROM `slm_software` WHERE `id`=" + SqlScape(req.params.sid),function(software,fields,err)
    {
        //On Mysql Error
        if(err)
        {
            //Log the error
            app.Error("WebServer",err.message);

            //Redirect the user to the software page
            res.redirect("/software");
            return;
        }

        //If there is no software with the specified Software Id (sid)
        if(software.length === 0)
        {
            //Redirect the user to the software page
            res.redirect("/software");
            return;
        }

        //Get First entry from the database
        let soft = software[0];

        //Register Version
        app.FileSystem.RegisterSofwareVersion(soft.name,soft.distributor,req.body.label,req.files.package,function(sid,vid)
        {
            //If both the Software Id (sid) and Verrsion Id (vid) are not null
            if(sid && vid)
            {
                //Redirect the user to that version page
                res.redirect("/software/" + sid + "/version/" + vid);
            }
            else if(!vid)
            {
                //redirect the user back to the specified software page
                res.redirect("/software/" + req.params.sid);
            }
            else
            {
                //Redirect the user back to the All Software page
                res.redirect("/software");
            }
        });
    });
});

web.get("/software/:sid/version/:vid",async function(req,res)
{
    //Get all Info of the specified software from the Database
    app.Database.Query("SELECT * FROM `slm_software` WHERE `id`=" + SqlScape(req.params.sid),function(software,fields,err)
    {
        //On Mysql Error
        if(err)
        {
            //Log the error
            app.Error("Webserver", err.message);

            //Redirect the user to the All Software page
            res.redirect("/software");
            return;
        }
        //If there is no software with the specified Software Id (sid)
        else if(software.length == 0)
        {
            //Redirect the user to the All Software page
            res.redirect("/software");
            return;
        }

        //Get all info of the specified software version from the database
        app.Database.Query("SELECT * FROM `slm_software_versions` WHERE `id`=" + SqlScape(req.params.vid),function(versions,fields,err)
        {
            res.send(builder.BuildPage("VersionItem",
            {
                "title": software[0].name + " " + versions[0].label,
                "software-name":software[0].name,
                "software-distributor":software[0].distributor,
                "version-label":versions[0].label,
                "sid":req.params.sid,
                "vid": req.params.vid
            }, 
            {
                "subMenu":"Software"
            }));
        });
    });
});

web.post("/software/:sid/version/:vid",async function(req,res)
{
    //Update the software version info
    app.Database.Query("UPDATE `slm_software_versions` SET `label`=" + SqlScape(req.body.label) + 
        " WHERE `id`=" + SqlScape(req.params.vid),function(results,fields,err)
    {
        //On Mysql Error
        if(err)
        {
            //Log the error
            app.Error("WebServer",err.message);
        }

        //redirect back
        res.redirect("/software/" + req.params.sid + "/version/" + req.params.vid);
    });
});


web.post("/software/:id",function(req,res)
{
    //Update the software info
    app.Database.Query("UPDATE `slm_software` SET `name`=" + SqlScape(req.body.name) + ", `distributor`=" + SqlScape(req.body.distributor) + 
        " WHERE `id`=" + SqlScape(req.params.id),function(results,fields,err)
    {
        //On Mysql error
        if(err)
        {
            //Log the error
            app.Error("WebServer",err.message);
        }

        //redirect the user back
        res.redirect("/software/" + req.params.id);
    });
});

web.get("/software/:id",function(req,res)
{
    //Get all info of the specified software from the database
    app.Database.Query("SELECT * FROM `slm_software` WHERE `id`=" + SqlScape(req.params.id),function(results,fields,err)
    {
        //On Mysql Error
        if(err)
        {
            //Log the Error
            app.Error("Webserver", err.message);

            //Redirect the user to the All Software Page
            res.redirect("/software");
            return;
        }
        //If there is no software with the specified Software Id (sid)
        else if(results.length == 0)
        {
            //Redirect the user to the All Software Page
            res.redirect("/software");
            return;
        }

        res.send(builder.BuildPage("SoftwareItem",
            {
                "title":"Software - " + results[0].name,
                "software-name":results[0].name,
                "software-distributor":results[0].distributor,
                "sid":req.params.id
            }, 
            {
                "subMenu":"Software"
            }));
    });
});

//User Routes

web.all("/users",function(req,res)
{
    res.send(builder.BuildPage("Users",{},
    {
        "subMenu":"Users"
    }));
});

web.all("/users/add",function(req,res)
{
    res.send(builder.BuildPage("Users",
    {
        "modal-active":"is-active"
    },
    {
        "subMenu":"Users"
    }));
});

web.all("/user/profile",function(req,res)
{
    res.send(builder.BuildPage("UserProfile",
    {
        "title": "User: " + req.user.login,
        "username": req.user.login,
        "id": req.user.id,
        "Profile":"is-active"
    }
    ,
    {
        "subMenu":"Users",
        "subMenuInActive": true
    }));
});

web.all("/user/:user",function(req,res)
{
    var user = new User(req.params.user);
    user.Load(function(err)
    {
        if(err)
        {
            res.redirect("/users");
            return;
        }

        res.send(builder.BuildPage("UserProfile",
        {
            "title": "User: " + user.login,
            "username": user.login,
            "id": user.id,
            "group": user.group,
            "Profile":"is-active"
        }
        ,
        {
            "subMenu":"Users",
            "subMenuInActive": true
        }));
    });
}); 

//Permission routes

web.all("/permissions",function(req,res)
{
    res.send(builder.BuildPage("Permissions",{},{}));
});

web.get("/permissions/:group/permissions",function(req,res)
{
    res.send(builder.BuildPage("PermissionEditor",{group:req.params.group},{}));
});

//Other Routes

web.all("/filebrowser",function(req,res)
{
    res.send(builder.BuildPage("FileBrowser",{},{}));
});

web.get("/analytics",function(req,res)
{
    res.send(builder.BuildPage("Analytics",{},{}));
});

web.get("/settings",function(req,res)
{
    res.send(builder.BuildPage("Settings",{},{}));
});

web.get("/config",function(req,res)
{
    res.send(builder.BuildPage("Config",{},{}));
});

web.all("/system",function(req,res)
{
    res.send(builder.BuildPage("System",builder.BuildSystemInfoOptions(app.Config.VersionInfo),{}));
});

//Insecure Web Routes

web.all("/login",async function(req,res)
{
    res.send(builder.BuildLoginPage({}));
});

web.all("/logout",async function(req,res)
{
    let sesinfo = new SessionInfo(req);

    let script = "<script>" +
        'SetCookie("seskey","",-1);'+
        'window.location.href = "/login";</script>';
    
    //Remove seskey
    app.Database.QueryEmpty("DELETE FROM `slm_user_sessions` WHERE `ipadress`=" + SqlScape(sesinfo.ip) + ";");

    res.send(builder.BuildLoginPage({"scripts":script}));
});

function ApiHandler(req,res)
{
    Api(app,req,res);
}

//Error Pages

function page404(req,res)
{
    res.status(404).send(builder.BuildErrorPage(404));
}

module.exports = {"StartServer": StartServer, "SocketHandler":sockets};