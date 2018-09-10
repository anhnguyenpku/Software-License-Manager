const fs = require('fs');
const SqlScape = require('sqlstring').escape;

const ContentFolder = __dirname + "/../Content/";

let app;
let fh;

class FileHandler
{
    constructor(appHandler)
    {
        app = appHandler;
        fh = this;

        this.vidLen = parseInt(app.Settings.GetSetting("files.vidlen"));
        this.sidLen = parseInt(app.Settings.GetSetting("files.sidlen"));
    }

    RegisterSofwareVersion(software, distributor, version, file)
    {
        this.SoftwareExists(software,function(exists,sid,err)
        {
            if(err) return;

            if(!exists)
            {
                sid = fh.RegisterSoftware(software,distributor);
            }

            //Generate VUID
            let vid = fh.GenerateId(fh.vidLen);
            app.Database.QueryEmpty("INSERT INTO `slm_software_versions` (`id`, `label`, `software`) VALUES ('" + vid + "', " + SqlScape(version) + ", '" + sid + "');");

            fs.mkdirSync(ContentFolder + sid + "/" + vid);

            file.mv(ContentFolder + sid + "/" + vid + "/" + file.name,function(err)
            {
                if(err)
                {
                    app.Error("FileSystem", err.message);
                }
            });
        });
    }

    RegisterSoftware(software,distributor)
    {
        //SqlScape
        software = SqlScape(software);
        distributor = SqlScape(distributor);

        //Generate SUID
        let sid = this.GenerateId(this.sidLen);
        //Create Folder
        fs.mkdirSync(ContentFolder + sid);

        //Register in the database

        app.Database.QueryEmpty("INSERT INTO `slm_software` (`id`, `name`, `distributor`) VALUES ('" + sid + "', " + software + " , " + distributor + ");");

        return sid;
    }

    SoftwareExists(software,callback)
    {
        software = SqlScape(software);

        app.Database.Query("SELECT * FROM `slm_software` WHERE `name`=" + software,function(results,fields,err)
        {
            if(err)
            {
                app.Error("FileSystem", err.message);
                callback(null,null,err);
                return;
            }

            if(results.length == 0)
            {
                callback(false,null,null);
            }
            else
            {
                callback(true,results[0].id,null);
            }
        });
    }

    ServeFile(software,version,key)
    {
        //Build Offline Key

        //Encrypt executables

        //Group Files

        //Build installer

        //Send File
    }

    GenerateId(length)
    {
        let rndStr = "";

        for (let i = 0; i < length; i++)
        {
            let randomFloat = Math.random();
            let randomNum = Math.floor(randomFloat * (alphabet.length-1));

            rndStr += alphabet[randomNum];    
        }
        
        return rndStr;
    }
}

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

module.exports = FileHandler;