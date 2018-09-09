const crypto = require('crypto');

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const divider = ':';

let auth;

class UserAuthenticator
{
    constructor(database,settings)
    {
        this.Database = database;
        this.Settings = settings;

        this.divider = this.Settings.GetSetting("authenticator.divider");
        this.expirationDays = this.Settings.GetSetting("authenticator.expiration");
        this.iterations = this.Settings.GetSetting("authenticator.iterations");
        this.saltLength = this.Settings.GetSetting("authenticator.saltlen");
        this.cookieLength = this.Settings.GetSetting("authenticator.cookielen");
        this.secretLength = this.Settings.GetSetting("authenticator.secretlen");

        auth = this;
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
            let secret = userdata.secret.split(auth.divider);

            let hash = auth.GetNakedHash(password,secret[1]);

            //Check password 
            if(hash === secret[0])
            {
                let cookieSecret = auth.GenerateKey(auth.cookieLength);
                
                let date = new Date();
                date.setDate(date.getDate() + 5);

                let query = "INSERT INTO `licenseServer`.`sml_user_sessions` (`userid`, `cookie`, `ipadress`, `expirationdate`) VALUES (" +
                    userdata.id + ", " + cookieSecret + ", " + sessioninfo.ip + ", " + date.toDateString() + ");";

                auth.Database.QueryEmpty(query);

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
                let remcCookieQuery = "DELETE FROM `sml_user_sessions` WHERE `id`=" + session.id;
                auth.Database.QueryEmpty(removeCookieQuery);

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
        let salt = this.GenerateKey(this.saltLength);
        let hash = crypto.pbkdf2Sync(password,salt,this.iterations,this.secretLength,'sha512').toString('hex');

        let output = hash + divider + salt;
        return output;
    }

    GetNakedHash(password,salt)
    {
        let hash = crypto.pbkdf2Sync(password,salt,100000,512,'sha512').toString('hex');
        return hash;
    }
}

module.exports = UserAuthenticator;