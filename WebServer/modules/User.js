const APP = require('../../modules/AppHandler');
/**
 * @type {APP}
 */
var app;

class User
{
    constructor (id)
    {
        this.id = id;
        this.groupId;
        this.login;
        this.group;
        this.permissions;
    }

    Load(callback)
    {
        const user = this;

        //Query for 
        app.Database.GetUserById(this.id,function(results,fields,err)
        {
            if(err)
            {
                callback(err);
                return;
            }
            else if(results.length == 0)
            {
                callback(new Error("User doesn't exist!"));
                return;
            }

            const usr = results[0];
            user.groupId = usr.group;
            user.login = usr.login;

            user.LoadPermissions(callback);
        });
    }

    LoadPermissions(callback)
    {
        const user = this;
        app.Database.GetGroupById(this.groupId,function(results,fields,err)
        {
            if(err)
            {
                callback(err);
                return;
            }
            else if(results.length == 0)
            {
                callback(new Error("Group doesn't exist!"));
                return;
            }

            const grp = results[0];
            user.group = grp;
            user.permissions = JSON.parse(grp.permissions);

            callback();
        });
    }

    static SetupModule(appHandler)
    {
        app = appHandler;
    }
}

module.exports = User;