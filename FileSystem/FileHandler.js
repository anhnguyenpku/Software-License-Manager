const fs = require('fs');
const SqlScape = require('sqlstring').escape;

//TODO: Change with settings and Config
const ContentFolder = __dirname + "/../Content/";

var app;
var fh;

class FileHandler
{
    constructor(appHandler)
    {
        app = appHandler;
        fh = this;

        this.vidLen = parseInt(app.Settings.GetSetting("files.vidlen"));
        this.sidLen = parseInt(app.Settings.GetSetting("files.sidlen"));
    }

    /**
     * Register or create a software version, registers new software if the software doesn't exist.
     * @param {String} software The name of the software
     * @param {String} distributor The name of the software distributor
     * @param {String} version The version label
     * @param {Object} file The files to add to the filesystem
     * @param {callbacks.RegisterSoftwareVersion} callback A callback method
     */
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

            //Generate VID
            let vid = fh.GenerateId(fh.vidLen);

            let insertQuery = "INSERT INTO `slm_software_versions` (`id`, `label`, `software`, `date`) VALUES ('" + vid + "', " + SqlScape(version) + ", '" +
            sid + "', `date`='" + GenerateDate() + "');";

            let updateQuery = "UPDATE `slm_software` SET `lastVersion`='" + vid + "' WHERE `id`='" + sid + "';";

            app.Database.Query(insertQuery + updateQuery,function(r,f,err)
            {
                if(err)
                {
                    callback(null,null);
                    return;
                }

                fs.mkdirSync(ContentFolder + sid + "/" + vid);

                if(file)
                {
                    file.mv(ContentFolder + sid + "/" + vid + "/" + file.name,function(err)
                    {
                        if(err)
                        {
                            app.Error("FileSystem", err.message);

                            callback(null,null);
                            return;
                        }

                        callback(sid,vid);
                    });
                }
                else
                {
                    callback(sid,vid);
                }
            });
        });
    }

    /**
     * Register a new software
     * @param {String} software Name of the software
     * @param {String} distributor Name of the software distributor
     */
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

    /**
     * Check if a software exists already
     * @param {String} software Name of the software
     * @param {callbacks.SoftwareExists} callback A callback method
     */
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

    /**
     * Generate a random string
     * @param {Number} length The lenght of the random string
     * @returns String
     */
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

var callbacks = {};

/**
 * @param {String} sid Software Id
 * @param {String} vid Verrsion Id
 */
callbacks.RegisterSoftwareVersion = function(sid,vid) {};

/**
 * @param {Boolean} exists Does the software exist
 * @param {String} sid Software Id
 * @param {Error} err Error
 */
callbacks.SoftwareExists = function(exists,sid,err) {};

/**
 * Get a date string
 * @returns String
 */
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