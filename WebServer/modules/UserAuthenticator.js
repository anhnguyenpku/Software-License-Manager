const crypto = require('crypto');
const SqlScape = require('sqlstring').escape;

const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

let auth;

class UserAuthenticator
{
    constructor(database,settings)
    {
        this.Database = database;
        this.Settings = settings;

        this.divider = this.Settings.GetSetting("authenticate.divider");
        this.expirationDays = parseInt(this.Settings.GetSetting("authenticate.expiration"));
        this.iterations = parseInt(this.Settings.GetSetting("authenticate.iterations"));
        this.saltLength = parseInt(this.Settings.GetSetting("authenticate.saltlen"));
        this.cookieLength = parseInt(this.Settings.GetSetting("authenticate.cookielen"));
        this.secretLength = parseInt(this.Settings.GetSetting("authenticate.secretlen"));

        auth = this;
    }

    /**
     * Authenticate the user.
     * @param {String} login A string with the login of the user.
     * @param {String} password A hashed string from the client.
     * @param {SessionInfo} sessioninfo The session info of the user.
     * @param {callbacks.Authenticate} callback A callback method.
     */
    async Authenticate(login, password, sessioninfo, callback)
    {
        login = SqlScape(login);

        this.Database.Query("SELECT * FROM `slm_users` WHERE `login`=" + login,function(results, fields, err)
        {
            if(err)
            {
                callback(null,false,err.message);
                return;
            }
            else if(results.length > 1)
            {
                callback(null,false,"More users with the same login.");
                return;
            }
            else if(results.length === 0)
            {
                callback(null,false,"User does not exist.");
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

                let query = "INSERT INTO `slm_user_sessions` (`userid`, `cookie`, `ipadress`, `expirationdate`) VALUES (" +
                    userdata.id + ", '" + cookieSecret + "', '" + sessioninfo.ip + "', '" + date.toDateString() + "');";

                auth.Database.QueryEmpty(query);

                callback(cookieSecret,true,null);
            }
            else
            {
                callback(null,false,"Wrong password!");
            }
        });
    }

    /**
     * Register a user
     * @param {String} login A string with the login of the user.
     * @param {String} password A hashed string from the client.
     * @param {callbacks.Register} callback A callback method.
     */
    async Register(login, password,callback)
    {
        login = SqlScape(login);
        password = SqlScape(password);

        let secret = this.SecurePassword(password);

        this.Database.Query("INSERT IGNORE INTO `slm_users` (`login`,`secret`) VALUES ('" + login + "', '" + secret +"')",function(results,fields,err)
        {
            callback(err);
        });
    }

    /**
     * 
     * @param {String} cookie The cookie from the user.
     * @param {SessionInfo} sessioninfo The session info of the user.
     * @param {callbacks.ValidateCookie} callback A callback method.
     */
    async ValidateCookie(cookie,sessioninfo,callback)
    {
        cookie = SqlScape(cookie);

        this.Database.Query("SELECT * FROM `slm_user_sessions` WHERE `cookie`=" + cookie + " AND `ipadress`='" + sessioninfo.ip + "'",
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
                let remcCookieQuery = "DELETE FROM `slm_user_sessions` WHERE `id`=" + session.id;
                auth.Database.QueryEmpty(removeCookieQuery);

                callback(false,null);
            }
        });
    }

    /**
     * NOT YET IMPLEMENTED
     * @param {String} oldPWD 
     * @param {String} newPWD 
     */
    async ChangePassword(oldPWD, newPWD)
    {
        oldPWD = SqlScape(oldPWD);
        newPWD = SqlScape(newPWD);
    }
    
    /**
     * Generate a random key
     * @param {Number} length The length of the key.
     * @returns String
     */
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

    /**
     * Secure a password so it can be safley added to the database
     * @param {String} password Password to secure.
     * @returns String
     */
    SecurePassword(password)
    {
        //Generate Salt
        let salt = this.GenerateKey(this.saltLength);
        let hash = crypto.pbkdf2Sync(password,salt,this.iterations,this.secretLength,'sha512').toString('hex');

        let output = hash + this.divider + salt;
        return output;
    }

    /**
     * Rebuild the password to check if it matches the one from the database.
     * @param {String} password Password to hash
     * @param {String} salt Salt key to hash with
     * @returns String
     */
    GetNakedHash(password,salt)
    {
        let hash = crypto.pbkdf2Sync(password,salt,this.iterations,this.secretLength,'sha512').toString('hex');
        return hash;
    }

    /**
     * HMAC sha512 a password
     * @param {String} key The key to HMAC with
     * @param {String} password Password to HMAC
     * @returns String
     */
    Hmac(key,password)
    {
        let hmac = crypto.createHmac('sha512',key);
        hmac.update(password);

        return hmac.digest('hex');
    }
}

var callbacks = {};

/**
 * callback method
 * @param {string} cookie A cookie string that the user's browser will add to validate that he/she logged in.
 * @param {Boolean} success Boolean thzt says if the authentication was a success
 * @param {Error} err Error
 */
callbacks.Authenticate = function(cookie,success,err) {};

/**
 * callback method
 * @param {Error} err Error
 */
callbacks.Register = function(err) {};

/**
 * callback method
 * @param {Boolean} success Boolean thzt says if the validation was a success.
 * @param {Error} err Error
 */
callbacks.ValidateCookie = function(success,err) {};


module.exports = UserAuthenticator;