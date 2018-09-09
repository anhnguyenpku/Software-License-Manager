const crypto = require('crypto');

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const divider = ':';

class UserAuthenticator
{
    constructor(database)
    {
        this.Database = database;
        this.Settings = [];

        this.LoadDatabaseSettings();
    }

    async LoadDatabaseSettings()
    {
        this.Database.Query("SELCET * FROM `sml_settings` WHERE `key` LIKE 'authenticate.%'",function(results,fields,err)
        {
            if(err)
            {
                throw err;
            }

            this.Settings = results;
        });
    }

    async Authenticate(login, password, sessioninfo, callback)
    {
        this.Database.Query("SELECT * FROM `slm_users` WHERE `login`='" + login + "'",function(results, fields, err)
        {
            if(err)
            {
                callback(null,false,err);
                return;
            }
            else if(results.length > 0)
            {
                callback(null,false,"More users with the same login.");
                return;
            }

            let userdata = results[0];
            let secret = userdata.secret.split(divider);

            let hash = this.GetNakedHash(password,secret[1]);

            //Check password 
            if(hash === secret[0])
            {
                let cookieSecret = this.GenerateKey(25);
                
                let date = new Date();
                date.setDate(date.getDate() + 5);

                let query = "INSERT INTO `licenseServer`.`sml_user_sessions` (`userid`, `cookie`, `ipadress`, `expirationdate`) VALUES (" +
                    userdata.id + ", " + cookieSecret + ", " + sessioninfo.ip + ", " + date.toDateString() + ");";

                this.Database.Query(query);

                callback(cookieSecret,false,null);
            }
            else
            {
                callback(null,false,null);
            }
        });
    }

    async Register(login, password)
    {
        let secret = this.SecurePassword(password);

    }

    async ValidateCookie(cookie,sessioninfo,callback)
    {
        this.Database.Query("SELECT * FROM `sml_user_settings` WHERE `cookie`='" + cookie + "' AND `ipadress`='" + sessioninfo.ip + "'",
        function(results,fields,err)
        {
            if(err)
            {
                callback(false,err);
                return;
            }
            else if(results.length !== 1)
            {
                callback(false,null);
                return;
            }

            let session = results[0];

            let date = new Date();
            let exdate = new Date(session.expirationdate);


            if(date < exdate)
            {
                callback(true,null);
            }
            else
            {
                callback(false,null);
            }
        });
    }

    async ChangePassword(oldPWD, newPWD)
    {
        
    }
    
    GenerateKey(length)
    {
        function RandomLetter()
        {
            let randomBytesNum = crypto.randomBytes(1).readInt8(0) + 128;
            let randomFloat = randomBytesNum / 255;
            let randomNum = Math.floor(randomFloat * (alphabet.length-1));

            return alphabet[randomNum];
        }

        let rndStr = "";

        for (let i = 0; i < length; i++)
        {
            rndStr += RandomLetter();    
        }

        return rndStr;
    }

    SecurePassword(password)
    {
        //Generate Salt
        let salt = this.GenerateKey(25);
        let hash = crypto.pbkdf2Sync(password,salt,100000,512,'sha512').toString('hex');

        let output = hash + divider + salt;
        return output;
    }

    GetNakedHash(password,salt)
    {
        let hash = crypto.pbkdf2Sync(password,salt,100000,512,'sha512').toString('hex');
        return hash;
    }
}

module.export = UserAuthenticator;