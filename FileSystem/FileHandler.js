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

    RegisterSofwareVersion(software, distributor, version, file, callback)
    {
        this.SoftwareExists(software,function(exists,sid,err)
        {
            if(err)
            {
                callback(null,null);
                return;
            }

            if(!exists)
            {
                sid = fh.RegisterSoftware(software,distributor);
            }

            //Generate VUID
            let vid = fh.GenerateId(fh.vidLen);
            app.Database.QueryEmpty("INSERT INTO `slm_software_versions` (`id`, `label`, `software`, `date`) VALUES ('" + vid + "', " + SqlScape(version) + ", '" +
                sid + "', `date`='" + GenerateDate() + "');",function(r,f,err)
            {
                if(err)
                {
                    callback(null,null);
                    return;
                }

                fs.mkdirSync(ContentFolder + sid + "/" + vid);

                file.mv(ContentFolder + sid + "/" + vid + "/" + file.name,function(err)
                {
                    if(err)
                    {
                        app.Error("FileSystem", err.message);
                    }

                    callback(sid,vid);
                });
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
        app.Database.QueryEmpty("INSERT INTO `slm_software` (`id`, `name`, `distributor`, `date`) VALUES ('" + sid + "', " + software + " , " + distributor + ", '" + GenerateDate() + "');");

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

function GenerateDate()
{
    let date = new Date();

    let dateStr = date.getFullYear().toString() + zero(date.getMonth()+1).toString() + zero(date.getDate()).toString() +
            zero(date.getHours()).toString() + zero(date.getMinutes()).toString() + zero(date.getSeconds()).toString();
    
    return dateStr;
}

function zero(n)
{
    return n<10 ? '0'+n : n;
}