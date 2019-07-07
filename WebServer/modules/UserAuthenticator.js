const crypto = require('crypto');
const SqlScape = require('sqlstring').escape;

const User = require('./User');

/**
 * @type {UserAuthenticator}
 */
var auth;

var app;

class UserAuthenticator
{
    constructor()
    {
        this.divider = app.Settings.GetSetting("authenticate.divider");
        this.expirationDays = parseInt(app.Settings.GetSetting("authenticate.expiration"));
        this.iterations = parseInt(app.Settings.GetSetting("authenticate.iterations"));
        this.saltLength = parseInt(app.Settings.GetSetting("authenticate.saltlen"));
        this.cookieLength = parseInt(app.Settings.GetSetting("authenticate.cookielen"));
        this.secretLength = parseInt(app.Settings.GetSetting("authenticate.secretlen"));
        this.encoding = app.Settings.GetSetting("encryption.encoding");

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

        app.Database.Query("SELECT * FROM `slm_users` WHERE `login`=" + login, function(results, fields, err)
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

                app.Database.QueryEmpty(query);

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
    async Register(login, password, callback)
    {
        let secret = this.SecurePassword(password);

        app.Database.Query("INSERT IGNORE INTO `slm_users` (`login`,`secret`) VALUES (" + SqlScape(login) +
                ", " + SqlScape(secret) +")",function(results,fields,err)
        {
            callback(err);
        });
    }

    /**
     * Register a user and set them in a group
     * @param {String} login A string with the login of the user.
     * @param {String} password A hashed string from the cient.
     * @param {String} group The id of the group the user should be added to
     * @param {callbacks.Register} callback A callback method
     */
    async RegisterWithGroup(login, password, group, callback)
    {
        let secret = this.SecurePassword(password);
        let auth = this;

        app.Database.GetGroupByName(group,function(groups,fields,grErr)
        {
            if(grErr)
            {
                callback(grErr);
                return;
            }
            else if(groups.length <= 0)
            {
                let nErr = new Error("This group doesn't exist!");
                callback(nErr);
                return;
            }

            var groupId = groups[0].id;

            app.Database.Query("INSERT IGNORE INTO `slm_users` (`login`,`secret`, `group`) VALUES (" + SqlScape(login) + 
                ", " + SqlScape(secret) + ", " + SqlScape(groupId) + ")",function(results,fields,err)
            {
                if(err)
                {
                    callback(err);
                    return;
                }

                callback(null);
            });
        });     
    }

    /**
     * Validate a cookie token from the user
     * @param {String} cookie The cookie from the user.
     * @param {SessionInfo} sessioninfo The session info of the user.
     * @param {callbacks.ValidateCookie} callback A callback method.
     */
    async ValidateCookie(cookie,sessioninfo,callback)
    {
        cookie = SqlScape(cookie);
        
        app.Database.Query("SELECT * FROM `slm_user_sessions` WHERE `cookie`=" + cookie + " AND `ipadress`='" + sessioninfo.ip + "'",
        function(results,fields,err)
        {
            if(err)
            {
                callback(false,null,err);
                return;
            }
            else if(results.length !== 1)
            {
                callback(false,null,null);
                return;
            }

            let session = results[0];

            let date = new Date();
            let exdate = new Date(session.expirationdate);

            if(date < exdate)
            {
                var user = new User(session.userid);
                user.Load(function(err)
                {
                    if(err)
                    {
                        callback(false,null,err);
                        return;
                    }

                    callback(true,user,null);
                });
            }
            else
            {
                let removeCookieQuery = "DELETE FROM `slm_user_sessions` WHERE `id`=" + session.id;
                app.Database.QueryEmpty(removeCookieQuery);

                callback(false,null,null);
            }
        });
    }

    /**
     * 
     * @param {String} login The login of the user
     * @param {String} oldPWD A hashed string from the old password
     * @param {String} newPWD A hashed string from the new password
     * @param {*} callback A callcack method TODO:Give an error messge
     */
    async ChangePassword(login, oldPWD, newPWD,callback)
    {
        app.Database.Query("SELECT * FROM `slm_users` WHERE `login`=" + SqlScape(login),function(results, fields, err)
        {
            if(err)
            {
                callback(false);
                return;
            }
            else if(results.length > 1)
            {
                callback(false);
                return;
            }
            else if(results.length === 0)
            {
                callback(false);
                return;
            }

            let userdata = results[0];
            let secret = userdata.secret.split(auth.divider);

            let hash = auth.GetNakedHash(oldPWD,secret[1]);

            if(hash === secret[0])
            {
                let newSecret = auth.SecurePassword(newPWD);

                app.Database.Query("UPDATE `secret`='" + newSecret + "' WHERE `id`=" + userdata.id + "",function(results,fields,err)
                {
                    if(err)
                    {
                        callback(false);
                    }
                    else
                    {
                        callback(true);
                    }
                });
            }
            else
            {
                callback(null);
            }
        });        
    }
    
    /**
     * Generate a random key
     * @param {Number} length The length of the key in bytes.
     * @returns String
     */
    GenerateKey(length)
    {
        return crypto.randomBytes(length).toString('base64')
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

    static SetupModule(appHandler)
    {
        app = appHandler;
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
callbacks.ValidateCookie = function(success,user,err) {};


module.exports = UserAuthenticator;